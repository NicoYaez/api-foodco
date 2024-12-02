//POR AHORA SUCURSAL CASI NO SE UTILIZA, PERO SE DEJA EL CODIGO POR SI SE NECESITA EN EL FUTURO
const Sucursal = require('../models/sucursal');

const crearSucursal = async (req, res) => {
    try {
        const { codigoSucursal, nombre, direccion } = req.body;

        if (!codigoSucursal || !nombre || !direccion) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const nuevaSucursal = new Sucursal({
            codigoSucursal,
            nombre,
            direccion
        });

        const sucursalGuardada = await nuevaSucursal.save();

        return res.status(200).json(sucursalGuardada);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear la sucursal' });
    }
};

const actualizarSucursal = async (req, res) => {
    try {
        const { codigoSucursal, nombre, direccion } = req.body;

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID de la sucursal' });
        }

        const camposAActualizar = {};
        if (codigoSucursal) camposAActualizar.codigoSucursal = codigoSucursal;
        if (nombre) camposAActualizar.nombre = nombre;
        if (direccion) camposAActualizar.direccion = direccion;
        if (Object.keys(camposAActualizar).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
        }

        const sucursalActualizada = await Sucursal.findByIdAndUpdate(id, camposAActualizar, { new: true });

        if (!sucursalActualizada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

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
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID de la sucursal' });
        }

        const sucursalEliminada = await Sucursal.findByIdAndDelete(id);

        if (!sucursalEliminada) {
            return res.status(404).json({ message: 'Sucursal no encontrada' });
        }

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
