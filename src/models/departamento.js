const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const departamentoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("Departamento", departamentoSchema);