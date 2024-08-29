const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
  try {
    const url = process.env.MONGODB_URI;
    await mongoose.connect(url);
    console.log('Conectado a la base de datos');
  } catch (err) {
    console.error('Error en la conexión a la base de datos:', err);
  }
})();
