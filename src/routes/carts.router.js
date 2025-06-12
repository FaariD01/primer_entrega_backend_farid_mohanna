const { Router } = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = Router();

// DELETE api/carts/:cid/products/:pid -> elimina producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Filtrar para eliminar producto pid
    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    await cart.save();
    res.json({ message: 'Producto eliminado del carrito', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto del carrito', error: err.message });
  }
});

// PUT api/carts/:cid -> actualiza TODOS los productos del carrito con arreglo pasado
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body; // debe ser un arreglo [{ product: id, quantity: n }, ...]

    if (!Array.isArray(products)) {
      return res.status(400).json({ message: 'El body debe contener un arreglo de productos' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    // Reemplaza productos
    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity || 1
    }));

    await cart.save();
    res.json({ message: 'Carrito actualizado', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar carrito', error: err.message });
  }
});

// PUT api/carts/:cid/products/:pid -> actualizar sólo la cantidad del producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ message: 'Quantity debe ser un número positivo' });
    }

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productInCart = cart.products.find(p => p.product.toString() === pid);
    if (!productInCart) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    productInCart.quantity = quantity;
    await cart.save();

    res.json({ message: 'Cantidad actualizada', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar cantidad', error: err.message });
  }
});

// DELETE api/carts/:cid -> eliminar todos los productos del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    await cart.save();
    res.json({ message: 'Producto eliminado del carrito', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto del carrito', error: err.message });
  }
});


// routes/carts.js
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.product').lean();
    if (!cart) return res.status(404).send({ error: 'Carrito no encontrado' });

    console.log("Contenido simple del carrito para la vista:", cart);

    res.render('pages/cartView', { cart });
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el carrito' });
  }
});


// POST api/carts -> crea un carrito vacío
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ message: 'Carrito creado', cartId: newCart._id });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear carrito' });
  }
});


// POST api/carts/:cid/products/:pid -> agregar producto al carrito (cantidad 1 o si ya existe suma 1)
router.post('/products/:pid', async (req, res) => {
  try {
    const pid = req.params.pid;
    const fixedCartId = '684a1a8a1f4c063e1d212b31'; // Nuevo ID fijo del carrito

    const cart = await Cart.findById(fixedCartId);
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' });

    const productInCart = cart.products.find(p => p.product.toString() === pid);

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.json({ message: 'Producto agregado al carrito', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar producto al carrito', error: err.message });
  }
});



module.exports = router;
