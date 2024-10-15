const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const tipoProductoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,  // Agrega `createdAt` y `updatedAt`
    versionKey: false  // Desactiva `__v`
});

module.exports = model('TipoProducto', tipoProductoSchema);
