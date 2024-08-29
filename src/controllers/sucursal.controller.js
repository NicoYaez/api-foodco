// controllers/sucursal.controller.js
const Sucursal = require('../models/sucursal');

const crearSucursal = async (req, res) => {
    try {
        const { codigoSucursal, nombre, direccion } = req.body;

        // Validar que todos los campos requeridos están presentes
        if (!codigoSucursal || !nombre || !direccion) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Crear una nueva sucursal
        const nuevaSucursal = new Sucursal({
            codigoSucursal,
            nombre,
            direccion
        });

        // Guardar la sucursal en la base de datos
        const sucursalGuardada = await nuevaSucursal.save();

        // Enviar respuesta exitosa
        return res.status(200).json(sucursalGuardada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear la sucursal' });
    }
};

const verSucursales = async (req, res) => {
    try {
        const sucursales = await Sucursal.find();
        return res.status(200).json(sucursales);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener las sucursales' });
    }
};

module.exports = {
    crearSucursal,
    verSucursales
};
