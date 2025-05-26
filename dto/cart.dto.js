class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.user = cart.user_id || null;
    this.state = cart.state;
    this.products = cart.products.map(p => ({
      product: {
        id: p.product._id,
        title: p.product.title,
        price: p.product.price,
        category: p.product.category
      },
      quantity: p.quantity
    }));
  }
}

module.exports = CartDTO;