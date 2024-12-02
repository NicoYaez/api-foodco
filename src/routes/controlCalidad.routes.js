const express = require('express');
const router = express.Router();
const controlCalidadController = require('../controllers/controlCalidad.controller');

router.post('/revision', controlCalidadController.registrarRevisionControlCalidad);

router.get('/resultados', controlCalidadController.obtenerResultadosControlCalidad);

router.delete('/delete/:id', controlCalidadController.deleteControlCalidad);

module.exports = router;
