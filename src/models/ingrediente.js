const mongoose = require('mongoose');

const ingredienteSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: true,
});

module.exports = model("Ingrediente", ingredienteSchema);