const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const upload = require('../middlewares/upload'); // Importa el middleware de multer

// Ruta para crear un menú semanal con múltiples imágenes
router.post('/add', upload.array('imagenes', 5), menuController.crearMenu); // 'imagenes' es el campo del formulario, 5 es el número máximo de imágenes

router.get('/list/all', menuController.verMenus);

router.get('/list/:status', menuController.verMenusStatus);

router.get('/list/filter', menuController.verMenus);

module.exports = router;
