const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    costoProduccion: {
        type: Number,
        required: true
    },
    almacen: {
        type: Schema.Types.ObjectId,
        ref: 'Almacen',
        required: true
    },
    ingredienteAlmacen: {
        type: Schema.Types.ObjectId,
        ref: 'ingredienteAlmacen',
        required: true
    }
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("Producto", productoSchema);