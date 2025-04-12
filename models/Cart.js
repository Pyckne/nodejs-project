// models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 }
      }
    ],
    state: {
      type: String,
      enum: ['reserved', 'paid', 'delivered'],
      default: 'reserved'
    }
  });
  
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;