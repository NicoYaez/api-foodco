const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');

const verificateToken = async (req, res, next) => {

  try {

    const token = req.headers['authorization'];

    if (!token) {
      return res.status(401).json({ auth: false, Message: "Token no proporcionado" })
    }

    const extractedToken = token.split(' ')[1];

    const decoded = jwt.verify(extractedToken, process.env.SECRET_API);
    const userId = decoded.id;

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ auth: false, Message: "Usuario no encontrado" })
    }

    next();

  } catch (error) {
    //console.log(error)
    return res.status(401).json({ auth: false, Message: "Token no valido" })
  }

};

module.exports = { verificateToken };
