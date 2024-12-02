const express = require("express");
const router = express.Router();

const empleadoController = require("../controllers/authEmpleado.controller");

router.get('/list', empleadoController.verEmpleadosFiltrados);

module.exports = router;
