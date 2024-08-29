const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordenCompraSchema = new Schema({
    numero: {
        type: Number,
        unique: true,
        required: true
    },
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    seleccionProductos: [{
        type: Schema.Types.ObjectId,
        ref: 'seleccionProductos',
        required: true
    }],
    fecha: {
        type: Date,
        default: Date.now, // Asigna la fecha y hora actuales por defecto
        required: true
    }
},{
    timestamps: true,
    versionKey: false,
});

module.exports = model("ordenCompra", ordenCompraSchema);
