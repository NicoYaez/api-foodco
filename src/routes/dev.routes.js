const express = require("express");
const router = express.Router();

const clienteController = require("../controllers/authCliente.controller");
const empleadoController = require("../controllers/authEmpleado.controller");

router.get('/cliente/list', clienteController.verClientes);

router.get('/empleado/list', empleadoController.verEmpleados);

router.get('/empleado/list', empleadoController.verEmpleadosFiltrados);

module.exports = router;
