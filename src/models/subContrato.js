const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el SubContrato de camiones o despacho
const subContratoSchema = new Schema({
    proveedor: {
        type: String,
        required: true, // Nombre del proveedor o empresa de transporte
    },
    nombreConductor: {
        type: String,
        required: true, // Nombre del conductor encargado del despacho
        trim: true
    },
    patenteCamion: {
        type: String,
        required: true, // Patente o matrícula del camión
        trim: true
    },
    tipoCamion: {
        type: String,
        required: true, // Tipo de camión (por ejemplo, camión refrigerado, de carga, etc.)
        trim: true
    }
}, {
    timestamps: true, // Registra las fechas de creación y actualización del subcontrato
    versionKey: false
});

module.exports = model("SubContrato", subContratoSchema);
