const mongoose = require('mongoose');

// Definir el schema para el Cliente
const sucursalSchema = new Schema({
    codigoSucursal: {
        type: Number,
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
    versionKey: true,
});

module.exports = model("Sucursal", sucursalSchema);