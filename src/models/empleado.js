const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema, model } = mongoose;

const empleadoSchema = new Schema({
    username: {
        type: String,
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
    rut: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento',
        required: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    imagenPerfil: {
        type: String,
        required: false
    }
},{
    timestamps: true,
    versionKey: false,
});

empleadoSchema.methods.encryptPassword = async password => {
    const salt = await bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
};

empleadoSchema.methods.validatePassword = async function (password, receivedPassword) {
    return await bcrypt.compare(password, receivedPassword);
};

empleadoSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

empleadoSchema.methods.setImagenPerfil = function setImagenPerfil(filename) {
    this.imagenPerfil = `${process.env.API_URL}/public/images/profile/${filename}`;
};

module.exports = model("Empleado", empleadoSchema);
