const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const seleccionProductosSchema = new Schema({
    producto: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    }],
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
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
    fecha: {
        type: Date,
        default: Date.now, // Asigna la fecha y hora actuales por defecto
        required: true
    }
},{
    timestamps: true,
    versionKey: false,
});

module.exports = model("seleccionProductos", seleccionProductosSchema);
