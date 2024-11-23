const FormularioContacto = require('../models/formularioContacto');

// Controlador para crear un nuevo mensaje
const crearMensaje = async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, asunto, mensaje } = req.body;

        if (!nombre || !apellido || !email || !telefono || !asunto || !mensaje) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (telefono.length < 8) {
            return res.status(400).json({ message: 'El número de teléfono debe tener al menos 8 dígitos' });
        }

        const nuevoMensaje = new FormularioContacto({
            nombre,
            apellido,
            email,
            telefono,
            asunto,
            mensaje,
        });

        await nuevoMensaje.save();

        res.status(201).json({ message: 'Mensaje enviado con éxito', nuevoMensaje });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controlador para obtener todos los mensajes
const obtenerMensajes = async (req, res) => {
    try {
        const mensajes = await FormularioContacto.find();
        res.status(200).json({ mensajes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para obtener un mensaje por ID
const obtenerMensajePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const mensaje = await FormularioContacto.findById(id);

        if (!mensaje) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        res.status(200).json({ mensaje });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para actualizar un mensaje por ID
const actualizarMensaje = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, email, telefono, asunto, mensaje } = req.body;

        const mensajeActualizado = await FormularioContacto.findByIdAndUpdate(
            id,
            { nombre, apellido, email, telefono, asunto, mensaje },
            { new: true, runValidators: true }
        );

        if (!mensajeActualizado) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        res.status(200).json({ message: 'Mensaje actualizado con éxito', data: mensajeActualizado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controlador para eliminar un mensaje por ID
const eliminarMensaje = async (req, res) => {
    try {
        const { id } = req.params;

        const mensajeEliminado = await FormularioContacto.findByIdAndDelete(id);

        if (!mensajeEliminado) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        res.status(200).json({ message: 'Mensaje eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    crearMensaje,
    obtenerMensajes,
    obtenerMensajePorId,
    actualizarMensaje,
    eliminarMensaje
};