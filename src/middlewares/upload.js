const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Ruta al directorio 'public'
const publicDir = path.join(__dirname, '..', 'public/images');

// Asegúrate de que el directorio 'public' exista
fs.ensureDirSync(publicDir);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para cada imagen
  }
});

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 }, // Limita el tamaño a 100MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('El archivo debe ser una imagen válida (jpeg, jpg, png).'));
  }
});

module.exports = upload;
