const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');

const productsRouter = require('./routes/products.router.js');
const cartsRouter = require('./routes/carts.router.js');
const viewsRouter = require('./routes/views.router.js');
const ProductManager = require('./dao/ProductManager.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const productManager = new ProductManager(path.join(__dirname, 'data', 'products.json'));

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

  socket.on('getProducts', async () => {
    const products = await productManager.getProducts();
    socket.emit('productsUpdated', products);
  });

  socket.on('newProduct', async product => {
    await productManager.addProduct(product);
    const updatedProducts = await productManager.getProducts();
    io.emit('productsUpdated', updatedProducts);
  });

  socket.on('deleteProduct', async pid => {
    await productManager.deleteProduct(pid);
    const updatedProducts = await productManager.getProducts();
    io.emit('productsUpdated', updatedProducts);
  });
});

module.exports = httpServer;
