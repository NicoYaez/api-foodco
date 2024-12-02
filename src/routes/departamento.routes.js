const express = require("express");
const router = express.Router();

const departamentoController = require('../controllers/departamento.controller');
const authJwt = require("../middlewares/auth.jwt");

router.post('/new', departamentoController.crearDepartamento);

router.get('/list', departamentoController.obtenerDepartamentos);

router.put('/update/:id', departamentoController.actualizarDepartamento);

router.delete('/delete/:id', departamentoController.eliminarDepartamento);

module.exports = router;
