const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const ingredienteAlmacenSchema = new Schema({
    ingrediente: {
        type: Schema.Types.ObjectId,
        ref: 'Ingrediente',
        required: true
    },
    almacen: {
        type: Schema.Types.ObjectId,
        ref: 'Almacen',
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    }
});

module.exports = model("IngredienteAlmacen", ingredienteAlmacenSchema);