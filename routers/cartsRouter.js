const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const passport = require('passport');
const { authorizeRole } = require('../middlewares/auth');
const CartDTO = require('../dto/cart.dto');
const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');
const ticketRepository = require('../repositories/ticket.repository');
const TicketDTO = require('../dto/ticket.dto');

const router = express.Router();

// POST Crear un nuevo carrito
router.post('/', passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const newCart = await Cart.create({ user_id: req.user._id });
      req.session.cartId = newCart._id.toString();
      res.status(201).json({ message: 'Carrito creado', cartId: newCart._id });
    } catch (error) {
      console.error('Error al crear carrito:', error);
      res.status(500).json({ message: 'Error al crear carrito' });
    }
  }
);

// GET Obtener los productos de un carrito específico
router.get('/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const cartDTO = new CartDTO(cart);
    res.render('cartDetails', { cart: cartDTO });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});

// POST Agregar un producto al carrito (sólo usuario)
router.post(
  '/:cid/products/:pid',
  passport.authenticate('jwt', { session: false }),
  authorizeRole('user'),
  async (req, res) => {
    try {
      const { cid, pid } = req.params;

      const cart = await Cart.findById(cid);
      if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

      const product = await Product.findById(pid);
      if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

      const existingProduct = cart.products.find(item => item.product.equals(pid));
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();
      res.redirect(`/carts/${cid}`);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
  }
);

// DELETE Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const index = cart.products.findIndex(p => p.product.toString() === pid);
    if (index !== -1) {
      cart.products.splice(index, 1);
      await cart.save();
      return res.redirect(`/carts/${cid}`);
    } else {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar producto del carrito' });
  }
});

// PUT Actualizar el carrito
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.products = products;
    await cart.save();

    const cartDTO = new CartDTO(cart);
    res.json({ status: 'success', message: 'Carrito actualizado', cart: cartDTO });
  } catch (error) {
    console.error('Error al actualizar el carrito:', error);
    res.status(500).json({ message: 'Error al actualizar el carrito' });
  }
});

// POST 
router.post('/:cid/purchase', passport.authenticate('jwt', { session: false }), authorizeRole('user'), async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    let totalAmount = 0;
    const productsNotProcessed = [];

    const purchasedProducts = [];

    for (const item of cart.products) {
      const product = item.product;

      if (product.stock >= item.quantity) {
        // Suficiente stock
        product.stock -= item.quantity;
        await product.save();

        totalAmount += product.price * item.quantity;
        purchasedProducts.push(item);
      } else {
        // Sin stock suficiente
        productsNotProcessed.push(product._id);
      }
    }

    // Generar el ticket si hay productos comprables
    if (purchasedProducts.length > 0) {
        const ticket = await Ticket.create({
          code: uuidv4(),
          amount: totalAmount,
          purchaser: req.user.email
      });
      // Filtrar del carrito los productos ya comprados
      cart.products = cart.products.filter(item =>
        !purchasedProducts.find(p => p.product._id.equals(item.product._id))
      );
      await cart.save();

      return res.status(200).json({
        message: 'Compra procesada parcialmente',
        ticket: new TicketDTO(ticket),
        noStockProducts: productsNotProcessed
      });
    } else {
      return res.status(400).json({
        message: 'No hay productos con stock suficiente',
        noStockProducts: productsNotProcessed
      });
    }
  } catch (error) {
    console.error('Error en la compra:', error);
    res.status(500).json({ message: 'Error al procesar la compra' });
  }
});

module.exports = router;