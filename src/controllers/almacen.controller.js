// controllers/almacen.controller.js
const Almacen = require('../models/almacen');

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
        return res.status(201).json(almacenGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el almacén' });
    }
};

const obtenerAlmacenes = async (req, res) => {
    try {
        const almacenes = await Almacen.find()
            .populate('sucursal') // Puedes especificar qué campos incluir
            //.populate('productoAlmacen') // Asumiendo que ProductoAlmacen tiene estos campos
            //.populate('ingredienteAlmacen'); // Asumiendo que Ingrediente tiene estos campos

        return res.status(200).json(almacenes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los almacenes' });
    }
};

module.exports = {
    crearAlmacen,
    obtenerAlmacenes
};
