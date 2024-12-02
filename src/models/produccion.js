const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const produccionSchema = new Schema({
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true
    },
    estado: {
        type: String,
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    }
},{
    timestamps: true,
    versionKey: false,
});

module.exports = model("Produccion", produccionSchema);
