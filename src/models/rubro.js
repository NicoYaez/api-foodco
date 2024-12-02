const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const rubroSchema = new Schema({
    nombre: {
        type: String,
        required: true
    },
    clasificacion: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: false
});

module.exports = model("Rubro", rubroSchema);