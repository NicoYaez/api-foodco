const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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
        ref: 'IngredienteAlmacen',
        required: false
    }]
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("Almacen", almacenSchema);