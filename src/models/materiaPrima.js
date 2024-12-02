const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const materiaPrimaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    stock_minimo: {
        type: Number,
        required: true,
        min: 0
    },
    unidad: {
        type: String,
        required: true
    },
    fecha_ingreso: {
        type: Date,
        required: true,
        default: Date.now
    },
    fecha_vencimiento: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.fecha_ingreso;
            },
            message: 'La fecha de vencimiento debe ser posterior a la fecha de ingreso.'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('MateriaPrima', materiaPrimaSchema);
