const IUserRepository = require('../../domain/repositories/IUserRepository');
const dbConnection = require('../database/DatabaseConnection');
const User = require('../../domain/entities/User');

// 🗄️ Repository que usa MySQL para persistencia de usuarios
class UserRepository extends IUserRepository {
  constructor() {
    super();
  }

  // 🔍 Obtener todos los usuarios
  async findAll() {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users ORDER BY createdAt DESC'
      );
      
      return rows.map(row => this.mapRowToUser(row));
    } catch (error) {
      console.error('❌ Error in findAll:', error);
      throw new Error('Database error while fetching users');
    }
  }

  // 🔍 Buscar usuario por ID
  async findById(id) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findById:', error);
      throw new Error('Database error while fetching user');
    }
  }

  // 🔍 Buscar usuario por email
  async findByEmail(email) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE email = ?',
        [email]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findByEmail:', error);
      throw new Error('Database error while fetching user by email');
    }
  }

  // 🔍 Buscar usuario por username
  async findByUsername(username) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id, username, email, firstName, lastName, role, isActive, createdAt, updatedAt FROM users WHERE username = ?',
        [username]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToUser(rows[0]);
    } catch (error) {
      console.error('❌ Error in findByUsername:', error);
      throw new Error('Database error while fetching user by username');
    }
  }

  // ➕ Crear nuevo usuario
  async create(userData) {
    try {
      const pool = await dbConnection.getPool();
      
      const [result] = await pool.execute(
        `INSERT INTO users (username, email, password, firstName, lastName, role, isActive) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.username,
          userData.email,
          userData.password, // Ya debe venir hasheado del Use Case
          userData.firstName,
          userData.lastName,
          userData.role || 'author',
          userData.isActive !== undefined ? userData.isActive : true
        ]
      );
      
      // Buscar el usuario recién creado
      return await this.findById(result.insertId);
      
    } catch (error) {
      console.error('❌ Error in create:', error);
      
      // Manejar errores específicos de MySQL
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
        throw new Error('User with this email or username already exists');
      }
      
      throw new Error('Database error while creating user');
    }
  }

  // ✏️ Actualizar usuario
  async update(id, userData) {
    try {
      const pool = await dbConnection.getPool();
      
      // Verificar que el usuario existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      // Construir query dinámico solo con campos que se van a actualizar
      const fieldsToUpdate = [];
      const values = [];
      
      if (userData.username !== undefined) {
        fieldsToUpdate.push('username = ?');
        values.push(userData.username);
      }
      if (userData.email !== undefined) {
        fieldsToUpdate.push('email = ?');
        values.push(userData.email);
      }
      if (userData.firstName !== undefined) {
        fieldsToUpdate.push('firstName = ?');
        values.push(userData.firstName);
      }
      if (userData.lastName !== undefined) {
        fieldsToUpdate.push('lastName = ?');
        values.push(userData.lastName);
      }
      if (userData.role !== undefined) {
        fieldsToUpdate.push('role = ?');
        values.push(userData.role);
      }
      if (userData.isActive !== undefined) {
        fieldsToUpdate.push('isActive = ?');
        values.push(userData.isActive);
      }
      
      if (fieldsToUpdate.length === 0) {
        return existingUser; // No hay nada que actualizar
      }
      
      // Agregar updatedAt
      fieldsToUpdate.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id); // Para el WHERE
      
      const query = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
      
      await pool.execute(query, values);
      
      // Retornar usuario actualizado
      return await this.findById(id);
      
    } catch (error) {
      console.error('❌ Error in update:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        }
      }
      
      throw new Error('Database error while updating user');
    }
  }

  // 🗑️ Eliminar usuario
  async delete(id) {
    try {
      const pool = await dbConnection.getPool();
      
      // Verificar que el usuario existe
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      
      return result.affectedRows > 0;
      
    } catch (error) {
      console.error('❌ Error in delete:', error);
      throw new Error('Database error while deleting user');
    }
  }

  // ✅ Verificar si existe usuario con email o username
  async exists(email, username) {
    try {
      const pool = await dbConnection.getPool();
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
        [email, username]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('❌ Error in exists:', error);
      throw new Error('Database error while checking user existence');
    }
  }

  // 🔄 Mapear fila de MySQL a objeto User
  mapRowToUser(row) {
    return new User({
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.role,
      isActive: Boolean(row.isActive),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }
}

module.exports = UserRepository;
