const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const rubroSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: true,
});

module.exports = model("Rubro", rubroSchema);