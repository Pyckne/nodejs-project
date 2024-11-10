const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // Importar el plugin

// Definir el esquema para el producto
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnails: { type: [String], default: [] },
  code: { type: String, required: true, unique: true }
});

// Aplicar el plugin de paginación
productSchema.plugin(mongoosePaginate);

// Crear el modelo de Producto basado en el esquema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;