const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordenCompraSchema = new Schema({
    numero: {
        type: Number,
        unique: true,
        required: true,
        default: '1'
    },
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: false
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobado', 'rechazado', 'en_produccion', 'despachado'],
        default: 'pendiente',
        required: true
    },
    seleccionProductos: {
        type: Schema.Types.ObjectId,
        ref: 'seleccionProductos',
        required: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now, // Asigna la fecha y hora actuales por defecto
        required: true
    },
    fechaRequerida: {
        type: Date,
        required: true
    },
    historialCambios: [{
        estadoAnterior: String,
        estadoNuevo: String,
        empleado: {
            type: Schema.Types.ObjectId,
            ref: 'Empleado',
            required: true
        },
        fechaCambio: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    versionKey: false,
});

// Middleware para generar el número de orden único
ordenCompraSchema.pre('save', async function (next) {
    const orden = this;

    if (orden.isNew) {
        try {
            const lastOrder = await model('ordenCompra').findOne().sort({ numero: -1 });
            orden.numero = lastOrder ? lastOrder.numero + 1 : 1;

            console.log('Número de orden asignado:', orden.numero);

            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = model("ordenCompra", ordenCompraSchema);
