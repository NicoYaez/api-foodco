const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordenVentaSchema = new Schema({
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
    productos: [{
        type: Schema.Types.ObjectId,
        ref: 'producto',
        required: true
    }],
    total: {
        type: Number,
        unique: true,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    }
},{
    timestamps: true,
    versionKey: false,
});

module.exports = model("ordenVenta", ordenVentaSchema);
