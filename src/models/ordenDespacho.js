const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const estadosPosibles = ['en_preparación', 'despachado', 'cancelado', 'entregado', 'completado'];

const camionSchema = new Schema({
    nombreConductor: {
        type: String,
        default: 'Sin conductor asignado'
    },
    patente: {
        type: String,
        default: 'Sin patente asignado'
    },
    tipoCamion: {
        type: String,
        default: 'Sin tipo asignado'
    }
}, {
    _id: false
});

const historialEstadoSchema = new Schema({
    estado: {
        type: String,
        enum: estadosPosibles,
        required: true
    },
    fechaCambio: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    versionKey: false,
    _id: false
});

const ordenDespachoSchema = new Schema({
    numero: {
        type: Number,
        unique: true,
        required: true
    },
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    ordenCompra: {
        type: Schema.Types.ObjectId,
        ref: 'OrdenCompra',
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    camion: {
        type: camionSchema,
        required: false
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true
    },
    fechaRequerida: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: estadosPosibles,
        default: 'en_preparación'
    },
    comentario: {
        type: String,
        trim: true
    },
    historialEstados: [historialEstadoSchema]
}, {
    timestamps: true,
    versionKey: false,
});

ordenDespachoSchema.methods.cambiarEstado = async function (nuevoEstado) {
    if (!estadosPosibles.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
    }

    this.estado = nuevoEstado;

    this.historialEstados.push({ estado: nuevoEstado });

    return this.save();
};

ordenDespachoSchema.methods.marcarCompletadaAutomaticamente = function (dias) {
    const fechaLimite = new Date(this.fecha);
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    if (new Date() > fechaLimite && this.estado !== 'completado') {
        this.estado = 'completado';
        this.historialEstados.push({ estado: 'completado' });
        return this.save();
    }
    return this;
};

ordenDespachoSchema.methods.cambiarEstado = async function (nuevoEstado) {
    if (this.estado === nuevoEstado) {
        throw new Error('El estado actual ya es el mismo que el nuevo estado. No se realizó ningún cambio.');
    }

    if (!estadosPosibles.includes(nuevoEstado)) {
        throw new Error('Estado no válido');
    }

    this.estado = nuevoEstado;

    this.historialEstados.push({ estado: nuevoEstado });

    return this.save();
};

module.exports = model("ordenDespacho", ordenDespachoSchema);
