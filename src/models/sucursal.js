const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const sucursalSchema = new Schema({
    codigoSucursal: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: false
});

module.exports = model("Sucursal", sucursalSchema);