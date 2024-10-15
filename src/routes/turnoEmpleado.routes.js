const express = require('express');
const router = express.Router();
const turnoEmpleadoController = require('../controllers/turnoEmpleado.controller');

router.post('/', turnoEmpleadoController.asignarTurnoEmpleado);

router.get('/list', turnoEmpleadoController.getAllTurnosEmpleados);

router.put('/update/:id', turnoEmpleadoController.updateTurnoEmpleado);

router.delete('/delete/:id', turnoEmpleadoController.deleteTurnoEmpleado);

module.exports = router;
