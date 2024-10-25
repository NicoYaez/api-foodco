const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimiento.controller');
const authJwt = require("../middlewares/auth.jwt");

router.get('/:numeroOrdenDespacho', seguimientoController.seguimientoOrdenDespacho);

module.exports = router;
