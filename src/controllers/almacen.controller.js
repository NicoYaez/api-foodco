// controllers/almacen.controller.js
const Almacen = require('../models/almacen');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');

const crearAlmacen = async (req, res) => {
    try {
        const { codigoAlmacen, capacidad, direccion, sucursal, productoAlmacen, ingredienteAlmacen } = req.body;

        // Validar que todos los campos requeridos están presentes
        if (!codigoAlmacen || !capacidad || !direccion || !sucursal) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Crear un nuevo almacén
        const nuevoAlmacen = new Almacen({
            codigoAlmacen,
            capacidad,
            direccion,
            sucursal,
            productoAlmacen: productoAlmacen || [], // Asegurarse de que sea un array, incluso si está vacío
            ingredienteAlmacen: ingredienteAlmacen || [] // Asegurarse de que sea un array, incluso si está vacío
        });

        // Guardar el almacén en la base de datos
        const almacenGuardado = await nuevoAlmacen.save();

        // Enviar respuesta exitosa
        return res.status(200).json(almacenGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el almacén' });
    }
};

const obtenerAlmacenes = async (req, res) => {
    try {
        const almacenes = await Almacen.find()
            .populate('sucursal') // Puedes especificar qué campos incluir de la sucursal
            .populate('ingredienteAlmacen'); // Asumiendo que Ingrediente tiene estos campos

        return res.status(200).json(almacenes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los almacenes' });
    }
};

//ALMACEN

// Crear un ingrediente en el almacén
const agregarIngredienteAlmacen  = async (req, res) => {
    const { ingredienteId, almacenId, cantidad } = req.body;

    try {
        // Verificar si el almacén existe
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Verificar si el ingrediente existe
        const ingrediente = await Ingrediente.findById(ingredienteId);
        if (!ingrediente) {
            return res.status(404).json({ message: 'Ingrediente no encontrado' });
        }

        // Crear una entrada de ingrediente en el almacén
        const nuevoIngredienteAlmacen = new IngredienteAlmacen({
            ingrediente: ingredienteId,
            almacen: almacenId,
            cantidad
        });

        // Guardar la entrada de ingrediente en el almacén
        await nuevoIngredienteAlmacen.save();

        // Actualizar el almacén con el nuevo ingrediente
        almacen.ingredienteAlmacen.push(nuevoIngredienteAlmacen._id);
        await almacen.save();

        return res.status(201).json({
            message: 'Ingrediente agregado al almacén exitosamente',
            ingredienteAlmacen: nuevoIngredienteAlmacen
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al agregar el ingrediente al almacén',
            error: error.message
        });
    }
};

// Leer todos los ingredientes de un almacén
const obtenerIngredientesAlmacen = async (req, res) => {
    const { almacenId } = req.body;

    try {
        // Verificar si el almacén existe
        const almacen = await Almacen.findById(almacenId)
            .populate({
                path: 'ingredienteAlmacen',
                populate: {
                    path: 'ingrediente',
                    model: 'Ingrediente'
                }
            });

        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        return res.status(200).json({ ingredientes: almacen.ingredienteAlmacen });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al obtener los ingredientes del almacén',
            error: error.message
        });
    }
};

// Actualizar el stock de un ingrediente en el almacén
const actualizarIngredienteAlmacen = async (req, res) => {
    const { ingredienteId, almacenId, cantidad } = req.body;

    try {
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Verificar si la entrada de ingrediente en el almacén existe
        const ingredienteAlmacen = await IngredienteAlmacen.findOne({
            ingrediente: ingredienteId,
            almacen: almacenId
        });

        if (!ingredienteAlmacen) {
            return res.status(404).json({ message: 'Ingrediente en el almacén especificado no encontrado' });
        }

        // Actualizar la cantidad del ingrediente en el almacén
        ingredienteAlmacen.cantidad = cantidad;
        await ingredienteAlmacen.save();

        // Populando los datos de ingrediente y almacen después de guardarlos
        const ingredienteAlmacenPopulado = await IngredienteAlmacen.findById(ingredienteAlmacen._id)
            .populate('ingrediente')
            .populate('almacen');

        return res.status(200).json({
            message: 'Stock del ingrediente actualizado exitosamente',
            ingredienteAlmacen: ingredienteAlmacenPopulado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al actualizar el stock del ingrediente',
            error: error.message
        });
    }
};

module.exports = {
    crearAlmacen,
    obtenerAlmacenes,
    agregarIngredienteAlmacen ,
    obtenerIngredientesAlmacen ,
    actualizarIngredienteAlmacen
};
