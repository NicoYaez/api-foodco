const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');
const crypto = require('crypto');

const publicDir = path.join(__dirname, '..', 'public/images');
const profileDir = path.join(__dirname, '..', 'public/images/profile');
const pdfDir = path.join(__dirname, '..', 'public/uploads/facturas');

fs.ensureDirSync(publicDir);
fs.ensureDirSync(profileDir);
fs.ensureDirSync(pdfDir);

const generateUniqueFileName = () => {
  return crypto.randomBytes(16).toString('hex');
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, publicDir);
  },
  filename: function (req, file, cb) {
    const newFileName = generateUniqueFileName();
    cb(null, newFileName);
  }
});

const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileDir);
  },
  filename: function (req, file, cb) {
    const newFileName = generateUniqueFileName();
    cb(null, newFileName);
  }
});

const storageFacturas = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pdfDir);
  },
  filename: function (req, file, cb) {
    const newFileName = `${generateUniqueFileName()}.pdf`;
    cb(null, newFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('El archivo debe ser una imagen válida (jpeg, jpg, png).'));
  }
}).array('imagenes', 5);

const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('El archivo debe ser una imagen válida (jpeg, jpg, png).'));
  }
}).single('imagenPerfil');

const uploadPDF = multer({
  storage: storageFacturas,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype === 'application/pdf';
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('El archivo debe ser un PDF.'));
  }
}).single('file');

const uploadAndConvertToWebP = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ message: 'Error al subir las imágenes.' });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Por favor, sube al menos una imagen.' });
    }

    const conversionPromises = req.files.map(file => {
      const filePath = path.join(publicDir, file.filename);
      const outputFilePath = path.join(publicDir, `${file.filename}.webp`);

      return sharp(filePath)
        .webp({ quality: 80 })
        .toFile(outputFilePath)
        .then(() => {
          fs.unlinkSync(filePath);

          file.path = outputFilePath;
          file.filename = path.basename(outputFilePath);
        });
    });

    Promise.all(conversionPromises)
      .then(() => {
        next();
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

    if (!req.file) {
      return res.status(400).json({ message: 'Por favor, sube una imagen de perfil.' });
    }

    const filePath = path.join(profileDir, req.file.filename);
    const outputFilePath = path.join(profileDir, `${req.file.filename}.webp`);

    sharp(filePath)
      .resize(300, 300)
      .webp({ quality: 80 })
      .toFile(outputFilePath)
      .then(() => {
        fs.unlinkSync(filePath);
        req.file.path = outputFilePath;
        req.file.filename = path.basename(outputFilePath);

        next();
      })
      .catch(error => {
        return res.status(500).json({ message: 'Error al procesar la imagen.' });
      });
  });
};

module.exports = {
  uploadAndConvertToWebP,
  uploadAndResizeProfileImage,
  uploadPDF
};
