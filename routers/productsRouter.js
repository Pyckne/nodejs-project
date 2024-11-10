const express = require('express');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();

const productsFilePath = path.join(__dirname, '../data/productos.json');

// Helper function para leer el archivo de productos
const readProductsFile = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// GET Obtener todos los productos con límite
router.post('/', async (req, res) => {
  const { title, description, price, stock, category, thumbnails, code } = req.body;

  try {
    // Validar campos obligatorios
    if (!title || !description || !price || !stock || !category || !code) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    // Verificar si el código ya existe en la base de datos
    const existingProduct = await Product.findOne({ code });
    if (existingProduct) {
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    // Crear el nuevo producto
    const newProduct = new Product({
      title,
      description,
      price,
      status: true, // Status por defecto a true
      stock,
      category,
      thumbnails,
      code
    });

    // Guardar el producto
    await newProduct.save();  

    // Devolver el nuevo producto creado
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});


// GET PID Obtener un producto por ID
router.get('/:pid', (req, res) => {
  const products = readProductsFile();
  const product = products.find(p => p.id === parseInt(req.params.pid));

  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  res.json(product);
});

// POST Crear un nuevo producto
router.post('/', (req, res) => {
  const products = readProductsFile();
  const newProduct = req.body;

  // Validar campos
  const { title, description, code, price, status, stock, category, thumbnails } = newProduct;
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios excepto thumbnails' });
  }

  // Asignar ID generado aleatoriamente
  newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
  newProduct.status = newProduct.status !== undefined ? newProduct.status : true; // Status por defecto a true

  products.push(newProduct);
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  res.status(201).json(newProduct);
});

// POST Actualizar un producto por ID
router.put('/:pid', (req, res) => {
  const products = readProductsFile();
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.pid));

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  // PUT Actualizar el producto
  const updatedProduct = { ...products[productIndex], ...req.body };
  
  // Asegurar que no se puede actualizar el ID
  updatedProduct.id = products[productIndex].id;

  products[productIndex] = updatedProduct;
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  res.json(updatedProduct);
});

// DELETE Eliminar un producto por ID
router.delete('/:pid', (req, res) => {
  let products = readProductsFile();
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.pid));

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  products = products.filter(p => p.id !== parseInt(req.params.pid));
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  res.json({ message: 'Producto eliminado' });
});

module.exports = router;