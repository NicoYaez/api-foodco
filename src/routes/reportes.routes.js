const express = require('express');
const router = express.Router();

const reportesController = require('../controllers/reportes.controller');

router.get('/produccion', reportesController.getReporteProduccion);

router.get('/materias-primas', reportesController.getReporteMateriasPrimas);

router.get('/turnos-empleados', reportesController.getReporteTurnosEmpleados);

module.exports = router;
