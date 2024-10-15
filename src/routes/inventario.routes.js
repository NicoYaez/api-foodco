const express = require('express');
const router = express.Router();

const inventarioController = require('../controllers/inventario.controller');

router.get('/', inventarioController.obtenerInventario);

router.get('/disponible', inventarioController.obtenerInventarioDisponible);

router.get('/alertas', inventarioController.obtenerAlertasInventario);

module.exports = router;
