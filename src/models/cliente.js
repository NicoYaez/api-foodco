const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const bcrypt = require('bcryptjs');

const clienteSchema = new Schema({
    username: {
        type: String,
        required: false
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
        required: false
    },
    contacto: {
        type: Schema.Types.ObjectId,
        ref: 'Contacto',
        required: false
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: false
    },
    passwordResetCode: String,
    passwordResetExpires: Date
}, {
    timestamps: true,
    versionKey: false,
});

clienteSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
};

clienteSchema.methods.validatePassword = async function (password, receivedPassword) {
    return await bcrypt.compare(password, receivedPassword);
};

clienteSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = model("Cliente", clienteSchema);