// controllers/almacen.controller.js
const Almacen = require('../models/almacen');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');

const crearAlmacen = async (req, res) => {
    try {
        const { codigoAlmacen, capacidad, direccion, sucursal} = req.body;

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
            ingredienteAlmacen: [] // Asegurarse de que sea un array, incluso si está vacío
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

const actualizarAlmacen = async (req, res) => {
    try {
        const { codigoAlmacen, capacidad, direccion, sucursal } = req.body;

        // Verificar si se envió un ID de almacén para actualizar
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID del almacén' });
        }

        // Crear un objeto vacío y añadir solo los campos que se enviaron en la solicitud
        const camposAActualizar = {};
        if (codigoAlmacen) camposAActualizar.codigoAlmacen = codigoAlmacen;
        if (capacidad) camposAActualizar.capacidad = capacidad;
        if (direccion) camposAActualizar.direccion = direccion;
        if (sucursal) camposAActualizar.sucursal = sucursal;

        // Verificar si se envió algún campo para actualizar
        if (Object.keys(camposAActualizar).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
        }

        // Actualizar el almacén en la base de datos
        const almacenActualizado = await Almacen.findByIdAndUpdate(id, camposAActualizar, { new: true });

        // Verificar si el almacén existe
        if (!almacenActualizado) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Enviar respuesta exitosa
        return res.status(200).json(almacenActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el almacén' });
    }
};

const eliminarAlmacen = async (req, res) => {
    try {
        // Obtener el ID de los parámetros de la ruta
        const { id } = req.params;

        // Verificar si se envió el ID
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID del almacén' });
        }

        // Intentar eliminar el almacén de la base de datos
        const almacenEliminado = await Almacen.findByIdAndDelete(id);

        // Verificar si el almacén fue encontrado y eliminado
        if (!almacenEliminado) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Respuesta exitosa
        return res.status(200).json({ message: 'Almacén eliminado correctamente', almacenEliminado });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el almacén' });
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
    actualizarIngredienteAlmacen,
    actualizarAlmacen,
    eliminarAlmacen
};
