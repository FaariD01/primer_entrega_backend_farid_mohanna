const express = require('express');
const router = express.Router();
const path = require('path');

const ProductManager = require('../dao/ProductManager.js');
const productManager = new ProductManager(path.join(__dirname, '..', 'data', 'products.json'));


// Ruta principal (home)
router.get('/', (req, res) => {
  res.send('¡Bienvenido a la página principal!');
  // O si usas alguna vista con motor de plantillas:
  // res.render('home');
});

// Otra ruta de ejemplo
router.get('/about', (req, res) => {
  res.send('Acerca de nosotros');
});


router.get('/realTimeProducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('pages/realTimeProducts', { products });
});

router.get('/home', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('pages/home', { products });
});


module.exports = router;
