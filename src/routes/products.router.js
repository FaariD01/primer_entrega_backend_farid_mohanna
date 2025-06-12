const { Router } = require('express');
const Product = require('../models/Product'); 

const router = Router();

// GET /api/products (con paginación, filtro y ordenamiento)
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro: busca en categoría o en status (disponibilidad)
    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: 'i' } },
            { status: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined,
      lean: true,
    };

    const result = await Product.paginate(filter, options);

    // Construir los links previos y siguientes con los query params correspondientes
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
      : null;

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
  }
});


// GET /api/products/:pid
// routes/products.js o en tu router correspondiente
router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid);
    if (!product) return res.status(404).send({ error: 'Producto no encontrado' });

    res.render('productDetail', { product }); // usando handlebars
  } catch (error) {
    res.status(500).send({ error: 'Error al obtener el producto' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualizar el producto' });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', product: deleted });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar el producto' });
  }
});

module.exports = router;
