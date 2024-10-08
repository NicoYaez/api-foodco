const express = require('express');
const router = express.Router();
const { verOrdenesCompra, verOrdenesPorCliente, actualizarEstadoOrden, verOrdenCompraPorId } = require('../controllers/ordenCompra.controller');
const authJwt = require("../middlewares/auth.jwt");

router.get('/list', [authJwt.verificateToken], verOrdenesCompra);

router.get('/view/:id', [authJwt.verificateToken], verOrdenCompraPorId);
 
router.get('/list/cliente/:clienteId', [authJwt.verificateToken], verOrdenesPorCliente);

router.put('/actualizar-estado/:ordenId', [authJwt.verificateToken], actualizarEstadoOrden);

module.exports = router;
