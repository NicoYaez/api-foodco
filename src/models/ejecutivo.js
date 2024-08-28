const mongoose = require('mongoose');
const User = require('./user');

// Definir el schema para el Ejecutivo
const ejecutivoSchema = new Schema({
});

// Definir discriminador para Ejecutivo_Ventas
const Ejecutivo = User.discriminator('Ejecutivo', ejecutivoSchema);

module.exports = Ejecutivo;