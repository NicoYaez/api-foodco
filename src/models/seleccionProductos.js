const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const OrdenCompra = require('../models/ordenCompra');

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
    direccion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: false
    },
    fechaRequerida: {
        type: Date,
        required: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false,
});

seleccionProductosSchema.post('save', async function (doc, next) {
    try {
        const fechaActual = new Date();
        const diasAntelacion = 15;
        const fechaMinima = new Date(fechaActual.setDate(fechaActual.getDate() + diasAntelacion));

        // Validar que la fecha requerida esté al menos 15 días en el futuro
        if (new Date(doc.fechaRequerida) < fechaMinima) {
            throw new Error('La fecha de entrega debe ser al menos 15 días después de la fecha actual.');
        }

        // Crear la nueva orden de compra si la fecha es válida
        const nuevaOrden = new OrdenCompra({
            cliente: doc.cliente,
            seleccionProductos: doc._id,
            direccion: doc.direccion,
            fechaRequerida: doc.fechaRequerida
        });

        await nuevaOrden.save();
        next();
    } catch (error) {
        console.error('Error al crear la orden de compra:', error);
        next(error);  // Esto permitirá que Mongoose maneje el error y no continuará guardando la orden
    }
});

module.exports = model("seleccionProductos", seleccionProductosSchema);
