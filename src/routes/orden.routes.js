const express = require('express');
const router = express.Router();
const ordenCompraController = require('../controllers/ordenCompra.controller');
const authJwt = require("../middlewares/auth.jwt");

//router.get('/list', [authJwt.verificateToken], ordenCompraController.verOrdenesCompra);

router.get('/list', ordenCompraController.verOrdenesPorEstado);

router.get('/list/sin-factura', ordenCompraController.verOrdenesCompraSinFactura);

router.get('/view/:id', ordenCompraController.verOrdenCompraPorId);
 
router.get('/list/cliente/:clienteId', ordenCompraController.verOrdenesPorClienteYEstado);

router.get('/list/empleado/:empleadoId', [authJwt.verificateToken], ordenCompraController.verOrdenesPorEmpleado);

router.get('/list/empleado/:empleadoId/completadas', [authJwt.verificateToken], ordenCompraController.verOrdenesCompletadasPorEmpleado);

router.put('/actualizar-estado/:ordenId', ordenCompraController.actualizarEstadoOrden);

router.put('/update/:ordenId', [authJwt.verificateToken], ordenCompraController.actualizarOrdenCompra);

router.get('/list/periodo/:periodo', [authJwt.verificateToken], ordenCompraController.verOrdenesCompraFiltrado);

router.get('/list/despacho', ordenCompraController.verOrdenesListasParaDespacho);

module.exports = router;
