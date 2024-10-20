const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const fs = require('fs'); // Importar file system para manejar productos.json

// Importar los routers
const viewsRouter = require('./routers/viewsRouter');
const productsRouter = require('./routers/productsRouter');
const cartsRouter = require('./routers/cartsRouter');

const app = express();
const PORT = 8080;

// Configuración de Handlebars
const hbs = create({ extname: '.handlebars' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// WebSocket con Socket.io
const { Server } = require('socket.io');
const io = new Server(server);

// Cargar productos desde productos.json
const productsFilePath = path.join(__dirname, 'data', 'productos.json');
let productos = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Enviar lista de productos cuando un cliente se conecta
  socket.emit('updateProducts', productos);

  // Agregar nuevo producto
  socket.on('addProduct', (newProduct) => {
    const newId = productos.length ? productos[productos.length - 1].id + 1 : 1; // Generar ID único
    const product = { id: newId, ...newProduct, status: true, thumbnails: [] };
    productos.push(product);

    // Actualizar archivo productos.json
    fs.writeFileSync(productsFilePath, JSON.stringify(productos, null, 2));

    // Enviar productos actualizados a todos los clientes conectados
    io.emit('updateProducts', productos);
  });

  // Eliminar producto
  socket.on('deleteProduct', (productId) => {
    productos = productos.filter(product => product.id !== parseInt(productId));

    // Actualizar archivo productos.json
    fs.writeFileSync(productsFilePath, JSON.stringify(productos, null, 2));

    // Enviar productos actualizados a todos los clientes conectados
    io.emit('updateProducts', productos);
  });
});