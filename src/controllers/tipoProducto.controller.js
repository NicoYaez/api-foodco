const TipoProducto = require('../models/tipoProducto');

// Crear un nuevo tipo de producto
const createTipoProducto = async (req, res) => {
    const { nombre } = req.body;

    // Validación manual
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }

    try {
        const tipoProducto = new TipoProducto({ nombre });
        await tipoProducto.save();
        res.status(200).json({ message: 'Tipo de producto creado exitosamente.', tipoProducto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los tipos de productos
const getAllTiposProductos = async (req, res) => {
    try {
        const tiposProductos = await TipoProducto.find();
        res.status(200).json(tiposProductos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un tipo de producto por ID
const getTipoProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoProducto = await TipoProducto.findById(id);
        if (!tipoProducto) {
            return res.status(404).json({ error: 'Tipo de producto no encontrado.' });
        }
        res.status(200).json(tipoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un tipo de producto por ID
const updateTipoProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    // Validación manual
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
        return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }

    try {
        const tipoProducto = await TipoProducto.findByIdAndUpdate(id, { nombre }, { new: true, runValidators: true });
        if (!tipoProducto) {
            return res.status(404).json({ error: 'Tipo de producto no encontrado.' });
        }
        res.status(200).json({ message: 'Tipo de producto actualizado exitosamente.', tipoProducto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un tipo de producto por ID
const deleteTipoProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoProducto = await TipoProducto.findByIdAndDelete(id);
        if (!tipoProducto) {
            return res.status(404).json({ error: 'Tipo de producto no encontrado.' });
        }
        res.status(200).json({ message: 'Tipo de producto eliminado exitosamente.', tipoProducto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTipoProducto,
    getAllTiposProductos,
    getTipoProductoById,
    updateTipoProducto,
    deleteTipoProducto
};
