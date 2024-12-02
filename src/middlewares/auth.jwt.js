const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const verificateToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader) {
      return res.status(401).json({ auth: false, message: "Token no proporcionado" });
    }

    const tokenParts = authorizationHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || tokenParts.length !== 2) {
      return res.status(400).json({ auth: false, message: "Formato de token incorrecto" });
    }

    const token = tokenParts[1];

    const decoded = jwt.verify(token, process.env.SECRET_API);
    const userId = decoded.id;

    let user = await Cliente.findById(userId);

    if (!user) {
      user = await Empleado.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ auth: false, message: "Usuario no encontrado" });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ auth: false, message: "Token no válido", error: error.message });
  }
};

module.exports = { verificateToken };