const mongoose = require('mongoose');
const User = require('./user');

// Definir el schema para el Ejecutivo_Ventas
const ejecutivoVentasSchema = new Schema({
});

// Definir discriminador para Ejecutivo_Ventas
const Ejecutivo_Ventas = User.discriminator('Ejecutivo_Ventas', ejecutivoVentasSchema);

module.exports = Ejecutivo_Ventas;