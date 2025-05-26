const Product = require('../models/Product');

class ProductDAO {
  async getAll() {
    return Product.find();
  }

  async getById(id) {
    return Product.findById(id);
  }

  async create(data) {
    return Product.create(data);
  }

  async update(id, updateData) {
    return Product.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }
}

module.exports = new ProductDAO();
