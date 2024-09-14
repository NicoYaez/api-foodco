const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/authCliente.controller');

router.put('/update/:id', clienteController.actualizarCliente);

router.delete('/delete/:id', clienteController.deleteCliente);

router.get('/view/:id', clienteController.verClientePorId);

module.exports = router;
