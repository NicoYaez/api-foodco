const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');

// Ruta para crear una orden de compra
router.post('/crear', compraController.crearOrdenCompra);

module.exports = router;
