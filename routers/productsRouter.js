const express = require('express');
const passport = require('passport');
const { authorizeRole } = require('../middlewares/auth');
const Product = require('../models/Product');
const ProductDTO = require('../dto/product.dto');
const router = express.Router();

// GET Obtener todos los productos con paginación y filtros
router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;
  const filter = query ? { $or: [{ category: query }, { status: query }] } : {};
  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
  };

  try {
    const products = await Product.paginate(filter, options);
    const productsDTO = products.docs.map(p => new ProductDTO(p));

    res.json({
      status: 'success',
      payload: productsDTO,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
      nextLink: products.hasNextPage ? `/products?page=${products.nextPage}` : null
  });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// POST Crear un nuevo producto (solo administrador)
router.post('/', passport.authenticate('jwt', { session: false }), authorizeRole(['admin']), async (req, res) => {
  const { title, description, price, stock, category, thumbnails, code } = req.body;

  try {
    if (!title || !description || !price || !stock || !category || !code) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    const existingProduct = await Product.findOne({ code });
    if (existingProduct) {
      return res.status(400).json({ message: 'El código del producto ya existe' });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      status: true,
      stock,
      category,
      thumbnails,
      code
    });

    await newProduct.save();
    res.status(201).json(new ProductDTO(newProduct));
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ message: 'Error al crear el producto' });
  }
});

// GET Obtener un producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    const productDTO = new ProductDTO(product);
    res.json(productDTO);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
});

// PUT Actualizar un producto por ID (solo administrador)
router.put('/:pid', passport.authenticate('jwt', { session: false }), authorizeRole(['admin']), async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(new ProductDTO(updatedProduct));
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
});

// DELETE Eliminar un producto por ID (solo administrador)
router.delete('/:pid', passport.authenticate('jwt', { session: false }), authorizeRole(['admin']), async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
});

module.exports = router;