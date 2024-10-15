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
        min: 0  // No puede ser negativo
    },
    stock_minimo: {
        type: Number,
        required: true,
        min: 0  // No puede ser negativo
    },
    unidad: {
        type: String,
        required: true
    },
    fecha_ingreso: {
        type: Date,
        required: true,
        default: Date.now  // Asigna la fecha actual por defecto
    },
    fecha_vencimiento: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                // Validar que la fecha de vencimiento sea posterior a la de ingreso
                return value > this.fecha_ingreso;
            },
            message: 'La fecha de vencimiento debe ser posterior a la fecha de ingreso.'
        }
    }
}, {
    timestamps: true,  // Agrega `createdAt` y `updatedAt`
    versionKey: false  // Desactiva `__v`
});

module.exports = model('MateriaPrima', materiaPrimaSchema);
