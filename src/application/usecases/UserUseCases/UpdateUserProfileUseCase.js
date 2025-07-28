class UpdateUserProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, profileData) {
    // 1. Obtener el usuario existente
    const existingUserData = await this.userRepository.findById(userId);
    if (!existingUserData) {
      throw new Error('User not found');
    }

    // 2. Crear instancia de la entidad User
    const User = require('../../domain/entities/User');
    const user = new User(existingUserData);

    // 3. ✅ USAR MÉTODO DE LA ENTIDAD - updateProfile()
    user.updateProfile(profileData);

    // 4. ✅ USAR MÉTODO DE LA ENTIDAD - getFullName() para logging
    console.log(`Profile updated for: ${user.getFullName()}`);

    // 5. Guardar los cambios
    return await this.userRepository.update(userId, user);
  }
}

module.exports = UpdateUserProfileUseCase;
