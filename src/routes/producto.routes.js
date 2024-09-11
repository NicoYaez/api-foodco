const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const uploadAndConvertToWebP = require('../middlewares/upload'); // Importa el middleware de multer

router.post('/new', uploadAndConvertToWebP, productoController.crearProducto);

router.get('/list', productoController.mostrarProductos);

router.get('/list/nombres', productoController.mostrarProductosNombres);

router.get('/view/:id', productoController.verProductoPorId);

router.put('/update/:id', uploadAndConvertToWebP, productoController.actualizarProducto);

router.delete('/delete/:id', productoController.eliminarProducto);

module.exports = router;
