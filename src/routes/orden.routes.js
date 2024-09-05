const express = require('express');
const router = express.Router();
const { verOrdenesCompra, verOrdenesPorCliente, actualizarEstadoOrden, verOrdenCompraPorId } = require('../controllers/ordenCompra.controller');

router.get('/list', verOrdenesCompra);

router.get('/view/:id', verOrdenCompraPorId);

router.get('/list/cliente/:clienteId', verOrdenesPorCliente);

router.put('/actualizar-estado/:ordenId', actualizarEstadoOrden);

module.exports = router;
