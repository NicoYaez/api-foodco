const express = require("express");
const router = express.Router();

const rubroController = require("../controllers/rubro.controller");

router.post('/add', rubroController.crearRubro);

router.get('/list', rubroController.obtenerRubros);

module.exports = router;
