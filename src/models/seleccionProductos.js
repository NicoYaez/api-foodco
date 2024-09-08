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
            type: Number, // Precio unitario del producto
            required: false,
            default: 0
        },
        descuento: {
            type: Number, // Descuento opcional en porcentaje
            required: false,
            default: 0
        },
        precioTotal: {
            type: Number, // Precio final después del descuento
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
    precioTotalOrden: {
        type: Number, // Precio total de la orden incluyendo todos los productos
        required: false
    },
    iva: {
        type: Number,
        required: false,
        default: 0.19 // IVA del 19%
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

// Middleware para calcular el precio total de cada producto y el precio total de la orden
seleccionProductosSchema.pre('save', function (next) {
    this.productos.forEach(producto => {
        // Calcular el precio total por producto, aplicando el descuento si existe
        const descuento = producto.descuento || 0;
        const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
        producto.precioTotal = precioConDescuento * producto.cantidad;
    });

    // Calcular el total de la orden sumando los precios de todos los productos
    this.precioTotalOrden = this.productos.reduce((sum, producto) => sum + producto.precioTotal, 0);
    
    next();
});

// Middleware para validar la fecha requerida
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
            fechaRequerida: doc.fechaRequerida,
            precioTotalOrden: doc.precioTotalOrden, // Asignar el precio total de la selección de productos
            iva: doc.precioTotalOrden * 0.19, // Calcular el IVA
            precioFinalConIva: doc.precioTotalOrden + (doc.precioTotalOrden * 0.19) // Precio final incluyendo IVA
        });

        await nuevaOrden.save();
        next();
    } catch (error) {
        console.error('Error al crear la orden de compra:', error);
        next(error);  // Esto permitirá que Mongoose maneje el error y no continuará guardando la orden
    }
});

module.exports = model("seleccionProductos", seleccionProductosSchema);
