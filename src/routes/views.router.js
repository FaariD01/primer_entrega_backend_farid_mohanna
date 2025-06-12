const express = require('express');
const router = express.Router();

const Product = require('../models/Product'); // Modelo mongoose

// Ruta principal: redirige a /home para la vista con Socket.IO
router.get('/', (req, res) => {
  res.redirect('/home');
});

// Ruta estática o info básica
router.get('/about', (req, res) => {
  res.send('Acerca de nosotros');
});

// Ruta /home: renderiza la plantilla home.hbs
// No envía productos directamente, los carga el cliente vía socket.io
router.get('/home', (req, res) => {
  res.render('pages/home', { products: [] });
});

router.get('/realTimeProducts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort; // 'asc' | 'desc' | undefined
    const query = req.query.query || '';

    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: 'i' } },
            { title: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    const options = {
      limit,
      page,
      sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined,
      lean: true
    };

    const result = await Product.paginate(filter, options);

    // Construir prevLink y nextLink
    const baseUrl = '/realTimeProducts';
    const prevLink = result.hasPrevPage
      ? `${baseUrl}?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query}`
      : null;
    const nextLink = result.hasNextPage
      ? `${baseUrl}?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query}`
      : null;

    const cartId = req.session?.cartId || '665fbf6b1d82c64f830ecfaa';

    res.render('pages/realTimeProducts', {
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
      cartId
    });
  } catch (error) {
    res.status(500).render('pages/realTimeProducts', { status: 'error', message: 'Error al obtener productos' });
  }
});


module.exports = router;
