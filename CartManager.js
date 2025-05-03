const fs = require('fs');

class CartManager {
    constructor(path) {
        this.path = path;
    }


    // Crear el carrito
    async createCart() {
        const cart = { id: 1, products: [] };
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(cart, null, 2));
            return cart;
        } catch (error) {
            console.error("Error al crear el carrito:", error);
        }
    }

    // Obtener el carrito
    async getCart() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo del carrito:", error);
            return { id: 1, products: [] }; // Si no existe, creamos un carrito vacío por defecto.
        }
    }

    
    // Agregar un producto al carrito
    async addProductToCart(productId) {
        const cart = await this.getCart();
        
        // Verificar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(p => p.productId === productId);

        if (productIndex === -1) {
            // Si el producto no está, lo agregamos con una cantidad de 1
            cart.products.push({ productId, quantity: 1 });
        } else {
            // Si el producto ya está, incrementamos la cantidad
            cart.products[productIndex].quantity += 1;
        }

        // Guardamos el carrito actualizado en el archivo
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(cart, null, 2));
            return cart;
        } catch (error) {
            console.error("Error al guardar el carrito:", error);
        }
    }
}

module.exports = CartManager;
