const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const checkRegisterUser = async (req, res, next) => {
    try {
        const emailBody = req.body.email.toLowerCase();
        const { username } = req.body;

        let user = await Cliente.findOne({ username }) || await Empleado.findOne({ username });

        if (user) {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }

        let email = await Cliente.findOne({ email: emailBody }) || await Empleado.findOne({ email: emailBody });

        if (email) {
            return res.status(400).json({ message: "El email ya existe" });
        }

        next();
    } catch (error) {
        console.error('Error al verificar el registro del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    checkRegisterUser
};
