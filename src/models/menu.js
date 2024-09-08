const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Schema, model } = mongoose;

const menuSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaDisponible: {
        type: Date,
        required: false
    },
    fechaTermino: {
        type: Date,
        required: false
    },
    productos: [{
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    }],
    dieta: {
        type: String,
        required: true,
        enum: ['Vegetariano', 'Vegano', 'Sin Gluten', 'Omnivoro'], // Define las opciones permitidas para la dieta
        message: '{VALUE} no es una dieta válida'
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Menu', menuSchema);