const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const upload = require('../middlewares/upload'); // Importa el middleware de multer

// Ruta para crear un producto
router.post('/new', upload.array('imagenes', 5), productoController.crearProducto);

router.get('/list', productoController.mostrarProductos);

router.get('/view/:id', productoController.verProductoPorId);

router.put('/update/:id', productoController.actualizarProducto);

router.delete('/delete/:id', productoController.eliminarProducto);

module.exports = router;
