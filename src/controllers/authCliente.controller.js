const Cliente = require("../models/cliente.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const { generateToken } = require("../utils/tokenManager");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generatePassword() {
    const length = 16,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const register = async (req, res) => {
    const { nombre } = req.body; // Recibo los datos
    const email = req.body.email.toLowerCase();
    const password = generatePassword();

    // Verificar si ya existe un usuario con el mismo correo
    const existingUser = await Cliente.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "El correo ya está en uso" });
    }
    let newUser;
    newUser = new Cliente({
        nombre: nombre,
        email: email,
        password: password,
    });

    newUser.password = await newUser.encryptPassword(password); //Cifrar contraseña
    const userSave = await newUser.save(); //Usuario Guardado

    const { token, expiresIn } = generateToken({ id: userSave._id }, res);

    return res.status(200).json({
        token,
        expiresIn,
        nombre: userSave.nombre,
        email: userSave.email,
        password // Devuelve la contraseña generada
    });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body; // Recibimos el RUT y la contraseña

        const clienteFound = await Cliente.findOne({ email });
        if (!clienteFound) return res.status(404).json({ message: "Cliente no encontrado" });

        // Verificar la contraseña
        const matchPassword = await clienteFound.validatePassword(password, clienteFound.password);
        if (!matchPassword) return res.status(401).json({ token: null, message: "Contraseña incorrecta" });

        // Generar el token de acceso
        const expiresIn = 60 * 60 * 24;
        const tokenPayload = { id: clienteFound._id, userType: 'Cliente' };
        const token = jwt.sign(tokenPayload, process.env.SECRET_API, { expiresIn });

        // Redirigir al dashboard de clientes
        const redirectUrl = '/cliente/dashboard';

        return res.status(200).json({ token, expiresIn, redirectUrl });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    register,
    login
};