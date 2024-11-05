const express = require('express');
const router = express.Router();
const facturaController = require('../controllers/factura.controller');
const uploadController = require('../middlewares/upload');

router.post('/upload', uploadController.uploadPDF, facturaController.subirFactura);

router.get('/list', facturaController.obtenerFacturas);

router.put('/update/:id', uploadController.uploadPDF, facturaController.actualizarFactura);

router.delete('/delete/:id', facturaController.eliminarFactura);

router.get('/:id', facturaController.obtenerFacturaPorId);

router.get('/cliente/:clienteId', facturaController.obtenerFacturasPorCliente);

router.get('/orden/:ordenCompraId', facturaController.obtenerFacturaPorOrdenCompra);

module.exports = router;
