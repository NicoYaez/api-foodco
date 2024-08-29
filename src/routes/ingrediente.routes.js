const express = require("express");
const router = express.Router();

const ingredienteController = require("../controllers/ingrediente.controller");

// Crear un nuevo producto
router.post('/add', ingredienteController.crearIngrediente);
router.get('/list', ingredienteController.obtenerIngredientes);

module.exports = router;
