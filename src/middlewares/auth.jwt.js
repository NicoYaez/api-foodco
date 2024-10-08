const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const verificateToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers['authorization'];

    // Verificar si el token está presente
    if (!authorizationHeader) {
      return res.status(401).json({ auth: false, message: "Token no proporcionado" });
    }

    // Validar si el token tiene el formato correcto "Bearer <token>"
    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || tokenParts.length !== 2) {
      return res.status(400).json({ auth: false, message: "Formato de token incorrecto" });
    }

    const token = tokenParts[1];

    // Verificar el token usando el secreto de tu API
    const decoded = jwt.verify(token, process.env.SECRET_API);
    const userId = decoded.id;

    // Buscar el usuario en la colección de Clientes
    let user = await Cliente.findById(userId);

    // Si no es un Cliente, buscar en la colección de Empleados
    if (!user) {
      user = await Empleado.findById(userId);
    }

    // Si no se encuentra ni como Cliente ni como Empleado
    if (!user) {
      return res.status(404).json({ auth: false, message: "Usuario no encontrado" });
    }

    // Añadir el usuario al request para usarlo en rutas posteriores
    req.user = user;

    // Pasar al siguiente middleware
    next();

  } catch (error) {
    return res.status(401).json({ auth: false, message: "Token no válido", error: error.message });
  }
};

module.exports = { verificateToken };