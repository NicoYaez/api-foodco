const express = require("express");
const router = express.Router();

const sucursalController = require("../controllers/sucursal.controller");

// Crear un nuevo producto
router.post('/new', sucursalController.crearSucursal);
router.get('/list', sucursalController.verSucursales);

module.exports = router;
