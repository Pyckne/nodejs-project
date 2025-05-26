const ProductDAO = require('../daos/product.dao');

class ProductRepository {
  async getAllProducts() {
    return ProductDAO.getAll();
  }

  async createProduct(productData) {
    return ProductDAO.create(productData);
  }

}

module.exports = new ProductRepository();