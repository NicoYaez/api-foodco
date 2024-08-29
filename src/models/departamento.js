const mongoose = require('mongoose');
const User = require('./empleado');

const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const departamentoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
});

module.exports = model("Departamento", departamentoSchema);