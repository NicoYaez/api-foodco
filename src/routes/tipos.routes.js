const express = require("express");
const router = express.Router();

const tipoProductoController = require("../controllers/tipoProducto.controller");

router.post('/', tipoProductoController.createTipoProducto);

router.get('/list', tipoProductoController.getAllTiposProductos);

router.get('/:id', tipoProductoController.getTipoProductoById);

router.put('/update/:id', tipoProductoController.updateTipoProducto);

router.delete('/delete/:id', tipoProductoController.deleteTipoProducto);


module.exports = router;