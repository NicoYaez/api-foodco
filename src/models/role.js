const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const roleSchema = new Schema({
    nombre: {
        type: String,
        required: true
    }
},{
    timestamps: false,
    versionKey: false
});

module.exports = model("Role", roleSchema);