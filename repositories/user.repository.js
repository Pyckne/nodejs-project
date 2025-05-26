const userDAO = require('../dao/daos/user.dao');
const UserDTO = require('../dto/user.dto');

class UserRepository {
  async getById(id) {
    const user = await userDAO.getById(id);
    return new UserDTO(user);
  }

  async getByEmail(email) {
    const user = await userDAO.getByEmail(email);
    return new UserDTO(user);
  }

  async createUser(data) {
    const user = await userDAO.create(data);
    return new UserDTO(user);
  }
}

module.exports = new UserRepository();