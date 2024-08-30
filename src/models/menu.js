const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const menuSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    },
    productos: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);