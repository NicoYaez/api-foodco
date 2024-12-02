const mongoose = require('mongoose');

const detalleSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },
    precio: {
        type: Number,
        required: true,
        min: 0,
    },
    estado: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo',
    },
}, {
    timestamps: false,
    versionKey: false,
    _id: false,
});

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
    detalles: [detalleSchema],
    precioTotal: {
        type: Number,
        default: 0,
    },
    precioTotalConIVA: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});

subcontratoSchema.pre('save', function (next) {
    const subcontrato = this;

    const total = subcontrato.detalles.reduce((sum, detalle) => sum + detalle.precio, 0);
    subcontrato.precioTotal = total;

    subcontrato.precioTotalConIVA = total * 1.19;

    next();
});

module.exports = mongoose.model('Subcontrato', subcontratoSchema);
