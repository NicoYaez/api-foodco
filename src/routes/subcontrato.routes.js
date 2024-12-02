const express = require("express");
const router = express.Router();

const subContratoController = require("../controllers/subcontrato.controller");

router.post('/new', subContratoController.crearSubcontrato);

router.get('/list', subContratoController.obtenerSubcontratos);

router.get('/view/:id', subContratoController.obtenerSubcontratoPorId);

router.put('/update/:id', subContratoController.actualizarSubcontrato);

router.delete('/delete/:id', subContratoController.eliminarSubcontrato);

module.exports = router;
