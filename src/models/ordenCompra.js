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
        enum: ['pendiente', 'aprobado', 'rechazado', 'en_produccion', 'listo_para_despachar', 'despachado', 'entregado', 'completado'],
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
        required: true
    },
    iva: {
        type: Number,
        required: true
    },
    precioFinalConIva: {
        type: Number,
        required: true
    },
    numeroDeCuotas: {
        type: Number,
        required: false
    },
    cuotas: [{
        numeroCuota: {
            type: Number,
            required: false
        },
        estado: {
            type: String,
            enum: ['por_pagar', 'pagado'],
            default: 'por_pagar',
            required: false
        },
        monto: {
            type: Number,
            required: false
        }
    }],
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

ordenCompraSchema.pre('validate', async function (next) {
    const orden = this;

    if (orden.isNew) {
        try {
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

ordenCompraSchema.pre('save', async function (next) {
    const orden = this;

    const seleccionProductos = await model('seleccionProductos').findById(orden.seleccionProductos);

    orden.precioTotalOrden = seleccionProductos.productos.reduce((sum, producto) => {
        const descuento = producto.descuento || 0;
        const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
        return sum + (precioConDescuento * producto.cantidad);
    }, 0);

    orden.iva = orden.precioTotalOrden * 0.19;
    orden.precioFinalConIva = orden.precioTotalOrden + orden.iva;

    next();
});

ordenCompraSchema.pre('save', async function (next) {
    const orden = this;

    if (!orden.empleado) {
        try {
            const rolEjecutivoVentas = await model('Role').findOne({ nombre: 'Ejecutivo de Ventas' });

            if (!rolEjecutivoVentas) {
                return next(new Error('No se encontró el rol de Ejecutivo de Ventas.'));
            }

            const empleado = await model('Empleado').findOne({ role: rolEjecutivoVentas._id });

            if (!empleado) {
                return next(new Error('No hay empleados disponibles con el rol de Ejecutivo de Ventas.'));
            }

            orden.empleado = empleado._id;
            console.log(`Empleado asignado automáticamente: ${empleado.nombre}`);
        } catch (error) {
            return next(error);
        }
    }

    next();
});

ordenCompraSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    if (update.$set && update.$set['seleccionProductos']) {
        const seleccionProductosId = update.$set['seleccionProductos'];

        const seleccionProductos = await model('seleccionProductos').findById(seleccionProductosId);

        const precioTotalOrden = seleccionProductos.productos.reduce((sum, producto) => {
            const descuento = producto.descuento || 0;
            const precioConDescuento = producto.precioUnitario * (1 - (descuento / 100));
            return sum + (precioConDescuento * producto.cantidad);
        }, 0);

        const iva = precioTotalOrden * 0.19;
        const precioFinalConIva = precioTotalOrden + iva;

        this.set({ precioTotalOrden, iva, precioFinalConIva });
    }

    next();
});


module.exports = model('OrdenCompra', ordenCompraSchema);
