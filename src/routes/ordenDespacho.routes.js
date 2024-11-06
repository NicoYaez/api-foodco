const express = require('express');
const router = express.Router();
const ordenDespachoController = require('../controllers/despacho.controller');
const authJwt = require("../middlewares/auth.jwt");

router.post('/crear', ordenDespachoController.crearOrdenDespacho);

router.get('/list', ordenDespachoController.verOrdenesDespacho);

router.post('/:ordenDespachoId/estado', ordenDespachoController.actualizarEstadoOrdenDespacho);

router.get('/:id', ordenDespachoController.verOrdenDespachoPorId);

router.put('/:ordenDespachoId/camion', ordenDespachoController.asignarCamion);

router.put('/update/:id', ordenDespachoController.actualizarOrdenDespacho);

module.exports = router;
