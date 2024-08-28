const mongoose = require('mongoose');

// Definir el schema para el Cliente
const clienteSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    nombreEmpresa: {
        type: String,
        required: true
    },
    ubicacion: {
        type: String,
        required: true
    },
    rubro: {
        type: Schema.Types.ObjectId,
        ref: 'Rubro',
        required: true
    },
    contacto: {
        type: Schema.Types.ObjectId,
        ref: 'Contacto',
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    }
});

module.exports = model("Cliente", clienteSchema);
module.exports = Cliente;