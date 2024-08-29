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
        type: Schema.Types.Decimal128,
        required: true
    },
    costoProduccion: {
        type: Schema.Types.Decimal128,
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
});

module.exports = model("Producto", productoSchema);