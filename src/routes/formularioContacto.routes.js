const express = require("express");
const router = express.Router();

const formularioContactoController = require("../controllers/formularioContacto.controller");

router.post('/new', formularioContactoController.crearMensaje);

router.get('/list', formularioContactoController.obtenerMensajes);

router.get('/view/:id', formularioContactoController.obtenerMensajePorId);

router.put('/update/:id', formularioContactoController.actualizarMensaje);

router.delete('/delete/:id', formularioContactoController.eliminarMensaje);

module.exports = router;
