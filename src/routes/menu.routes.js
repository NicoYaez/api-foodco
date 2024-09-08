const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

router.post('/new', menuController.crearMenu);

router.get('/list/all', menuController.verMenus);

router.get('/list/:status', menuController.verMenusStatus);

router.put('/update-status/:id', menuController.cambiarDisponibilidad);

router.put('/update/:id', menuController.actualizarMenu);

router.delete('/delete/:id', menuController.eliminarMenu);

module.exports = router;
