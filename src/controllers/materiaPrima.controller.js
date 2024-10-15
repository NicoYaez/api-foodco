const MateriaPrima = require('../models/materiaPrima');

const createMateriaPrima = async (req, res) => {
    const { nombre, tipo, cantidad, stock_minimo, unidad, fecha_ingreso, fecha_vencimiento } = req.body;

    // Validaciones manuales usando condicionales if
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
        return res.status(400).send({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
    }

    if (!tipo) {
        return res.status(400).send({ error: 'El tipo es obligatorio' });
    }

    if (cantidad === undefined || typeof cantidad !== 'number' || cantidad < 0) {
        return res.status(400).send({ error: 'La cantidad es obligatoria y debe ser un número mayor o igual a 0.' });
    }

    if (stock_minimo === undefined || typeof stock_minimo !== 'number' || stock_minimo < 0) {
        return res.status(400).send({ error: 'El stock mínimo es obligatorio y debe ser un número mayor o igual a 0.' });
    }

    if (!unidad || typeof unidad !== 'string' || unidad.trim().length === 0) {
        return res.status(400).send({ error: 'La unidad es obligatoria y debe ser una cadena de texto válida.' });
    }

    if (!fecha_ingreso || isNaN(Date.parse(fecha_ingreso))) {
        return res.status(400).send({ error: 'La fecha de ingreso es obligatoria y debe ser una fecha válida.' });
    }

    if (!fecha_vencimiento || isNaN(Date.parse(fecha_vencimiento))) {
        return res.status(400).send({ error: 'La fecha de vencimiento es obligatoria y debe ser una fecha válida.' });
    }

    if (new Date(fecha_vencimiento) <= new Date(fecha_ingreso)) {
        return res.status(400).send({ error: 'La fecha de vencimiento debe ser posterior a la fecha de ingreso.' });
    }

    try {
        // Crear nueva materia prima con los datos validados
        const materiaPrima = new MateriaPrima({
            nombre,
            tipo,
            cantidad,
            stock_minimo,
            unidad,
            fecha_ingreso,
            fecha_vencimiento
        });

        // Guardar la materia prima en la base de datos
        await materiaPrima.save();
        res.status(200).json({ message: 'Materia prima creada exitosamente.', materiaPrima });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getAllMateriasPrimas = async (req, res) => {
    try {
        const materiasPrimas = await MateriaPrima.find();
        res.status(200).send(materiasPrimas);
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener las materias primas.' });
    }
};

const getMateriaPrimaById = async (req, res) => {
    const { id } = req.params;
    try {
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).send({ error: 'Materia prima no encontrada.' });
        }
        res.status(200).send(materiaPrima);
    } catch (error) {
        res.status(500).send({ error: 'Error al obtener la materia prima.' });
    }
};

const updateMateriaPrima = async (req, res) => {
    const { id } = req.params; // ID de la materia prima que se va a actualizar
    const { nombre, tipo, cantidad, stock_minimo, unidad, fecha_ingreso, fecha_vencimiento } = req.body;

    try {
        // Buscar la materia prima por su ID
        const materiaPrima = await MateriaPrima.findById(id);
        if (!materiaPrima) {
            return res.status(404).json({ message: `Materia prima con id ${id} no encontrada` });
        }

        // Actualizar solo los campos proporcionados
        if (nombre) materiaPrima.nombre = nombre;
        if (tipo) materiaPrima.tipo = tipo;
        if (cantidad !== undefined && typeof cantidad === 'number' && cantidad >= 0) materiaPrima.cantidad = cantidad;
        if (stock_minimo !== undefined && typeof stock_minimo === 'number' && stock_minimo >= 0) materiaPrima.stock_minimo = stock_minimo;
        if (unidad) materiaPrima.unidad = unidad;
        if (fecha_ingreso && !isNaN(Date.parse(fecha_ingreso))) materiaPrima.fecha_ingreso = fecha_ingreso;
        if (fecha_vencimiento && !isNaN(Date.parse(fecha_vencimiento))) {
            // Validar que la fecha de vencimiento sea posterior a la de ingreso
            if (new Date(fecha_vencimiento) <= new Date(materiaPrima.fecha_ingreso)) {
                return res.status(400).json({ message: 'La fecha de vencimiento debe ser posterior a la fecha de ingreso.' });
            }
            materiaPrima.fecha_vencimiento = fecha_vencimiento;
        }

        // Guardar los cambios
        await materiaPrima.save();

        return res.status(200).json({ message: 'Materia prima actualizada exitosamente', materiaPrima });
    } catch (error) {
        console.error('Error al actualizar la materia prima:', error.message);
        return res.status(500).json({ message: 'Error al actualizar la materia prima', error: error.message });
    }
};

const deleteMateriaPrima = async (req, res) => {
    const { id } = req.params;
    try {
        const materiaPrima = await MateriaPrima.findByIdAndDelete(id);
        if (!materiaPrima) {
            return res.status(404).send({ error: 'Materia prima no encontrada.' });
        }
        res.status(200).json({ message: 'Materia prima eliminada exitosamente.'});
    } catch (error) {
        res.status(500).send({ error: 'Error al eliminar la materia prima.' });
    }
};

module.exports = {
    createMateriaPrima,
    getAllMateriasPrimas,
    getMateriaPrimaById,
    updateMateriaPrima,
    deleteMateriaPrima
};
