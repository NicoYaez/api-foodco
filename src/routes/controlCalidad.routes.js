const express = require('express');
const router = express.Router();
const controlCalidadController = require('../controllers/controlCalidad.controller');

// Registrar una nueva revisión de control de calidad
router.post('/revision', controlCalidadController.registrarRevisionControlCalidad);

// Obtener los resultados de control de calidad
router.get('/resultados', controlCalidadController.obtenerResultadosControlCalidad);

module.exports = router;
