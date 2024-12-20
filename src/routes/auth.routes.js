const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();

const authCliente = require("../controllers/authCliente.controller");
const authEmpleado = require("../controllers/authEmpleado.controller");
const authJwt = require("../middlewares/auth.jwt");
const verifyRegister = require("../middlewares/verifyRegister");
const uploadController = require('../middlewares/upload');

router.post('/register/cliente', authCliente.register);

router.post('/register/empleado', uploadController.uploadAndResizeProfileImage, authEmpleado.register);

router.post('/login/cliente', authCliente.login);

router.post('/login/empleado', authEmpleado.login);

router.put('/update/cliente/:id', authCliente.actualizarCliente);

router.post('/cliente/request-reset-password', authCliente.requestPasswordReset);

router.post('/cliente/reset-password', authCliente.resetPassword);

router.post('/empleado/request-reset-password', authEmpleado.requestPasswordReset);

router.post('/empleado/reset-password', authEmpleado.resetPassword);

router.get('/empleado/view/:id', authEmpleado.getEmpleadoById);

router.put('/cliente/change-password', authCliente.changePassword);

module.exports = router;
