const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// Ruta para crear un menú semanal
router.post('/crear', menuController.crearMenuSemanal);

module.exports = router;
