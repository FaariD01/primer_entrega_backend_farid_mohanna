// src/dao/CartManager.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

class CartManager {
  async createCart() {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    return newCart;
  }

  async getCartById(cartId) {
    return await Cart.findById(cartId).populate('products.product');
  }

  async addProductToCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const product = await Product.findById(productId);
    if (!product) throw new Error('Producto no encontrado');

    const existingProduct = cart.products.find(p => p.product.equals(productId));

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return await cart.populate('products.product');
  }

  async getAllCarts() {
    return await Cart.find().populate('products.product');
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => !p.product.equals(productId));

    await cart.save();
    return cart;
  }
}

module.exports = new CartManager();
