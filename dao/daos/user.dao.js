const User = require('../../models/User');

class UserDAO {
  async getAll() {
    return User.find();
  }

  async getById(id) {
    return User.findById(id);
  }

  async getByEmail(email) {
    return User.findOne({ email });
  }

  async create(data) {
    return User.create(data);
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return User.findByIdAndDelete(id);
  }
}

module.exports = new UserDAO();