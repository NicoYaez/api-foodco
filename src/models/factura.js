const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const facturaSchema = new Schema({
    numero: {
        type: String,
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    ordenCompra: {
        type: Schema.Types.ObjectId,
        ref: 'OrdenCompra',
        required: true
    },
    archivo: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Método para establecer la URL de acceso a los archivos PDF de facturas
facturaSchema.methods.setArchivos = function setArchivos(filename) {
    this.archivo = `${process.env.API_URL}/public/uploads/facturas/${filename}`;
};

module.exports = model("Factura", facturaSchema);