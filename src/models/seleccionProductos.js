const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const seleccionProductosSchema = new Schema({
    productos: [{
        producto: {
            type: Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        cantidad: {
            type: Number,
            required: true
        }
    }],
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    precio: {
        type: Number,
        required: false
    },
    fecha: {
        type: Date,
        default: Date.now, // Asigna la fecha y hora actuales por defecto
        required: true
    }
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("seleccionProductos", seleccionProductosSchema);
