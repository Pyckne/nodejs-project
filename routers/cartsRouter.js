const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartsFilePath = path.join(__dirname, '../data/carrito.json');
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Helper function para leer el archivo de carritos
const readCartsFile = () => {
  const data = fs.readFileSync(cartsFilePath);
  return JSON.parse(data);
};

// Helper function para leer el archivo de productos
const readProductsFile = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// POST Crear un nuevo carrito
router.post('/', (req, res) => {
  const carts = readCartsFile();
  
  // Crear un nuevo carrito con ID autogenerado
  const newCart = {
    id: carts.length ? carts[carts.length - 1].id + 1 : 1,
    products: []
  };

  carts.push(newCart);
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

  res.status(201).json(newCart);
});

// GET Obtener los productos de un carrito específico
router.get('/:cid', (req, res) => {
  const carts = readCartsFile();
  const cart = carts.find(c => c.id === parseInt(req.params.cid));

  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// POST Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readCartsFile();
  const products = readProductsFile();

  // Buscar el carrito
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  // Buscar el producto por ID
  const product = products.find(p => p.id === parseInt(req.params.pid));
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  // Verificar si el producto ya existe en el carrito
  const cartProduct = cart.products.find(p => p.product === product.id);

  if (cartProduct) {
    // Si el producto ya existe en el carrito, incrementar la cantidad
    cartProduct.quantity += 1;
  } else {
    // Si no existe, agregar el producto al carrito
    cart.products.push({
      product: product.id,
      quantity: 1
    });
  }

  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

  res.status(200).json(cart);
});

module.exports = router;