const Cliente = require("../models/cliente");
const Empleado = require("../models/empleado");

const verifyController = async (req, res) => {
    try {
        const id = req.params.id;

        let user = await Cliente.findById(id).populate('empresa').populate('sucursal').populate('contacto');
        if (user) {
            return res.status(200).json({ auth: true, message: 'Usuario es un Cliente' });
        }

        user = await Empleado.findById(id).populate('departamento').populate('role').populate('sucursal');
        if (user) {
            return res.status(200).json({ auth: true, message: 'Usuario es un Empleado' });
        }

        return res.status(404).json({ auth: false, message: 'Usuario no encontrado' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ auth: false, message: 'Error al verificar el usuario' });
    }
};

module.exports = { verifyController };

