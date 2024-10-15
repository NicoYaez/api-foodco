const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const turnoEmpleadoSchema = new Schema({
    empleado_id: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',  // Relación con el modelo de empleados
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    hora_inicio: {
        type: String,  // Ejemplo: '08:00'
        required: true
    },
    hora_fin: {
        type: String,  // Ejemplo: '16:00'
        required: true
    }
}, {
    timestamps: true,  // Agrega `createdAt` y `updatedAt`
    versionKey: false  // Desactiva `__v`
});

module.exports = model('TurnoEmpleado', turnoEmpleadoSchema);
