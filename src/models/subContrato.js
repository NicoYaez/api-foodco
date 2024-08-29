const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const subContratoSchema = new Schema({
});

module.exports = model("subContrato", subContratoSchema);