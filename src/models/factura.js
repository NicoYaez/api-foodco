const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const facturaSchema = new Schema({
    numero: {
        type: String,
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    venta: {
        type: Schema.Types.ObjectId,
        ref: 'Venta',
        required: true
    },
    subContrato: {
        type: Schema.Types.ObjectId,
        ref: 'subContrato',
        required: true
    }
});

module.exports = model("Factura", facturaSchema);