const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const revisionControlCalidadSchema = new Schema({
    produccion_id: {
        type: Schema.Types.ObjectId,
        ref: 'ProduccionDiaria',  // Relación con el modelo de producción
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
        type: String,  // Nombre del inspector que realizó la revisión
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('RevisionControlCalidad', revisionControlCalidadSchema);
