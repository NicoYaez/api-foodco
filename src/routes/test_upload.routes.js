const express = require('express');
const router = express.Router();

const uploadAndConvertToWebP = require('../middlewares/upload'); // Importa el middleware de multer

// Ruta para probar la subida de imágenes
router.post('/upload', uploadAndConvertToWebP, (req, res) => {
  // Devolver la información de las imágenes subidas
  const imagesInfo = req.files.map(file => ({
    url: `${process.env.API_URL}/public/images/${file.filename}`,
  }));

  res.json({
    message: 'Imágenes subidas y convertidas a WebP con éxito',
    files: imagesInfo
  });
});

module.exports = router;