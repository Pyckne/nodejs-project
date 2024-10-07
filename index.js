const express = require('express');
const app = express();
const productsRouter = require('./routers/productsRouter');
const cartsRouter = require('./routers/cartsRouter');

// Middleware para manejar JSON
app.use(express.json());

// Routers
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Definimos el puerto
const PORT = 8080;

// Escuchamos el puerto declarado
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});