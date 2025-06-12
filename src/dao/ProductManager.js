const Product = require('../models/Product');

class ProductManager {
  async getProducts() {
    return await Product.find();
  }

  async getProductById(id) {
    return await Product.findById(id);
  }

  async addProduct(productData) {
    const requiredFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
    for (const field of requiredFields) {
      if (!productData[field]) throw new Error(`Falta el campo requerido: ${field}`);
    }

    const product = new Product(productData);
    await product.save();
    return product;
  }

  async updateProduct(id, updatedData) {
    const updated = await Product.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updated) throw new Error('Producto no encontrado');
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) throw new Error('Producto no encontrado');
    return deleted;
  }
}

module.exports = new ProductManager();
