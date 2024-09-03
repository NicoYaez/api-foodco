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

const obtenerIngredientes = async (req, res) => {
    try {
        const ingredientes = await Ingrediente.find()
            .populate('almacen', 'codigoAlmacen direccion') // Llena el campo `almacen` con los datos de la colección `Almacen`

        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los ingredientes' });
    }
};

module.exports = {
    crearIngrediente,
    obtenerIngredientes
};
