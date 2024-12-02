const express = require("express");
const router = express.Router();

const ingredienteController = require("../controllers/ingrediente.controller");

router.post('/new', ingredienteController.crearIngrediente);

router.get('/list', ingredienteController.verIngredientes);

router.get('/list/nombres', ingredienteController.verIngredientesNombres);

router.get('/view/:id', ingredienteController.verIngredientePorId);

router.put('/update/:id', ingredienteController.actualizarIngrediente);

router.delete('/delete/:id', ingredienteController.eliminarIngrediente);

module.exports = router;
