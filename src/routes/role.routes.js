const express = require('express');
const router = express.Router();
const roleController = require("../controllers/role.controller");

// Ruta para crear un rol
router.post('/new', roleController.createRole);

// Ruta para obtener todos los roles
router.get('/list', roleController.getRoles);

// Ruta para obtener un rol por ID
router.get('/:id', roleController.getRoleById);

// Ruta para actualizar un rol
router.put('/update/:id', roleController.updateRole);

// Ruta para eliminar un rol
router.delete('/delete/:id', roleController.deleteRole);

module.exports = router;
