const { Router } = require('express');
const path = require('path');
const CartManager = require('../dao/CartManager.js');
const ProductManager = require('../dao/ProductManager.js');

const router = Router();
const cartManager = new CartManager(path.join(__dirname, '../data/carts.json'));
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

router.get('/', async (req, res) => {
  const carts = await cartManager.getCarts(); // Opcional: implementa este método
  res.json(carts);
});

// POST /api/carts
router.post('/', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await cartManager.getCartById(cid);
  if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });
  res.json(cart);
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
  const { pid } = req.params;
  const product = await productManager.getProductById(Number(pid));
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

  try {
    const updatedCart = await cartManager.addProductToCart(product);
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar producto al carrito' });
  }
});

module.exports = router;
