const mongoose = require('mongoose');
const { Schema, model } = mongoose;

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

facturaSchema.methods.setArchivos = function setArchivos(filename) {
    this.archivo = `${process.env.API_URL}/public/uploads/facturas/${filename}`;
};

module.exports = model("Factura", facturaSchema);