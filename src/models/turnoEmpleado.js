const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const turnoEmpleadoSchema = new Schema({
    empleado_id: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora_inicio: {
        type: String,
        required: true
    },
    hora_fin: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('TurnoEmpleado', turnoEmpleadoSchema);
