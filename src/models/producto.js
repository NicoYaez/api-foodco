const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const CATEGORIAS_PERMITIDAS = ['Desayuno', 'Almuerzo', 'Cena', 'Postre', 'Colacion'];
const TIPOS_DE_SERVICIO = ['Cafeteria', 'Eventos', 'Snacks'];

const ingredienteSchema = new Schema({
    ingrediente: {
        type: Schema.Types.ObjectId,
        ref: 'MateriaPrima',
        required: true
    },
    cantidadRequerida: {
        type: Number,
        required: true
    }
}, { _id: false });  // Esto desactiva la creación automática del campo _id

const productoSchema = new Schema({
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
        required: false,
        default: 0
    },
    costoProduccion: {
        type: Number,
        required: true
    },
    ingredientes: [ingredienteSchema],  // Usamos el subesquema de ingredientes
    categoria: {
        type: String,
        required: true,
        enum: CATEGORIAS_PERMITIDAS
    },
    tipoDeServicio: {
        type: String,
        enum: TIPOS_DE_SERVICIO,
        required: true
    },
    imagenes: [{
        type: String,
        required: false
    }]
}, {
    timestamps: true,
    versionKey: false
});

productoSchema.methods.setImagenes = function setImagenes(filenames) {
    this.imagenes = filenames.map(filename => `${process.env.API_URL}/public/images/${filename}`);
};

module.exports = model("Producto", productoSchema);
