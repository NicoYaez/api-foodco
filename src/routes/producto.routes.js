const express = require("express");
const router = express.Router();

const productosController = require("../controllers/producto.controller");

// Crear un nuevo producto
router.post('/create', productosController.crearProducto);

// Obtener todos los productos
router.get('/list', productosController.obtenerProductos);

// Obtener un producto por ID
router.get('/:id', productosController.obtenerProductoPorId);

// Actualizar un producto por ID
router.put('/:id', productosController.actualizarProducto);

// Eliminar un producto por ID
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;
