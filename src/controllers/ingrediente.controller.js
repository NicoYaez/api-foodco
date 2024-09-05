const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

// Función para crear un ingrediente y guardarlo en un almacén
const crearIngrediente = async (req, res) => {
    const { codigoIngrediente, nombre, precio, almacenId, medida, cantidad } = req.body;

    try {
        // Verificar si el almacén existe
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Crear el nuevo ingrediente
        const nuevoIngrediente = new Ingrediente({
            codigoIngrediente,
            nombre,
            precio,
            almacen: almacenId,
            medida,
            cantidad
        });

        // Guardar el ingrediente en la base de datos
        await nuevoIngrediente.save();

        // Crear una entrada de ingrediente en el stock del almacén
        const nuevoIngredienteAlmacen = new IngredienteAlmacen({
            ingrediente: nuevoIngrediente._id,
            almacen: almacenId,
            cantidad
        });

        // Guardar la relación del ingrediente en el almacén
        await nuevoIngredienteAlmacen.save();

        // Actualizar el almacén con el nuevo ingrediente
        almacen.ingredienteAlmacen.push(nuevoIngredienteAlmacen._id);
        await almacen.save();

        return res.status(201).json({
            message: 'Ingrediente creado y agregado al almacén exitosamente',
            ingrediente: nuevoIngrediente,
            ingredienteAlmacen: nuevoIngredienteAlmacen
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear el ingrediente',
            error: error.message
        });
    }
};

const verIngredientes = async (req, res) => {
    try {
        // Obtener todos los ingredientes de la base de datos, incluyendo los detalles del almacén
        const ingredientes = await Ingrediente.find()
            .populate('almacen');  // Popula los detalles del almacén asociado al ingrediente

        // Verificar si no se encontraron ingredientes
        if (ingredientes.length === 0) {
            return res.status(404).json({ message: "No hay ingredientes registrados" });
        }

        // Enviar los ingredientes obtenidos en la respuesta
        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error('Error al obtener los ingredientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const verIngredientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el ingrediente por su ID
        const ingrediente = await Ingrediente.findById(id).populate('almacen');

        // Verificar si se encontró el ingrediente
        if (!ingrediente) {
            return res.status(404).json({ message: `Ingrediente con id ${id} no encontrado` });
        }

        // Enviar el ingrediente encontrado en la respuesta
        return res.status(200).json(ingrediente);
    } catch (error) {
        console.error('Error al obtener el ingrediente:', error);
        return res.status(500).json({
            message: 'Error al obtener el ingrediente',
            error: error.message
        });
    }
};

module.exports = {
    crearIngrediente,
    verIngredientes,
    verIngredientePorId
};
