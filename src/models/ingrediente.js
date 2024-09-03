const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ingredienteSchema = new Schema({
    codigoIngrediente: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    almacen: {
        type: Schema.Types.ObjectId,
        ref: 'Almacen',
        required: true
    },
    medida: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model("Ingrediente", ingredienteSchema);