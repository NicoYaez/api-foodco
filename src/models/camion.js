const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const camionSchema = new Schema({
    placa: {
        type: String,
        required: true
    },
    marca: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    año: {
        type: Number,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    }
});

module.exports = model("Camion", camionSchema);