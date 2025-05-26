const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    default: uuidv4, // Genera un UUID único
    unique: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String, // Se guarda el email del usuario
    required: true
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);