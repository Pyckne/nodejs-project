const express = require('express');
const router = express.Router();
const Productos = require('../models/Product');
const Cart = require('../models/Cart');
const authFromCookie = require('../middlewares/authFromCookie');

// 🛡 Middleware que asigna el usuario desde el JWT en cookie
router.use(authFromCookie);

// Vista principal con productos
router.get('/home', async (req, res) => {
  try {
    const filter = {};
    const options = { page: 1, limit: 10 };
    const products = await Productos.paginate(filter, options);

    const cartId = req.session.cartId || '';
    const user = req.user;
    const logoutMessage = req.query.logout === '1'; // ✅

    const productsModified = products.docs.map(product => ({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock,
    }));

    res.render('home', {
      user,
      cartId,
      logoutMessage, // ✅
      products: productsModified,
      totalPages: products.totalPages,
      page: products.page,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

// Vista de detalles del producto
router.get('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await Productos.findById(productId);
    const cartId = req.session.cartId;
    const user = req.user;

    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('productDetails', {
      user,
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
      },
      cartId,
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error al obtener el producto');
  }
});

// Vista con productos en tiempo real
router.get('/realtimeproducts', (req, res) => {
  const user = req.user;
  res.render('realTimeProducts', { user });
});

// Vista del carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    const user = req.user;

    if (!cart) return res.status(404).send('Carrito no encontrado');

    const productsModified = cart.products.map(item => ({
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    }));

    res.render('cartDetails', {
      user,
      products: productsModified
    });
  } catch (error) {
    console.error('Error al obtener detalles del carrito:', error);
    res.status(500).send('Error al obtener detalles del carrito');
  }
});

// Vista del panel de administrador
router.get('/admin', (req, res) => {
  const user = req.user;

  if (!user || user.role !== 'admin') {
    return res.status(403).render('unauthorized', { user });
  }

  res.render('adminDashboard', { user });
});

// Registro / Login / Verificación
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/verify', (req, res) => res.render('verify'));

module.exports = router;