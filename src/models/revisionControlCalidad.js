const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const revisionControlCalidadSchema = new Schema({
    produccion_id: {
        type: Schema.Types.ObjectId,
        ref: 'ProduccionDiaria',
        required: true
    },
    estado: {
        type: String,
        enum: ['Aprobado', 'Rechazado'],
        required: true
    },
    observaciones: {
        type: String,
        required: false
    },
    fecha_revision: {
        type: Date,
        default: Date.now
    },
    inspector: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('RevisionControlCalidad', revisionControlCalidadSchema);
