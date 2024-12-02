const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const tipoProductoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('TipoProducto', tipoProductoSchema);
