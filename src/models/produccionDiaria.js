const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const produccionDiariaSchema = new Schema({
    tipo_producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoProducto',
        required: true
    },
    cantidad_producida: {
        type: Number,
        required: true,
        min: 0  // La cantidad producida no puede ser negativa
    },
    fecha_produccion: {
        type: Date,
        required: true,
    },
    materiasPrimasUtilizadas: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MateriaPrima',
                required: true
            },
            nombre: {
                type: String,
                required: true
            },
            cantidadUsada: {
                type: Number,
                required: true,
                min: 0
            },
            unidad: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true,  // Agrega `createdAt` y `updatedAt`
    versionKey: false  // Desactiva `__v`
});

module.exports = model('ProduccionDiaria', produccionDiariaSchema);
