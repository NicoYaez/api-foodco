const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Schema, model } = mongoose;

const CATEGORIAS_PERMITIDAS = ['Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Colacion']; // Define las categorías permitidas
const TIPOS_DE_SERVICIO = ['Cafeteria', 'Eventos', 'Snacks'];

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
        type: Number
    },
    disponible: {
        type: Boolean,
        default: true
    },
    fechaInicio: {
        type: Date,
        default: Date.now
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
    },
    categoria: {
        type: String,
        required: true,
        enum: CATEGORIAS_PERMITIDAS, // Define las opciones permitidas para la categoría
        message: '{VALUE} no es una categoría válida' // Mensaje de error personalizado
    },
    tipoDeServicio: {
        type: String,
        enum: TIPOS_DE_SERVICIO,
        required: true
    },
    imagenes: [{
        type: String, // Almacena múltiples rutas de imágenes
        required: false
    }]
}, { timestamps: true });

menuSchema.methods.setImagenes = function setImagenes(filenames) {
    this.imagenes = filenames.map(filename => `${process.env.HOST}:${process.env.PORT}/public/images/${filename}`); // Guarda las rutas de las imágenes
};

module.exports = mongoose.model('Menu', menuSchema);