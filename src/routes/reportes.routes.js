const express = require('express');
const router = express.Router();

const reportesController = require('../controllers/reportes.controller');

// Reporte de producción
router.get('/produccion', reportesController.getReporteProduccion);

// Reporte de materias primas
router.get('/materias-primas', reportesController.getReporteMateriasPrimas);

// Reporte de turnos de empleados
router.get('/turnos-empleados', reportesController.getReporteTurnosEmpleados);

module.exports = router;
