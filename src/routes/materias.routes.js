const express = require("express");
const router = express.Router();

const materiaPrimaController = require("../controllers/materiaPrima.controller");
const inventarioController = require('../controllers/inventario.controller');

router.post('/', materiaPrimaController.createMateriaPrima);

router.get('/list', materiaPrimaController.getAllMateriasPrimas);

router.get('/:id', materiaPrimaController.getMateriaPrimaById);

router.put('/update/:id', materiaPrimaController.updateMateriaPrima);

router.delete('/delete/:id', materiaPrimaController.deleteMateriaPrima);

//INVENTARIO

router.post('/inventario/ingresar', inventarioController.ingresarMateriaPrima);

router.post('/inventario/descontar', inventarioController.retirarMateriaPrima);

module.exports = router;
