const fs = require('fs');

class CartManager {
  constructor(path) {
    this.path = path;
  }

  async createCart() {
    const cart = { id: 1, products: [] };
    try {
      await fs.promises.writeFile(this.path, JSON.stringify(cart, null, 2));
      return cart;
    } catch (error) {
      console.error("Error al crear el carrito:", error);
    }
  }

  async getCart() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error al leer el archivo del carrito:", error);
      return { id: 1, products: [] };
    }
  }

  async addProductToCart(product) {
    const cart = await this.getCart();

    const productIndex = cart.products.findIndex(p => Number(p.productId) === Number(product.id));

    if (productIndex === -1) {
        // Agregar producto con info completa + quantity
        cart.products.push({ 
          productId: product.id, 
          quantity: 1,
          title: product.title,
          price: product.price,
          // agregá lo que quieras guardar
        });
    } else {
        cart.products[productIndex].quantity += 1;
    }

    try {
        await fs.promises.writeFile(this.path, JSON.stringify(cart, null, 2));
        return cart;
    } catch (error) {
        console.error("Error al guardar el carrito:", error);
    }
}


}

module.exports = CartManager;
