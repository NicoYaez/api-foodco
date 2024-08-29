const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const ventaSchema = new Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    detalleVenta: {
        type: Schema.Types.ObjectId,
        ref: 'detalleVenta',
        required: true
    }
});

module.exports = model("Venta", ventaSchema);