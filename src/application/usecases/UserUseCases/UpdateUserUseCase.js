class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updateData) {
    // Validate user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Create User entity with current data
    const User = require('../../domain/entities/User');
    const user = new User(existingUser);

    // Update profile using domain method
    user.updateProfile(updateData);

    // Persist changes
    return await this.userRepository.update(userId, user);
  }
}

module.exports = UpdateUserUseCase;
