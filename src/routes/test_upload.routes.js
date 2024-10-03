const express = require('express');
const router = express.Router();

const uploadController = require('../middlewares/upload'); // Importa el middleware de multer

// Ruta para probar la subida de imágenes
router.post('/upload', uploadController.uploadAndConvertToWebP, (req, res) => {
  // Devolver la información de las imágenes subidas
  const imagesInfo = req.files.map(file => ({
    url: `${process.env.API_URL}/public/images/${file.filename}`,
  }));

  res.json({
    message: 'Imágenes subidas y convertidas a WebP con éxito',
    files: imagesInfo
  });
});

// Ruta para probar la subida de una imagen de perfil
router.post('/upload/profile', uploadController.uploadAndResizeProfileImage, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No se ha subido ninguna imagen.'
    });
  }

  // Devolver la información de la imagen subida
  const imageInfo = {
    url: `${process.env.API_URL}/public/images/profile/${req.file.filename}`,
  };

  res.json({
    message: 'Imagen de perfil subida y convertida a WebP con éxito',
    file: imageInfo
  });
});

module.exports = router;