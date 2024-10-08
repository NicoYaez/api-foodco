const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const crypto = require('crypto'); // Para generar un nombre aleatorio

// Directorios de almacenamiento
const publicDir = path.join(__dirname, '..', 'public/images');
const profileDir = path.join(__dirname, '..', 'public/images/profile');

// Crear los directorios si no existen
fs.ensureDirSync(publicDir);
fs.ensureDirSync(profileDir);

// Función para generar un nombre aleatorio
const generateUniqueFileName = () => {
  return crypto.randomBytes(16).toString('hex'); // Genera un nombre aleatorio de 16 bytes en formato hexadecimal
};

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir); // Carpeta donde se guardarán temporalmente las imágenes
  },
  filename: function (req, file, cb) {
    const newFileName = generateUniqueFileName(); // Generar un nombre aleatorio
    cb(null, newFileName); // Asignar el nuevo nombre sin extensión
  }
});

const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileDir); // Carpeta donde se guardarán las imágenes de perfil
  },
  filename: function (req, file, cb) {
    const newFileName = generateUniqueFileName(); // Generar un nombre aleatorio
    cb(null, newFileName); // Asignar el nuevo nombre sin extensión
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
}).array('imagenes', 5); // Manejar hasta 5 imágenes

const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limita el tamaño a 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('El archivo debe ser una imagen válida (jpeg, jpg, png).'));
  }
}).single('imagenPerfil'); // Solo una imagen de perfil

// Middleware para procesar las imágenes y convertirlas a WebP
const uploadAndConvertToWebP = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: 'Error al subir las imágenes.' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Verificar si se subieron imágenes
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Por favor, sube al menos una imagen.' });
    }

    // Procesar cada archivo y convertirlo a WebP
    const conversionPromises = req.files.map(file => {
      const filePath = path.join(publicDir, file.filename);
      const outputFilePath = path.join(publicDir, `${file.filename}.webp`); // Agregar solo .webp al nuevo nombre

      return sharp(filePath)
        .webp({ quality: 80 }) // Ajusta la calidad según tus necesidades
        .toFile(outputFilePath)
        .then(() => {
          // Eliminar la imagen original (jpeg, jpg, png)
          fs.unlinkSync(filePath);

          // Actualizar el archivo con la nueva ruta y extensión .webp
          file.path = outputFilePath;
          file.filename = path.basename(outputFilePath); // Actualizar el nombre a .webp
        });
    });

    // Esperar a que todas las conversiones se completen
    Promise.all(conversionPromises)
      .then(() => {
        next(); // Continuar con el siguiente middleware/controlador
      })
      .catch(error => {
        return res.status(500).json({ message: 'Error al procesar las imágenes.' });
      });
  });
};

const uploadAndResizeProfileImage = (req, res, next) => {
  uploadProfile(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: 'Error al subir la imagen.' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Verificar si se subió una imagen
    if (!req.file) {
      return res.status(400).json({ message: 'Por favor, sube una imagen de perfil.' });
    }

    const filePath = path.join(profileDir, req.file.filename);
    const outputFilePath = path.join(profileDir, `${req.file.filename}.webp`);

    // Redimensionar a 300x300 píxeles y convertir a WebP
    sharp(filePath)
      .resize(300, 300) // Redimensionar a 300x300 píxeles
      .webp({ quality: 80 }) // Convertir a WebP con calidad 80
      .toFile(outputFilePath)
      .then(() => {
        // Eliminar la imagen original (jpeg, jpg, png)
        fs.unlinkSync(filePath);

        // Actualizar la información del archivo con la nueva ruta y extensión .webp
        req.file.path = outputFilePath;
        req.file.filename = path.basename(outputFilePath); // Actualizar el nombre a .webp

        next(); // Continuar con el siguiente middleware/controlador
      })
      .catch(error => {
        return res.status(500).json({ message: 'Error al procesar la imagen.' });
      });
  });
};

module.exports = {
  uploadAndConvertToWebP,
  uploadAndResizeProfileImage
};
