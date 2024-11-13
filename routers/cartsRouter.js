const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// POST Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({});
    req.session.cartId = newCart._id.toString();
    res.status(201).json({ message: 'Carrito creado', cartId: newCart._id });
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ message: 'Error al crear carrito' });
  }
});

// GET Obtener los productos de un carrito específico
router.get('/:cid', async (req, res) => {
  try {
    // Buscar el carrito usando el cartId pasado en la URL y poblar los productos
    const cart = await Cart.findById(req.params.cid).populate('products.product');

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Renderizar la vista del carrito con los productos
    res.render('cartDetails', { cart });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});

// POST Agregar un producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    console.log('Cart ID:', cid);
    console.log('Product ID:', pid);

    // Buscar el carrito
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Buscar el producto
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.products.find(item => item.product.equals(pid));
    if (existingProduct) {
      // Incrementar la cantidad si ya existe
      existingProduct.quantity += 1;
    } else {
      // Agregar nuevo producto al carrito
      cart.products.push({ product: pid, quantity: 1 });
    }

    // Guardar el carrito actualizado
    await cart.save();

    res.redirect(`/carts/${cid}`);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
});

// DELETE Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);  // Buscar el carrito
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Verificar si el producto está en el carrito
    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex !== -1) {
      // Si está en el carrito, eliminarlo
      cart.products.splice(productIndex, 1);
      await cart.save();  // Guardar los cambios
      return res.redirect(`/carts/${cid}`);  // Redirigir al carrito actualizado
    } else {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar producto del carrito' });
  }
});

// PUT Actualizar el carrito (reemplazar productos)
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;  // Se espera un arreglo de productos para reemplazar

  try {
    const cart = await Cart.findById(cid);  // Buscar carrito
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Reemplazar el arreglo de productos con el nuevo proporcionado
    cart.products = products;

    await cart.save();  // Guardar los cambios
    res.json({ status: 'success', message: 'Carrito actualizado', cart });
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    res.status(500).json({ message: 'Error al actualizar el carrito' });
  }
});

module.exports = router;