const express = require("express");
const router = express.Router();

const almacenController = require("../controllers/almacen.controller");

router.post('/new', almacenController.crearAlmacen);

router.get('/list', almacenController.obtenerAlmacenes);

router.get('/list-ingredientes', almacenController.obtenerIngredientesAlmacen);

router.put('/update/:id', almacenController.actualizarAlmacen);

router.delete('/delete/:id', almacenController.eliminarAlmacen);

module.exports = router;
