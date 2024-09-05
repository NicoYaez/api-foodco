const express = require("express");
const router = express.Router();

const almacenController = require("../controllers/almacen.controller");

// Crear un nuevo producto
router.post('/new', almacenController.crearAlmacen);

router.get('/list', almacenController.obtenerAlmacenes);

router.get('/list-ingredientes', almacenController.obtenerIngredientesAlmacen);

router.put('/update', almacenController.actualizarIngredienteAlmacen);

module.exports = router;
