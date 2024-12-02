const express = require("express");
const router = express.Router();

const sucursalController = require("../controllers/sucursal.controller");

router.post('/new', sucursalController.crearSucursal);

router.get('/list', sucursalController.verSucursales);

router.put('/update/:id', sucursalController.actualizarSucursal);

router.delete('/delete/:id', sucursalController.eliminarSucursal);

module.exports = router;
