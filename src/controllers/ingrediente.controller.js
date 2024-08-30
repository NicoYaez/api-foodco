const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

// Función para crear un ingrediente y guardarlo en un almacén
const crearIngrediente = async (req, res) => {
    const { codigoIngrediente, nombre, precio, costo, almacenId, medida, cantidad } = req.body;

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
            costo,
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
    const { almacenId } = req.params;

    try {
        // Verificar si el almacén existe
        const almacen = await Almacen.findById(almacenId).populate('ingredienteAlmacen');
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
    const { ingredienteAlmacenId, cantidad } = req.body;

    try {
        // Verificar si la entrada de ingrediente en el almacén existe
        const ingredienteAlmacen = await IngredienteAlmacen.findById(ingredienteAlmacenId);
        if (!ingredienteAlmacen) {
            return res.status(404).json({ message: 'Ingrediente en almacén no encontrado' });
        }

        // Actualizar la cantidad del ingrediente en el almacén
        ingredienteAlmacen.cantidad = cantidad;
        await ingredienteAlmacen.save();

        return res.status(200).json({
            message: 'Stock del ingrediente actualizado exitosamente',
            ingredienteAlmacen
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al actualizar el stock del ingrediente',
            error: error.message
        });
    }
};

// Eliminar un ingrediente del almacén
const eliminarIngredienteAlmacen  = async (req, res) => {
    const { ingredienteAlmacenId, almacenId } = req.params;

    try {
        // Verificar si la entrada de ingrediente en el almacén existe
        const ingredienteAlmacen = await IngredienteAlmacen.findById(ingredienteAlmacenId);
        if (!ingredienteAlmacen) {
            return res.status(404).json({ message: 'Ingrediente en almacén no encontrado' });
        }

        // Eliminar la entrada de ingrediente del almacén
        await IngredienteAlmacen.findByIdAndDelete(ingredienteAlmacenId);

        // Actualizar el almacén eliminando la referencia al ingrediente
        await Almacen.findByIdAndUpdate(almacenId, {
            $pull: { ingredienteAlmacen: ingredienteAlmacenId }
        });

        return res.status(200).json({
            message: 'Ingrediente eliminado del almacén exitosamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al eliminar el ingrediente del almacén',
            error: error.message
        });
    }
};


module.exports = {
    crearIngrediente,
    obtenerIngredientes,
    agregarIngredienteAlmacen ,
    obtenerIngredientesAlmacen ,
    actualizarIngredienteAlmacen ,
    eliminarIngredienteAlmacen 
};
