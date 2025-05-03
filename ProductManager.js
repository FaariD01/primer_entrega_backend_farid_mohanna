const fs = require('fs');

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    // Método para obtener todos los productos
    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al leer el archivo:", error);
            return [];
        }
    }

// Agregar un nuevo producto
async addProduct(productData) {
    const { title, description, code, price, status, stock, category, thumbnails } = productData;

    // Validar que todos los campos necesarios estén presentes
    if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
        throw new Error('Faltan campos requeridos');
    }

    // Obtener los productos existentes
    const products = await this.getProducts();

    // Crear un nuevo producto con id autoincrementable
    const newProduct = {
        id: products.length > 0 ? products[products.length - 1].id + 1 : 1, // Generamos el id
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    // Agregar el nuevo producto al arreglo de productos
    products.push(newProduct);

    // Guardar el archivo actualizado con el nuevo producto
    try {
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct; // Devolver el nuevo producto creado
    } catch (error) {
        console.error("Error al guardar el producto:", error);
        throw new Error('Error al guardar el producto');
    }
}

    // Método para obtener un producto por su id
    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id === id) || null;
    }

    // Actualizar un producto por id
    async updateProduct(id, updatedData) {
        const products = await this.getProducts();

        // Buscar el índice del producto a actualizar
        const productIndex = products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }

        // Actualizar los campos del producto, sin cambiar el id
        const updatedProduct = {
            ...products[productIndex],
            ...updatedData // Actualiza solo los campos que se envíen en el body
        };

        // Reemplazar el producto actualizado en el arreglo de productos
        products[productIndex] = updatedProduct;

        // Guardar el archivo con los productos actualizados
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return updatedProduct; // Devolver el producto actualizado
        } catch (error) {
            console.error("Error al guardar el archivo:", error);
            throw new Error('Error al actualizar el producto');
        }
    }

    // Eliminar un producto por id
    async deleteProduct(id) {
        const products = await this.getProducts();

        // Buscar el índice del producto que coincide con el id
        const productIndex = products.findIndex(product => product.id === id);

        if (productIndex === -1) {
            throw new Error('Producto no encontrado');
        }

        // Eliminar el producto del arreglo
        const deletedProduct = products.splice(productIndex, 1)[0];

        // Guardar el archivo actualizado sin el producto eliminado
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return deletedProduct; // Devolver el producto eliminado
        } catch (error) {
            console.error("Error al guardar el archivo:", error);
            throw new Error('Error al eliminar el producto');
        }
    }
}

module.exports = ProductManager;
