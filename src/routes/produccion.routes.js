const express = require("express");
const router = express.Router();

const produccionDiariaController = require('../controllers/produccionDiaria.controller');

router.post('/', produccionDiariaController.createProduccionDiaria);

router.get('/list', produccionDiariaController.getAllProduccionesDiarias);

router.get('/:id', produccionDiariaController.getProduccionDiariaById);

router.put('/update/:id', produccionDiariaController.updateProduccionDiaria);

router.delete('/delete/:id', produccionDiariaController.deleteProduccionDiaria);

module.exports = router;
