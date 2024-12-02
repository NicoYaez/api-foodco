const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
    pedido: {
        type: String,
        required: true
    },
    orden_compra: {
        type: Schema.Types.ObjectId,
        ref: 'OrdenCompra',
        required: true
    },
    orden_despacho: {
        type: Schema.Types.ObjectId,
        ref: 'OrdenDespacho',
        required: true
    },
    valoracion: {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    orden_produccion: {
        type: String
    },
}, {
    timestamps: true,
    versionKey: false
});

module.exports = model('Solicitud', solicitudSchema);
