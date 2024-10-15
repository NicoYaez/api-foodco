const ProduccionDiaria = require('../models/produccionDiaria');

// Crear una nueva producción diaria
const createProduccionDiaria = async (req, res) => {
    const { tipo_producto_id, cantidad_producida, fecha_produccion, materiasPrimasUtilizadas } = req.body;

    // Validaciones básicas
    if (!tipo_producto_id || !cantidad_producida || !fecha_produccion || !materiasPrimasUtilizadas) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }

    try {
        const produccionDiaria = new ProduccionDiaria({
            tipo_producto_id,
            cantidad_producida,
            fecha_produccion,
            materiasPrimasUtilizadas
        });

        await produccionDiaria.save();
        res.status(200).json({ message: 'Producción diaria creada exitosamente.', produccionDiaria });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las producciones diarias
const getAllProduccionesDiarias = async (req, res) => {
    try {
        const produccionesDiarias = await ProduccionDiaria.find().populate('tipo_producto_id').populate('materiasPrimasUtilizadas.id');
        res.status(200).json(produccionesDiarias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una producción diaria por ID
const getProduccionDiariaById = async (req, res) => {
    const { id } = req.params;
    try {
        const produccionDiaria = await ProduccionDiaria.findById(id).populate('tipo_producto_id').populate('materiasPrimasUtilizadas.id');
        if (!produccionDiaria) {
            return res.status(404).json({ error: 'Producción diaria no encontrada.' });
        }
        res.status(200).json(produccionDiaria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una producción diaria por ID
const updateProduccionDiaria = async (req, res) => {
    const { id } = req.params; // ID de la producción diaria que se va a actualizar
    const { tipo_producto_id, cantidad_producida, fecha_produccion, materiasPrimasUtilizadas } = req.body;

    try {
        // Buscar la producción diaria por su ID
        const produccionDiaria = await ProduccionDiaria.findById(id);
        if (!produccionDiaria) {
            return res.status(404).json({ message: `Producción diaria con id ${id} no encontrada` });
        }

        // Actualizar solo los campos proporcionados
        if (tipo_producto_id) produccionDiaria.tipo_producto_id = tipo_producto_id;
        if (cantidad_producida !== undefined && typeof cantidad_producida === 'number' && cantidad_producida >= 0) {
            produccionDiaria.cantidad_producida = cantidad_producida;
        }
        if (fecha_produccion && !isNaN(Date.parse(fecha_produccion))) {
            produccionDiaria.fecha_produccion = fecha_produccion;
        }
        if (materiasPrimasUtilizadas && Array.isArray(materiasPrimasUtilizadas)) {
            // Validar que las materias primas utilizadas sean válidas antes de asignarlas
            const validMateriasPrimas = materiasPrimasUtilizadas.every(mp => (
                mp.id && mp.nombre && mp.cantidadUsada !== undefined && mp.unidad
            ));

            if (!validMateriasPrimas) {
                return res.status(400).json({ message: 'Los datos de las materias primas utilizadas no son válidos.' });
            }

            produccionDiaria.materiasPrimasUtilizadas = materiasPrimasUtilizadas;
        }

        // Guardar los cambios
        await produccionDiaria.save();

        return res.status(200).json({ message: 'Producción diaria actualizada exitosamente', produccionDiaria });
    } catch (error) {
        console.error('Error al actualizar la producción diaria:', error.message);
        return res.status(500).json({ message: 'Error al actualizar la producción diaria', error: error.message });
    }
};

// Eliminar una producción diaria por ID
const deleteProduccionDiaria = async (req, res) => {
    const { id } = req.params;
    try {
        const produccionDiaria = await ProduccionDiaria.findByIdAndDelete(id);
        if (!produccionDiaria) {
            return res.status(404).json({ error: 'Producción diaria no encontrada.' });
        }
        res.status(200).json({ message: 'Producción diaria eliminada exitosamente.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduccionDiaria,
    getAllProduccionesDiarias,
    getProduccionDiariaById,
    updateProduccionDiaria,
    deleteProduccionDiaria
};