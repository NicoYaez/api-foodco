const express = require('express');
const router = express.Router();
const ordenCompraController = require('../controllers/ordenCompra.controller');
const authJwt = require("../middlewares/auth.jwt");

//router.get('/list', [authJwt.verificateToken], ordenCompraController.verOrdenesCompra);

router.get('/list', [authJwt.verificateToken], ordenCompraController.verOrdenesPorEstado);

router.get('/view/:id', [authJwt.verificateToken], ordenCompraController.verOrdenCompraPorId);
 
router.get('/list/cliente/:clienteId', [authJwt.verificateToken], ordenCompraController.verOrdenesPorCliente);

router.get('/list/empleado/:empleadoId', [authJwt.verificateToken], ordenCompraController.verOrdenesPorEmpleado);

router.get('/list/empleado/:empleadoId/completadas', [authJwt.verificateToken], ordenCompraController.verOrdenesCompletadasPorEmpleado);

router.put('/actualizar-estado/:ordenId', [authJwt.verificateToken], ordenCompraController.actualizarEstadoOrden);

router.put('/update/:ordenId', [authJwt.verificateToken], ordenCompraController.actualizarOrdenCompra);

module.exports = router;
