const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const roleSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
});

module.exports = model("Role", roleSchema);