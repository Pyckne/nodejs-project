const express = require('express');
const router = express.Router();
const productos = require('../data/productos.json');

// Ruta para la vista "home"
router.get('/home', (req, res) => {
  res.render('home', { productos });
});

// Ruta para la vista "realTimeProducts"
router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

module.exports = router;
