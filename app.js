const express = require('express');
const ProductManager = require('./ProductManager');
const CartManager = require('./CartManager');
const app = express();
const PORT = 8080;

// Inicializamos el ProductManager y CartManager con el archivo JSON de productos
const productManager = new ProductManager('./products.json');
const cartManager = new CartManager('./cart.json');

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Ruta para obtener todos los productos
app.get('/api/products', async (req, res) => {
    const products = await productManager.getProducts();
    res.json({ products });
});

// Ruta para obtener un producto por su id
app.get('/api/products/:pid', async (req, res) => {
    const { pid } = req.params;
    const product = await productManager.getProductById(Number(pid));

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Ruta para agregar un nuevo producto
app.post('/api/products', async (req, res) => {
  try {
      // Llamar a la función addProduct de ProductManager
      const newProduct = await productManager.addProduct(req.body);
      res.status(201).json(newProduct); // Responder con el producto creado
  } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message }); // Responder con un error si ocurre
  }
});

// Ruta para actualizar un producto
app.put('/api/products/:pid', async (req, res) => {
  const { pid } = req.params; // Obtener el id del producto a actualizar
  const updatedData = req.body; // Obtener los datos a actualizar desde el body

  // Validar si el pid es un número válido
  if (isNaN(pid)) {
      return res.status(400).json({ message: 'El id del producto debe ser un número válido' });
  }

  try {
      // Llamar al método updateProduct de ProductManager
      const updatedProduct = await productManager.updateProduct(parseInt(pid), updatedData);
      res.status(200).json(updatedProduct); // Responder con el producto actualizado
  } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message }); // Si el producto no se encuentra
  }
});

// Ruta para eliminar un producto
app.delete('/api/products/:pid', async (req, res) => {
  const { pid } = req.params; // Obtener el id del producto a eliminar

  // Verificar si pid es un número válido
  if (isNaN(pid)) {
      return res.status(400).json({ message: 'El id del producto debe ser un número válido' });
  }

  try {
      // Llamar al método deleteProduct de ProductManager
      const deletedProduct = await productManager.deleteProduct(parseInt(pid));
      res.status(200).json({ message: 'Producto eliminado', product: deletedProduct });
  } catch (error) {
      console.error(error);
      res.status(404).json({ message: error.message }); // Si el producto no se encuentra
  }
});


//RUTAS PARA EL CARRITO


// Ruta para crear el carrito
app.post('/api/cart', async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

// Ruta para obtener el carrito
app.get('/api/cart', async (req, res) => {
  const cart = await cartManager.getCart();
  res.json(cart);
});

// Ruta para agregar un producto al carrito
app.post('/api/cart/products/:productId', async (req, res) => {
    const { productId } = req.params;
  
    if (!productId) {
        return res.status(400).json({ message: 'El ID del producto es obligatorio' });
    }
  
    // Verificar que el producto exista
    const product = await productManager.getProductById(Number(productId));
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
  
    try {
        const cart = await cartManager.addProductToCart(Number(productId));
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    }
  });

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
