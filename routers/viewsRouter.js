const express = require('express');
const router = express.Router();
const Productos = require('../models/Product');  // Modelo de productos
const Cart = require('../models/Cart');

router.get('/home', async (req, res) => {
  try {
    const filter = {};  // Filtro para los productos
    const options = { page: 1, limit: 10 };  // Paginación
    const products = await Productos.paginate(filter, options);

    const cartId = req.session.cartId;  // Obtener el cartId de la sesión

    const productsModified = products.docs.map(product => ({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      stock: product.stock,
    }));

    res.render('home', {
      products: productsModified,  // Los productos en la página
      cartId,                      // Pasar cartId para usarlo en la vista
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

// Ruta para ver el detalle de un producto específico
router.get('/products/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const product = await Productos.findById(productId);
    const cartId = req.session.cartId; // Obtener cartId de la sesión

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    res.render('productDetails', {
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
      },
      cartId, // Pasar cartId a la vista
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error al obtener el producto');
  }
});

// Ruta para la vista "realTimeProducts"
router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

// Ruta para ver los detalles de un carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await Cart.findById(cartId).populate('products.product');

    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }

    // Mapear los productos para que sean propiedades propias
    const productsInCart = cart.products.map(item => ({
      id: item.product._id.toString(),
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    }));

    res.render('cartDetails', {
      cartId,
      products: productsInCart,
    });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});

module.exports = router;