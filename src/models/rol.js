const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const rolSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
});

module.exports = model("Rol", rolSchema);