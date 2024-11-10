const express = require('express');
const connectDB = require('./config/dbConfig');
const { create } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const Cart = require('./models/Cart');

// Importar los routers
const viewsRouter = require('./routers/viewsRouter');
const productsRouter = require('./routers/productsRouter');
const cartsRouter = require('./routers/cartsRouter');

// Conectar a la base de datos
const app = express();
const PORT = 8080;

connectDB();

// Configuración de Handlebars
const handlebars = require('express-handlebars');
const hbs = create({ extname: '.handlebars' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para crear un carrito si no existe
app.use(async (req, res, next) => {
  if (!req.session.cartId) {
    // Si no hay un cartId en la sesión, creamos un carrito vacío
    const Cart = require('./models/Cart');  // Asegúrate de que el modelo de carrito esté importado
    try {
      const newCart = await Cart.create({ products: [] }); // Crear carrito vacío
      req.session.cartId = newCart._id.toString();  // Guardar el cartId en la sesión
      console.log('Nuevo carrito creado:', newCart._id);
    } catch (error) {
      console.error('Error al crear el carrito:', error);
    }
  }
  next();
});

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
const Product = require('./models/Product'); // Importar el modelo de Product

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  // Obtener la lista de productos desde MongoDB y enviarla al cliente
  const productos = await Product.find();
  socket.emit('updateProducts', productos);

  // Agregar nuevo producto a MongoDB
  socket.on('addProduct', async (newProduct) => {
    try {
      const product = new Product({ ...newProduct, status: true });
      await product.save();

      const productosActualizados = await Product.find();
      io.emit('updateProducts', productosActualizados);

      console.log(`Producto agregado: ${JSON.stringify(product)}`);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

  // Eliminar producto de MongoDB
  socket.on('deleteProduct', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);

      const productosActualizados = await Product.find();
      io.emit('updateProducts', productosActualizados);

      console.log(`Producto eliminado: ${productId}`);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});