const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const checkRegisterUser = async (req, res, next) => {
    const emailBody = req.body.email.toLowerCase();

    // Buscar el usuario en la colección de Clientes
    let user = await Cliente.findById({ username: req.body.username });

    // Si no es un Cliente, buscar en la colección de Empleados
    if (!user) {
        user = await Empleado.findById({ username: req.body.username });
    }

    if (user) return res.status(400).json({ message: "El usuario ya existe" })

    // Buscar el usuario en la colección de Clientes
    let email = await Cliente.findById({ email: emailBody });

    // Si no es un Cliente, buscar en la colección de Empleados
    if (!email) {
        email = await Empleado.findById({ email: emailBody });
    }

    if (email) return res.status(400).json({ message: "El email ya existe" })

    next();
};
module.exports = {
    checkRegisterUser
};