class ActivateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, requestingUserId) {
    // 1. Verificar permisos del usuario solicitante
    const requestingUserData = await this.userRepository.findById(requestingUserId);
    if (!requestingUserData) {
      throw new Error('Requesting user not found');
    }

    const User = require('../../domain/entities/User');
    const requestingUser = new User(requestingUserData);

    // 2. ✅ USAR MÉTODO DE LA ENTIDAD - hasPermission()
    if (!requestingUser.hasPermission('manage_users')) {
      throw new Error('Insufficient permissions to activate users');
    }

    // 3. Obtener el usuario a activar
    const targetUserData = await this.userRepository.findById(userId);
    if (!targetUserData) {
      throw new Error('Target user not found');
    }

    const targetUser = new User(targetUserData);

    // 4. ✅ USAR MÉTODO DE LA ENTIDAD - activate()
    targetUser.activate();

    // 5. ✅ USAR MÉTODO DE LA ENTIDAD - getFullName() para logging
    console.log(`User activated: ${targetUser.getFullName()}`);

    // 6. Guardar cambios
    return await this.userRepository.update(userId, targetUser);
  }
}

module.exports = ActivateUserUseCase;
