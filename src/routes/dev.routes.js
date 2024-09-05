const express = require("express");
const router = express.Router();

const clienteController = require("../controllers/authCliente.controller");

router.get('/cliente/list', clienteController.verClientes);

module.exports = router;
