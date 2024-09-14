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

const actualizarSucursal = async (req, res) => {
    try {
        const { codigoSucursal, nombre, direccion } = req.body;

        // Verificar si se envió un ID de sucursal para actualizar
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID de la sucursal' });
        }

        // Crear un objeto vacío y añadir solo los campos que se enviaron en la solicitud
        const camposAActualizar = {};
        if (codigoSucursal) camposAActualizar.codigoSucursal = codigoSucursal;
        if (nombre) camposAActualizar.nombre = nombre;
        if (direccion) camposAActualizar.direccion = direccion;

        // Verificar si se envió algún campo para actualizar
        if (Object.keys(camposAActualizar).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
        }

        // Actualizar la sucursal en la base de datos
        const sucursalActualizada = await Sucursal.findByIdAndUpdate(id, camposAActualizar, { new: true });

        // Verificar si la sucursal existe
        if (!sucursalActualizada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        // Enviar respuesta exitosa
        return res.status(200).json(sucursalActualizada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar la sucursal' });
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

const eliminarSucursal = async (req, res) => {
    try {
        // Obtener el ID de los parámetros de la ruta
        const { id } = req.params;

        // Verificar si se envió el ID
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID de la sucursal' });
        }

        // Intentar eliminar la sucursal de la base de datos
        const sucursalEliminada = await Sucursal.findByIdAndDelete(id);

        // Verificar si la sucursal fue encontrada y eliminada
        if (!sucursalEliminada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

        // Respuesta exitosa
        return res.status(200).json({ message: 'Sucursal eliminada correctamente', sucursalEliminada });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar la sucursal' });
    }
};

module.exports = {
    crearSucursal,
    verSucursales,
    actualizarSucursal,
    eliminarSucursal
};
