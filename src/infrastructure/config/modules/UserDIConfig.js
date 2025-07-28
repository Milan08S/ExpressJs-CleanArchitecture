// ✅ Configuración modular para User con MYSQL
class UserDIConfig {
  static register(container) {
    // 🗄️ Repository con persistencia MySQL
    const UserRepository = require('../../repositories/UserRepository');
    const userRepository = new UserRepository();
    container.register('userRepository', userRepository);

    // Use Cases (sin cambios - siguen usando la interfaz)
    const CreateUserUseCase = require('../../../application/usecases/UserUseCases/CreateUserUseCase');
    const UpdateUserProfileUseCase = require('../../../application/usecases/UserUseCases/UpdateUserProfileUseCase');
    const DeactivateUserUseCase = require('../../../application/usecases/UserUseCases/DeactivateUserUseCase');
    const ActivateUserUseCase = require('../../../application/usecases/UserUseCases/ActivateUserUseCase');

    container.register('createUserUseCase', new CreateUserUseCase(userRepository));
    container.register('updateUserProfileUseCase', new UpdateUserProfileUseCase(userRepository));
    container.register('deactivateUserUseCase', new DeactivateUserUseCase(userRepository));
    container.register('activateUserUseCase', new ActivateUserUseCase(userRepository));

    // Controllers (sin cambios)
    const UserController = require('../../controllers/UserController');
    const userController = new UserController(
      container.get('createUserUseCase'),
      container.get('updateUserProfileUseCase'),
      container.get('deactivateUserUseCase'),
      container.get('activateUserUseCase'),
      userRepository
    );
    container.register('userController', userController);
    
    console.log('✅ UserDIConfig: User dependencies with MySQL registered successfully');
  }
}

module.exports = UserDIConfig;
