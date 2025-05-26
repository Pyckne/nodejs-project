const Cart = require('../../models/Cart');

class CartDAO {
  async getAll() {
    return Cart.find().populate('products.product');
  }

  async getById(id) {
    return Cart.findById(id).populate('products.product');
  }

  async create(data) {
    return Cart.create(data);
  }

  async update(id, updateData) {
    return Cart.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return Cart.findByIdAndDelete(id);
  }
}

module.exports = new CartDAO();