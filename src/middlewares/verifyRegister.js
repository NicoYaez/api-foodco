const Cliente = require('../models/cliente');
const Empleado = require('../models/empleado');

const checkRegisterUser = async (req, res, next) => {
    try {
        const emailBody = req.body.email.toLowerCase();
        const { username } = req.body;

        // Buscar el usuario en la colección de Clientes o Empleados por username
        let user = await Cliente.findOne({ username }) || await Empleado.findOne({ username });

        if (user) {
            return res.status(400).json({ message: "El nombre de usuario ya existe" });
        }

        // Buscar el usuario en la colección de Clientes o Empleados por email
        let email = await Cliente.findOne({ email: emailBody }) || await Empleado.findOne({ email: emailBody });

        if (email) {
            return res.status(400).json({ message: "El email ya existe" });
        }

        // Si no se encuentra duplicado ni el username ni el email, pasar al siguiente middleware
        next();
    } catch (error) {
        console.error('Error al verificar el registro del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    checkRegisterUser
};
