const mongoose = require('mongoose');

// Esquema para los detalles de los subcontratos
const detalleSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },
    precio: {
        type: Number,
        required: true,
        min: 0, // Asegura que el precio no sea negativo
    },
    estado: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo'], // Solo permite estos valores
        default: 'Activo',
    },
}, {
    timestamps: false,
    versionKey: false,
    _id: false,
});

// Esquema principal para Subcontrato
const subcontratoSchema = new mongoose.Schema({
    empresa: {
        type: String,
        required: true,
        trim: true,
    },
    contacto: {
        type: String,
        required: true,
        trim: true,
    },
    telefono: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    fechaInicio: {
        type: Date,
        required: true,
    },
    fechaFinalizacion: {
        type: Date,
        required: true,
    },
    detalles: [detalleSchema], // Relación con los detalles
    precioTotal: {
        type: Number,
        default: 0, // Calculado automáticamente
    },
    precioTotalConIVA: {
        type: Number,
        default: 0, // Calculado automáticamente
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Middleware para calcular precios antes de guardar
subcontratoSchema.pre('save', function (next) {
    const subcontrato = this;

    // Calcula el precio total
    const total = subcontrato.detalles.reduce((sum, detalle) => sum + detalle.precio, 0);
    subcontrato.precioTotal = total;

    // Calcula el precio total con IVA (19%)
    subcontrato.precioTotalConIVA = total * 1.19;

    next();
});

module.exports = mongoose.model('Subcontrato', subcontratoSchema);
