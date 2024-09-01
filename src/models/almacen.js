const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const almacenSchema = new Schema({
    codigoAlmacen: {
        type: String,
        required: true
    },
    capacidad: {
        type: Number,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    },
    ingredienteAlmacen: [{
        type: Schema.Types.ObjectId,
        ref: 'ingredienteAlmacen',
        required: false // Cambiar a true
    }]
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("Almacen", almacenSchema);