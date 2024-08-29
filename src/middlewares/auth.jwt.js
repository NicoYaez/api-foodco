const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const verificateToken = async (req, res, next) => {

  try {

    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ auth: false, Message: "Token no proporcionado" })
    }

    const extractedToken = token.split(' ')[1];

    const decoded = jwt.verify(extractedToken, process.env.SECRET_API);
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

    next();

  } catch (error) {
    //console.log(error)
    return res.status(401).json({ auth: false, Message: "Token no valido" })
  }

};

module.exports = { verificateToken };
