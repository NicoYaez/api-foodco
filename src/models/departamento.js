const mongoose = require('mongoose');
const User = require('./empleado');

// Definir el schema para el Cliente
const departamentoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: true,
});

module.exports = model("Departamento", departamentoSchema);