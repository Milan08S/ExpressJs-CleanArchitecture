const DIContainer = require('../config/DIContainer');

// ✅ Factory SIMPLE para crear controllers con todas sus dependencias
class ControllerFactory {
  constructor() {
    this.container = new DIContainer();
  }

  createUserController() {
    return this.container.get('userController');
  }

}

module.exports = ControllerFactory;
