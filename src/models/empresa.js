const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const empresaSchema = new Schema({
    rut_empresa: {
        type: String,
        required: false
    },
    giro: {
        type: String,
        required: false
    },
    direccion: {
        type: String,
        required: false
    },
    comuna: {
        type: String,
        required: false
    },
    ciudad: {
        type: String,
        required: false
    },
    correo_contacto: {
        type: String,
        required: false
    },
    telefono_empresa: {
        type: String,
        required: false
    },
    nombre_empresa: {
        type: String,
        required: false
    },
    rubro: {
        type: Schema.Types.ObjectId,
        ref: 'Rubro',
        required: false
    }
},{
    timestamps: false,
    versionKey: false,
});

module.exports = model("Empresa", empresaSchema);