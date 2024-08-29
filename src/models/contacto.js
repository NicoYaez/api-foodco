const mongoose = require('mongoose');
const Cliente = require('./cliente');

const { Schema, model } = mongoose;

// Definir el schema para el Ejecutivo
const contactoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

// Definir discriminador para Ejecutivo_Ventas
const Contacto = Cliente.discriminator('Contacto', contactoSchema);
module.exports = Contacto;