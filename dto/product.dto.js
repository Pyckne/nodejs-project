class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.price = product.price;
    this.category = product.category;
    this.stock = product.stock;
    this.status = product.status;
  }
}

module.exports = ProductDTO;