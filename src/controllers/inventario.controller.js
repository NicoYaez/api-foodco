const MateriaPrima = require('../models/materiaPrima');

// Ingresar materia prima al inventario
const ingresarMateriaPrima = async (req, res) => {
    const { id, cantidad } = req.body;

    if (!id || !cantidad || cantidad <= 0) {
        return res.status(400).json({ message: 'ID y una cantidad mayor a 0 son requeridos.' });
    }

    try {
        // Buscar la materia prima por ID
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).json({ message: 'Materia prima no encontrada.' });
        }

        // Aumentar la cantidad en el inventario
        materiaPrima.cantidad += cantidad;

        // Guardar los cambios
        await materiaPrima.save();

        return res.status(200).json({ message: 'Cantidad ingresada exitosamente.', materiaPrima });
    } catch (error) {
        return res.status(500).json({ message: 'Error al ingresar materia prima al inventario.', error: error.message });
    }
};

// Retirar materia prima del inventario
const retirarMateriaPrima = async (req, res) => {
    const { id, cantidad } = req.body;

    if (!id || !cantidad || cantidad <= 0) {
        return res.status(400).json({ message: 'ID y una cantidad mayor a 0 son requeridos.' });
    }

    try {
        // Buscar la materia prima por ID
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).json({ message: 'Materia prima no encontrada.' });
        }

        // Verificar si hay suficiente cantidad en el inventario
        if (materiaPrima.cantidad < cantidad) {
            return res.status(400).json({ message: 'Cantidad insuficiente en el inventario.' });
        }

        // Disminuir la cantidad en el inventario
        materiaPrima.cantidad -= cantidad;

        // Guardar los cambios
        await materiaPrima.save();

        return res.status(200).json({ message: 'Cantidad retirada exitosamente.', materiaPrima });
    } catch (error) {
        return res.status(500).json({ message: 'Error al retirar materia prima del inventario.', error: error.message });
    }
};

// Obtener todo el inventario
const obtenerInventario = async (req, res) => {
    try {
        const inventario = await MateriaPrima.find();
        res.status(200).json(inventario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el inventario.', error: error.message });
    }
};

// Obtener inventario disponible
const obtenerInventarioDisponible = async (req, res) => {
    try {
        const inventarioDisponible = await MateriaPrima.find({ cantidad: { $gt: 0 } });
        res.status(200).json(inventarioDisponible);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el inventario disponible.', error: error.message });
    }
};

// Obtener alertas de inventario (cuando la cantidad es menor o igual al stock mínimo)
const obtenerAlertasInventario = async (req, res) => {
    try {
        // Utilizamos $expr para comparar dos campos dentro de la misma colección
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