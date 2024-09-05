const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// Ruta para crear un menú semanal con múltiples imágenes
router.post('/new', menuController.crearMenu); // 'imagenes' es el campo del formulario, 5 es el número máximo de imágenes

router.get('/list/all', menuController.verMenus);

router.get('/list/:status', menuController.verMenusStatus);

module.exports = router;
