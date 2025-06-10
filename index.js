require('dotenv').config(); // ✅ Cargar variables de entorno
const express = require('express');
const connectDB = require('./config/dbConfig');
const { create } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const errorHandler = require('./middlewares/errorHandler');
const pathHandler = require('./middlewares/pathHandler');

const viewsRouter = require('./routers/viewsRouter');
const productsRouter = require('./routers/productsRouter');
const cartsRouter = require('./routers/cartsRouter');
const authRouter = require('./routers/authRouter');
require('./config/passport')(passport); // Estrategias de passport

const app = express();
const PORT = process.env.PORT || 8080;

// 🔌 Conexión a MongoDB
connectDB();

// 🔧 Configuración de Handlebars con helper y acceso a propiedades del prototipo
const hbs = create({
  extname: '.handlebars',
  helpers: {
    eq: (a, b) => a === b,
    multiply: (a, b) => a * b,
    calculateTotal: (products) => {
      return products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// 📦 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// 🧭 Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', authRouter);

// 🛑 Middlewares de manejo de rutas no encontradas y errores globales
app.use(pathHandler);
app.use(errorHandler);

// 🚀 Servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// 🔄 WebSocket con Socket.io
const { Server } = require('socket.io');
const io = new Server(server);
const Product = require('./models/Product');

io.on('connection', async (socket) => {
  console.log('Cliente conectado');

  const productos = await Product.find();
  socket.emit('updateProducts', productos);

  socket.on('addProduct', async (newProduct) => {
    try {
      const product = new Product({ ...newProduct, status: true });
      await product.save();

      const productosActualizados = await Product.find();
      io.emit('updateProducts', productosActualizados);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

  socket.on('deleteProduct', async (productId) => {
    try {
      await Product.findByIdAndDelete(productId);
      const productosActualizados = await Product.find();
      io.emit('updateProducts', productosActualizados);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});