const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const Product = require('./models/Product');

const productsRouter = require('./routes/products.router.js');
const cartsRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js');
const ProductManager = require('./dao/ProductManager.js');
const connectDB = require('./db');
connectDB(); // Establece la conexión a MongoDB

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = require('./dao/ProductManager'); // ajustá la ruta si hace falta


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ✅ CONFIGURACIÓN CORREGIDA DE HANDLEBARS

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main', // ← Esto le dice que use main.hbs como layout
  layoutsDir: path.join(__dirname, 'views', 'layouts'), // ← Carpeta donde está main.hbs
  helpers: {
    json: obj => JSON.stringify(obj, null, 2)
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// WebSocket (Socket.IO)
io.on('connection', socket => {
  console.log('Cliente conectado');

  socket.on('getProducts', async ({ limit = 10, page = 1, sort, query } = {}) => {
    try {
      const filter = query
        ? {
            $or: [
              { category: { $regex: query, $options: 'i' } },
              { title: { $regex: query, $options: 'i' } }
            ]
          }
        : {};

      const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined
      };

      const result = await Product.paginate(filter, options);

      socket.emit('productsUpdated', {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.hasPrevPage ? result.prevPage : null,
        nextPage: result.hasNextPage ? result.nextPage : null,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage
      });
    } catch (err) {
      socket.emit('productsUpdated', { status: 'error', message: 'Error al obtener productos' });
    }
  });

  socket.on('newProduct', async product => {
    try {
      await Product.create(product);
      const updatedProducts = await Product.find().lean();
      io.emit('productsUpdated', updatedProducts);
    } catch (err) {
      console.error('Error al agregar producto:', err.message);
    }
  });

  socket.on('deleteProduct', async pid => {
    try {
      await Product.findByIdAndDelete(pid);
      const updatedProducts = await Product.find().lean();
      io.emit('productsUpdated', updatedProducts);
    } catch (err) {
      console.error('Error al eliminar producto:', err.message);
    }
  });
});

module.exports = { app, httpServer };
