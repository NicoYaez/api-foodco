const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const asignacionCamionSchema = new Schema({
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    camion: {
        type: Schema.Types.ObjectId,
        ref: 'Camion',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        required: true
    }
});

module.exports = model("asignacionCamion", asignacionCamionSchema);