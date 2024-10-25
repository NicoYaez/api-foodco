const express = require('express');
const router = express.Router();
const ordenDespachoController = require('../controllers/despacho.controller');
const authJwt = require("../middlewares/auth.jwt");

router.post('/', [authJwt.verificateToken], ordenDespachoController.crearOrdenDespacho);

router.get('/list', [authJwt.verificateToken], ordenDespachoController.verOrdenesDespacho);

router.post('/:numeroOrdenDespacho/estado', ordenDespachoController.actualizarEstadoOrdenDespacho);

module.exports = router;
