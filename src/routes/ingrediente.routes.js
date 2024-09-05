const express = require("express");
const router = express.Router();

const ingredienteController = require("../controllers/ingrediente.controller");

// Crear un nuevo producto
router.post('/new', ingredienteController.crearIngrediente);
router.get('/list', ingredienteController.verIngredientes);
router.get('/view/:id', ingredienteController.verIngredientePorId);

module.exports = router;
