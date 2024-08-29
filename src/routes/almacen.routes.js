const express = require("express");
const router = express.Router();

const almacenController = require("../controllers/almacen.controller");

// Crear un nuevo producto
router.post('/add', almacenController.crearAlmacen);
router.get('/list', almacenController.obtenerAlmacenes);

module.exports = router;
