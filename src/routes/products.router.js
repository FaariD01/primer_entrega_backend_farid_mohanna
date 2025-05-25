const { Router } = require('express');
const path = require('path');
const ProductManager = require('../dao/ProductManager.js');

const router = Router();
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

// GET /api/products
router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json({ products });
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  const product = await productManager.getProductById(Number(pid));
  if (product) res.json(product);
  else res.status(404).json({ message: 'Producto no encontrado' });
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  if (isNaN(pid)) return res.status(400).json({ message: 'ID inválido' });
  try {
    const updatedProduct = await productManager.updateProduct(parseInt(pid), req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  const { pid } = req.params;
  if (isNaN(pid)) return res.status(400).json({ message: 'ID inválido' });
  try {
    const deleted = await productManager.deleteProduct(parseInt(pid));
    res.json({ message: 'Producto eliminado', product: deleted });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
