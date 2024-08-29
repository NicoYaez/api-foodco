const mongoose = require('mongoose');
const Ingrediente = require('../models/ingrediente');

// Crear un Ingrediente
const crearIngrediente = async (req, res) => {
    try {
        const { codigoIngrediente, nombre, precio, costo, almacen, medida, cantidad } = req.body;

        // Validar que todos los campos requeridos están presentes
        if (!codigoIngrediente || !nombre || !precio || !costo || !almacen || !medida || !cantidad) {
            return res.status(400).json({ message: 'Faltan campos requeridos' });
        }

        // Crear un nuevo ingrediente
        const nuevoIngrediente = new Ingrediente({
            codigoIngrediente,
            nombre,
            precio,
            costo,
            almacen,
            medida,
            cantidad
        });

        // Guardar el ingrediente en la base de datos
        const ingredienteGuardado = await nuevoIngrediente.save();

        // Enviar respuesta exitosa
        return res.status(200).json(ingredienteGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el ingrediente' });
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
