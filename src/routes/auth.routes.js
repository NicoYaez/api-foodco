const express = require("express");
const router = express.Router();

const authCliente = require("../controllers/authCliente.controller");
const authEmpleado = require("../controllers/authEmpleado.controller");
const authJwt = require("../middlewares/auth.jwt");
const verifyRegister = require("../middlewares/verifyRegister");

//authJwt.isAdmin,
//[verifyRegister.checkRegisterUser]

router.post('/register/cliente', authCliente.register);

router.post('/register/empleado', [verifyRegister.checkRegisterUser], authEmpleado.register);

router.post('/login/cliente', authCliente.login);

router.post('/login/empleado', authEmpleado.login);

//router.post('/request-password-reset', authController.requestPasswordReset);

//router.post('/reset-password', authController.resetPassword);

//router.post('/change-password', authController.changePassword);

module.exports = router;
