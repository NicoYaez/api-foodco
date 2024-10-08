const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const authCliente = require("../controllers/authCliente.controller");
const authEmpleado = require("../controllers/authEmpleado.controller");
const authJwt = require("../middlewares/auth.jwt");
const verifyRegister = require("../middlewares/verifyRegister");

const uploadController = require('../middlewares/upload'); // Importa el middleware de multer

// Aceptar tanto archivos como otros campos
const uploadFields = upload.fields([
    { name: 'imagenPerfil', maxCount: 1 }, // Aquí defines el nombre y el número máximo de archivos
]);

//authJwt.isAdmin,
//[verifyRegister.checkRegisterUser]

router.post('/register/cliente', authCliente.register);

router.post('/register/empleado', uploadController.uploadAndResizeProfileImage, authEmpleado.register);

router.post('/login/cliente', authCliente.login);

router.post('/login/empleado', authEmpleado.login);

router.put('/update/cliente/:id', authCliente.actualizarCliente);

router.post('/cliente/request-reset-password', authCliente.requestPasswordReset);

router.post('/cliente/reset-password', authCliente.resetPassword);

//router.post('/reset-password', authController.resetPassword);

//router.post('/change-password', authController.changePassword);

module.exports = router;
