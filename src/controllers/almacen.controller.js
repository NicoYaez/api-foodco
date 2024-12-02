//POR AHORA ALMACEN NO SE UTILIZA, PERO SE DEJA EL CODIGO POR SI SE NECESITA EN EL FUTURO
const Almacen = require('../models/almacen');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');

const crearAlmacen = async (req, res) => {
    try {
        const { codigoAlmacen, capacidad, direccion, sucursal } = req.body;

        if (!codigoAlmacen || !capacidad || !direccion || !sucursal) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        const nuevoAlmacen = new Almacen({
            codigoAlmacen,
            capacidad,
            direccion,
            sucursal,
            ingredienteAlmacen: []
        });

        const almacenGuardado = await nuevoAlmacen.save();

        return res.status(200).json(almacenGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el almacén' });
    }
};

const actualizarAlmacen = async (req, res) => {
    try {
        const { codigoAlmacen, capacidad, direccion, sucursal } = req.body;

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID del almacén' });
        }

        const camposAActualizar = {};
        if (codigoAlmacen) camposAActualizar.codigoAlmacen = codigoAlmacen;
        if (capacidad) camposAActualizar.capacidad = capacidad;
        if (direccion) camposAActualizar.direccion = direccion;
        if (sucursal) camposAActualizar.sucursal = sucursal;

        if (Object.keys(camposAActualizar).length === 0) {
            return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
        }

        const almacenActualizado = await Almacen.findByIdAndUpdate(id, camposAActualizar, { new: true });

        if (!almacenActualizado) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        return res.status(200).json(almacenActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el almacén' });
    }
};

const eliminarAlmacen = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Se requiere el ID del almacén' });
        }

        const almacenEliminado = await Almacen.findByIdAndDelete(id);

        if (!almacenEliminado) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        return res.status(200).json({ message: 'Almacén eliminado correctamente', almacenEliminado });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el almacén' });
    }
};

const obtenerAlmacenes = async (req, res) => {
    try {
        const almacenes = await Almacen.find()
            .populate('sucursal')
            .populate('ingredienteAlmacen');

        return res.status(200).json(almacenes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los almacenes' });
    }
};

const agregarIngredienteAlmacen = async (req, res) => {
    const { ingredienteId, almacenId, cantidad } = req.body;

    try {
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        const ingrediente = await Ingrediente.findById(ingredienteId);
        if (!ingrediente) {
            return res.status(404).json({ message: 'Ingrediente no encontrado' });
        }

        const nuevoIngredienteAlmacen = new IngredienteAlmacen({
            ingrediente: ingredienteId,
            almacen: almacenId,
            cantidad
        });

        await nuevoIngredienteAlmacen.save();

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

const obtenerIngredientesAlmacen = async (req, res) => {
    const { almacenId } = req.body;

    try {
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

const actualizarIngredienteAlmacen = async (req, res) => {
    const { ingredienteId, almacenId, cantidad } = req.body;

    try {
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        const ingredienteAlmacen = await IngredienteAlmacen.findOne({
            ingrediente: ingredienteId,
            almacen: almacenId
        });

        if (!ingredienteAlmacen) {
            return res.status(404).json({ message: 'Ingrediente en el almacén especificado no encontrado' });
        }

        ingredienteAlmacen.cantidad = cantidad;
        await ingredienteAlmacen.save();

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
    agregarIngredienteAlmacen,
    obtenerIngredientesAlmacen,
    actualizarIngredienteAlmacen,
    actualizarAlmacen,
    eliminarAlmacen
};
