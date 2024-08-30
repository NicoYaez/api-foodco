const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');

// Ruta para crear un producto
router.post('/crear', productoController.crearProducto);

module.exports = router;
