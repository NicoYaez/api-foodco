const mongoose = require('mongoose');

const productoSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: true,
});

module.exports = model("Producto", productoSchema);