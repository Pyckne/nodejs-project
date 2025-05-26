const express = require('express');
const connectDB = require('./config/dbConfig');
const { create } = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // Necesario para JWT en cookies
const passport = require('passport');
const Cart = require('./models/Cart');

// Importar routers
const viewsRouter = require('./routers/viewsRouter');
const productsRouter = require('./routers/productsRouter');
const cartsRouter = require('./routers/cartsRouter');
const authRouter = require('./routers/authRouter'); // authRouter para login/register
require('./config/passport')(passport); // Cargar estrategias de passport

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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: true,
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware para crear un carrito si no existe en la sesión
// app.use(async (req, res, next) => {
//   if (!req.session.cartId) {
//     try {
//       const newCart = await Cart.create({ products: [] });
//       req.session.cartId = newCart._id.toString();
//       console.log('Nuevo carrito creado:', newCart._id);
//     } catch (error) {
//       console.error('Error al crear el carrito:', error);
//     }
//   }
//   next();
// });

// Rutas
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/auth', authRouter); // Nuevo: ruta para login, register, logout, current

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// WebSocket con Socket.io
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
      console.log(`Producto agregado: ${JSON.stringify(product)}`);
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });

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
