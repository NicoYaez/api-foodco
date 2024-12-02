const MateriaPrima = require('../models/materiaPrima');

const ingresarMateriaPrima = async (req, res) => {
    const { id, cantidad } = req.body;

    if (!id || !cantidad || cantidad <= 0) {
        return res.status(400).json({ message: 'ID y una cantidad mayor a 0 son requeridos.' });
    }

    try {
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).json({ message: 'Materia prima no encontrada.' });
        }

        materiaPrima.cantidad += cantidad;

        await materiaPrima.save();

        return res.status(200).json({ message: 'Cantidad ingresada exitosamente.', materiaPrima });
    } catch (error) {
        return res.status(500).json({ message: 'Error al ingresar materia prima al inventario.', error: error.message });
    }
};

const retirarMateriaPrima = async (req, res) => {
    const { id, cantidad } = req.body;

    if (!id || !cantidad || typeof cantidad !== 'number' || cantidad <= 0) {
        return res.status(400).json({ message: 'ID válido y una cantidad mayor a 0 son requeridos.' });
    }

    try {
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).json({ message: `Materia prima con ID ${id} no encontrada.` });
        }

        if (materiaPrima.cantidad < cantidad) {
            return res.status(400).json({
                message: `Stock insuficiente para la materia prima ${materiaPrima.nombre}. Disponible: ${materiaPrima.cantidad}, solicitado: ${cantidad}.`
            });
        }

        materiaPrima.cantidad -= cantidad;

        await materiaPrima.save();

        return res.status(200).json({
            message: 'Cantidad retirada exitosamente.',
            materiaPrimaActualizada: {
                id: materiaPrima.id,
                nombre: materiaPrima.nombre,
                cantidadActual: materiaPrima.cantidad
            }
        });
    } catch (error) {
        console.error('Error al retirar materia prima:', error.message);
        return res.status(500).json({
            message: 'Error interno al procesar la solicitud.',
            error: error.message
        });
    }
};

const obtenerInventario = async (req, res) => {
    try {
        const inventario = await MateriaPrima.find();
        res.status(200).json(inventario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el inventario.', error: error.message });
    }
};

const obtenerInventarioDisponible = async (req, res) => {
    try {
        const inventarioDisponible = await MateriaPrima.find({ cantidad: { $gt: 0 } });
        res.status(200).json(inventarioDisponible);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el inventario disponible.', error: error.message });
    }
};

const obtenerAlertasInventario = async (req, res) => {
    try {
        const alertasInventario = await MateriaPrima.find({
            $expr: { $lte: ["$cantidad", "$stock_minimo"] }
        });
        res.status(200).json(alertasInventario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las alertas de inventario.', error: error.message });
    }
};

module.exports = {
    ingresarMateriaPrima,
    retirarMateriaPrima,
    obtenerInventario,
    obtenerInventarioDisponible,
    obtenerAlertasInventario
};