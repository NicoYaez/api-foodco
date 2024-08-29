const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const detalleVentaSchema = new Schema({
    producto: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    precio: {
        type: Float32Array,
        required: true
    },
    venta: {
        type: Schema.Types.ObjectId,
        ref: 'Venta',
        required: true
    }
});

module.exports = model("detalleVenta", detalleVentaSchema);