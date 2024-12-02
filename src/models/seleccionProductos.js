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
        },
        precioUnitario: {
            type: Number,
            required: false,
            default: 0
        },
        descuento: {
            type: Number,
            required: false,
            default: 0
        },
        precioTotal: {
            type: Number,
            required: false
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
    ciudad: {
        type: String,
        required: true
    },
    pais: {
        type: String,
        required: true
    },
    precioTotalOrden: {
        type: Number,
        required: false
    },
    iva: {
        type: Number,
        required: false,
        default: 0.19
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

seleccionProductosSchema.pre('save', function (next) {
    this.productos.forEach(producto => {
        const descuento = producto.descuento || 0;
        const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
        producto.precioTotal = precioConDescuento * producto.cantidad;
    });

    this.precioTotalOrden = this.productos.reduce((sum, producto) => sum + producto.precioTotal, 0);
    
    next();
});

seleccionProductosSchema.post('save', async function (doc, next) {
    try {
        const fechaActual = new Date();
        const diasAntelacion = 15;
        const fechaMinima = new Date(fechaActual.setDate(fechaActual.getDate() + diasAntelacion));

        if (new Date(doc.fechaRequerida) < fechaMinima) {
            throw new Error('La fecha de entrega debe ser al menos 15 días después de la fecha actual.');
        }

        const nuevaOrden = new OrdenCompra({
            cliente: doc.cliente,
            seleccionProductos: doc._id,
            direccion: doc.direccion,
            fechaRequerida: doc.fechaRequerida,
            precioTotalOrden: doc.precioTotalOrden,
            iva: doc.precioTotalOrden * 0.19,
            precioFinalConIva: doc.precioTotalOrden + (doc.precioTotalOrden * 0.19)
        });

        await nuevaOrden.save();
        next();
    } catch (error) {
        console.error('Error al crear la orden de compra:', error);
        next(error);
    }
});

module.exports = model("seleccionProductos", seleccionProductosSchema);
