const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

const crearIngrediente = async (req, res) => {
    const { codigoIngrediente, nombre, precio, almacenId, medida, cantidad } = req.body;

    try {
        const ingredienteExistente = await Ingrediente.findOne({ codigoIngrediente });
        if (ingredienteExistente) {
            return res.status(400).json({ message: 'El código de ingrediente ya existe. Debe ser único.' });
        }

        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        const nuevoIngrediente = new Ingrediente({
            codigoIngrediente,
            nombre,
            precio,
            almacen: almacenId,
            medida,
            cantidad
        });

        await nuevoIngrediente.save();

        const nuevoIngredienteAlmacen = new IngredienteAlmacen({
            ingrediente: nuevoIngrediente._id,
            almacen: almacenId,
            cantidad
        });

        await nuevoIngredienteAlmacen.save();

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
        const ingredientes = await Ingrediente.find()
            .populate('almacen');

        if (ingredientes.length === 0) {
            return res.status(404).json({ message: "No hay ingredientes registrados" });
        }

        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error('Error al obtener los ingredientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const verIngredientesNombres = async (req, res) => {
    try {
        const ingredientes = await Ingrediente.find({}, 'nombre _id').sort({ nombre: 1 });

        if (ingredientes.length === 0) {
            return res.status(404).json({ message: "No hay ingredientes registrados" });
        }

        return res.status(200).json(ingredientes);
    } catch (error) {
        console.error('Error al obtener los ingredientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const verIngredientePorId = async (req, res) => {
    try {
        const { id } = req.params;

        const ingrediente = await Ingrediente.findById(id).populate('almacen');

        if (!ingrediente) {
            return res.status(404).json({ message: `Ingrediente con id ${id} no encontrado` });
        }

        return res.status(200).json(ingrediente);
    } catch (error) {
        console.error('Error al obtener el ingrediente:', error);
        return res.status(500).json({
            message: 'Error al obtener el ingrediente',
            error: error.message
        });
    }
};

const actualizarIngrediente = async (req, res) => {
    const { id } = req.params;
    const { codigoIngrediente, nombre, precio, almacenId, medida, cantidad } = req.body;

    try {
        const ingrediente = await Ingrediente.findById(id);
        if (!ingrediente) {
            return res.status(404).json({ message: `Ingrediente con id ${id} no encontrado` });
        }

        if (codigoIngrediente) ingrediente.codigoIngrediente = codigoIngrediente;
        if (nombre) ingrediente.nombre = nombre;
        if (precio) ingrediente.precio = precio;
        if (medida) ingrediente.medida = medida;
        if (cantidad) ingrediente.cantidad = cantidad;
        if (almacenId) {
            const almacen = await Almacen.findById(almacenId);
            if (!almacen) {
                return res.status(404).json({ message: 'Almacén no encontrado' });
            }
            ingrediente.almacen = almacenId;

            const nuevoIngredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente: id, almacen: almacenId });
            if (!nuevoIngredienteAlmacen) {
                const nuevaEntradaIngredienteAlmacen = new IngredienteAlmacen({
                    ingrediente: id,
                    almacen: almacenId,
                    cantidad: cantidad || ingrediente.cantidad
                });

                await nuevaEntradaIngredienteAlmacen.save();
                almacen.ingredienteAlmacen.push(nuevaEntradaIngredienteAlmacen._id);
                await almacen.save();
            }
        }

        await ingrediente.save();

        return res.status(200).json({ message: 'Ingrediente actualizado exitosamente', ingrediente });
    } catch (error) {
        console.error('Error al actualizar el ingrediente:', error.message);
        return res.status(500).json({ message: 'Error al actualizar el ingrediente', error: error.message });
    }
};

const eliminarIngrediente = async (req, res) => {
    const { id } = req.params;

    try {
        const ingrediente = await Ingrediente.findById(id);
        if (!ingrediente) {
            return res.status(404).json({ message: `Ingrediente con id ${id} no encontrado` });
        }

        const ingredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente: id });
        if (ingredienteAlmacen) {
            const almacen = await Almacen.findById(ingredienteAlmacen.almacen);
            if (almacen) {
                almacen.ingredienteAlmacen.pull(ingredienteAlmacen._id);
                await almacen.save();
            }

            await ingredienteAlmacen.remove();
        }

        await ingrediente.remove();

        return res.status(200).json({ message: 'Ingrediente eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el ingrediente:', error.message);
        return res.status(500).json({ message: 'Error al eliminar el ingrediente', error: error.message });
    }
};

module.exports = {
    crearIngrediente,
    verIngredientes,
    verIngredientePorId,
    actualizarIngrediente,
    eliminarIngrediente,
    verIngredientesNombres
};
