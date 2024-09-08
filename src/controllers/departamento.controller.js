const Departamento = require('../models/departamento'); // Asegúrate de que la ruta sea correcta

// Crear un nuevo departamento
const crearDepartamento = async (req, res) => {
    try {
        const { nombre } = req.body;

        if(!nombre) {
            return res.status(400).json({ message: 'El nombre del departamento es requerido' });
        }

        // Verificar si ya existe un departamento con el mismo nombre
        const departamentoExistente = await Departamento.findOne({ nombre });
        if (departamentoExistente) {
            return res.status(400).json({ message: 'El departamento ya existe' });
        }

        const nuevoDepartamento = new Departamento({ nombre });
        await nuevoDepartamento.save();

        res.status(200).json({
            message: 'Departamento creado exitosamente',
            departamento: nuevoDepartamento
        });
    } catch (error) {
        console.error('Error al crear el departamento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todos los departamentos
const obtenerDepartamentos = async (req, res) => {
    try {
        const departamentos = await Departamento.find();
        res.status(200).json(departamentos);
    } catch (error) {
        console.error('Error al obtener los departamentos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener un departamento por ID
const obtenerDepartamentoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const departamento = await Departamento.findById(id);

        if (!departamento) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }

        res.status(200).json(departamento);
    } catch (error) {
        console.error('Error al obtener el departamento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar un departamento por ID
const actualizarDepartamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const departamento = await Departamento.findByIdAndUpdate(
            id,
            { nombre },
            { new: true } // Retorna el documento actualizado
        );

        if (!departamento) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }

        res.status(200).json({
            message: 'Departamento actualizado exitosamente',
            departamento
        });
    } catch (error) {
        console.error('Error al actualizar el departamento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar un departamento por ID
const eliminarDepartamento = async (req, res) => {
    try {
        const { id } = req.params;

        const departamento = await Departamento.findByIdAndDelete(id);
        if (!departamento) {
            return res.status(404).json({ message: 'Departamento no encontrado' });
        }

        res.status(200).json({ message: 'Departamento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el departamento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    crearDepartamento,
    obtenerDepartamentos,
    obtenerDepartamentoPorId,
    actualizarDepartamento,
    eliminarDepartamento
};