const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Definir el schema para el Cliente
const clienteSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
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
    nombre: {
        type: String,
        required: true
    },
    nombreEmpresa: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    rubro: {
        type: Schema.Types.ObjectId,
        ref: 'Rubro',
        required: true
    },
    contacto: {
        type: Schema.Types.ObjectId,
        ref: 'Contacto',
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    }
});

clienteSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
};

clienteSchema.statics.validatePassword = async function (password, receivedPassword) {
    return await bcrypt.compare(password, receivedPassword);
};

clienteSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = model("Cliente", clienteSchema);