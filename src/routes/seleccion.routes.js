const express = require("express");
const router = express.Router();

const seleccionProductosController = require("../controllers/seleccion.controller");
const authJwt = require("../middlewares/auth.jwt");

router.post('/new', [authJwt.verificateToken], seleccionProductosController.crearSeleccionProductos);

module.exports = router;