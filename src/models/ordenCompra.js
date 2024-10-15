const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordenCompraSchema = new Schema({
    numero: {
        type: Number,
        unique: true,
        required: true,
        default: 1
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
        enum: ['pendiente', 'aprobado', 'rechazado', 'en_produccion', 'despachado', 'entregado', 'completado'],
        default: 'pendiente',
        required: true
    },
    seleccionProductos: {
        type: Schema.Types.ObjectId,
        ref: 'seleccionProductos',
        required: true
    },
    precioTotalOrden: {
        type: Number,
        required: true // Precio total de la orden (sin IVA)
    },
    iva: {
        type: Number,
        required: true // IVA calculado sobre el total de la orden
    },
    precioFinalConIva: {
        type: Number,
        required: true // Precio total incluyendo IVA
    },
    fechaCreacion: {
        type: Date,
        default: Date.now,
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

// Middleware para generar el número de orden único antes de validar
ordenCompraSchema.pre('validate', async function (next) {
    const orden = this;

    if (orden.isNew) {
        try {
            // Generar el número de orden único
            const lastOrder = await model('OrdenCompra').findOne().sort({ numero: -1 });
            orden.numero = lastOrder ? lastOrder.numero + 1 : 1;

            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Middleware para calcular el precio total e IVA antes de guardar
ordenCompraSchema.pre('save', async function (next) {
    const orden = this;

    // Buscar la selección de productos asociada
    const seleccionProductos = await model('seleccionProductos').findById(orden.seleccionProductos);

    // Calcular el precio total de la orden sumando el precio de cada producto
    orden.precioTotalOrden = seleccionProductos.productos.reduce((sum, producto) => {
        const descuento = producto.descuento || 0;
        const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
        return sum + (precioConDescuento * producto.cantidad);
    }, 0);

    // Calcular el IVA y el precio final
    orden.iva = orden.precioTotalOrden * 0.19;
    orden.precioFinalConIva = orden.precioTotalOrden + orden.iva;

    next();
});

ordenCompraSchema.pre('save', async function (next) {
    const orden = this;

    // Asignar automáticamente un empleado con el rol "Ejecutivo de Ventas" si no está asignado
    if (!orden.empleado) {
        try {
            // Buscar el rol de "Ejecutivo de Ventas" en la colección Role
            const rolEjecutivoVentas = await model('Role').findOne({ nombre: 'Ejecutivo de Ventas' });

            if (!rolEjecutivoVentas) {
                return next(new Error('No se encontró el rol de Ejecutivo de Ventas.'));
            }

            // Buscar un empleado que tenga asignado ese rol
            const empleado = await model('Empleado').findOne({ role: rolEjecutivoVentas._id });

            if (!empleado) {
                return next(new Error('No hay empleados disponibles con el rol de Ejecutivo de Ventas.'));
            }

            // Asignar el empleado encontrado a la orden
            orden.empleado = empleado._id;
            console.log(`Empleado asignado automáticamente: ${empleado.nombre}`);
        } catch (error) {
            return next(error);
        }
    }

    next();
});

// Middleware para recalcular el precio al actualizar la orden
ordenCompraSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.$set && update.$set['seleccionProductos']) {
        const seleccionProductosId = update.$set['seleccionProductos'];

        // Buscar la selección de productos asociada
        const seleccionProductos = await model('seleccionProductos').findById(seleccionProductosId);

        // Calcular el precio total de la orden sumando el precio de cada producto
        const precioTotalOrden = seleccionProductos.productos.reduce((sum, producto) => {
            const descuento = producto.descuento || 0;
            const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
            return sum + (precioConDescuento * producto.cantidad);
        }, 0);

        // Calcular el IVA y el precio final
        const iva = precioTotalOrden * 0.19;
        const precioFinalConIva = precioTotalOrden + iva;

        // Actualizar los campos de precio total, IVA y precio final
        this.set({ precioTotalOrden, iva, precioFinalConIva });
    }

    next();
});


module.exports = model('OrdenCompra', ordenCompraSchema);
