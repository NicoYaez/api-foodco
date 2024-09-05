const express = require("express");
const router = express.Router();

const seleccionProductosController = require("../controllers/seleccion.controller");

router.post('/new', seleccionProductosController.crearSeleccionProductos);

module.exports = router;