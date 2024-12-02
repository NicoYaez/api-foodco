const Empleado = require("../models/empleado.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const { generateToken } = require("../utils/tokenManager");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');
const Role = require('../models/role');
const Departamento = require('../models/departamento');
const Sucursal = require('../models/sucursal');

const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    const empleadoFound = await Empleado.findOne({ email }).populate('role', 'nombre');
    if (!empleadoFound) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    const matchPassword = await empleadoFound.validatePassword(password, empleadoFound.password);
    if (!matchPassword) {
      return res.status(401).json({ token: null, message: "Contraseña incorrecta" });
    }

    const expiresIn = 60 * 60 * 24;
    const tokenPayload = { id: empleadoFound._id, type: 'Empleado', role: empleadoFound.role.nombre };
    const token = jwt.sign(tokenPayload, process.env.SECRET_API, { expiresIn });

    return res.status(200).json({ token, expiresIn });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, rut, nombre, departamento, role, sucursal, imagenPerfil } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    console.log('Datos recibidos:', req.body);

    if (!username || !password || !email || !rut || !nombre || !departamento || !role) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    if (!validator.isAlphanumeric(username)) {
      return res.status(400).json({ message: "El nombre de usuario debe contener solo letras y números" });
    }

    const empleadoExistente = await Empleado.findOne({
      $or: [{ email }, { username }]
    });

    if (empleadoExistente) {
      return res.status(400).json({ message: 'El nombre de usuario o el email ya están en uso' });
    }

    const nuevoEmpleado = new Empleado({
      username,
      email,
      password,
      rut,
      nombre,
      departamento,
      role,
      sucursal
    });

    nuevoEmpleado.password = await nuevoEmpleado.encryptPassword(password);

    if (req.file) {
      nuevoEmpleado.setImagenPerfil(req.file.filename);
    };

    let empleadoSave = await nuevoEmpleado.save();

    empleadoSave = await empleadoSave.populate('role', 'nombre');

    const { token, expiresIn } = generateToken({ id: empleadoSave._id, type: 'Empleado', role: empleadoSave.role.nombre }, res);

    res.status(200).json({
      message: 'Empleado registrado exitosamente',
      token,
      expiresIn,
      empleado: {
        username: empleadoSave.username,
        email: empleadoSave.email,
        password: password,
        rut: empleadoSave.rut,
        nombre: empleadoSave.nombre
      }
    });
  } catch (error) {
    console.error('Error al registrar el empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const requestPasswordReset = async (req, res) => {
  const email = req.body.email.toLowerCase();

  const empleadoFound = await Empleado.findOne({ email });

  if (!email) {
    return res.status(400).json({ message: 'Debe proporcionar un correo electrónico.' });
  }

  if (!empleadoFound) {
    return res.status(404).json({ message: 'No se ha encontrado ningún usuario con este correo electrónico.' });
  }

  const resetCode = generateResetCode();
  const resetExpires = Date.now() + 3600000;

  empleadoFound.passwordResetCode = resetCode;
  empleadoFound.passwordResetExpires = resetExpires;

  await empleadoFound.save();

  await sendPasswordResetEmail(empleadoFound.email, resetCode);

  res.status(200).json({ message: 'Código de restablecimiento de contraseña enviado.' });
};

const resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  const empleadoFound = await Empleado.findOne({ email });

  if (!email) {
    return res.status(400).json({ message: 'Debe proporcionar el correo electrónico' });
  }

  if (!resetCode) {
    return res.status(400).json({ message: 'Debe proporcionar el código de restablecimiento' });
  }

  if (!newPassword) {
    return res.status(400).json({ message: 'Debe proporcionar la nueva contraseña' });
  }

  if (!empleadoFound) {
    return res.status(404).json({ message: 'No se ha encontrado ningún usuario con este correo electrónico.' });
  }

  if (empleadoFound.passwordResetCode !== resetCode || empleadoFound.passwordResetExpires < Date.now()) {
    return res.status(400).json({ message: 'Código de restablecimiento inválido o expirado.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  const isSamePassword = await bcrypt.compare(newPassword, empleadoFound.password);
  if (isSamePassword) {
    return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la contraseña actual.' });
  }

  empleadoFound.password = await bcrypt.hash(newPassword, 10);
  empleadoFound.passwordResetCode = undefined;
  empleadoFound.passwordResetExpires = undefined;

  await empleadoFound.save();

  await sendPasswordChangeConfirmationEmail(empleadoFound.email);

  res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
};

const verEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find()
      .populate('role', 'nombre')
      .populate('departamento', 'nombre')
      .populate('sucursal', 'nombre');

    if (!empleados || empleados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron empleados' });
    }

    res.status(200).json({ empleados });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const verEmpleadosFiltrados = async (req, res) => {
  try {
    const { role, departamento, sucursal } = req.query;

    let filtro = {};

    if (role) {
      const roleDoc = await Role.findOne({ nombre: role });
      if (!roleDoc) {
        return res.status(404).json({ message: `No se encontró el rol con nombre: ${role}` });
      }
      filtro.role = roleDoc._id;
    }

    if (departamento) {
      const departamentoDoc = await Departamento.findOne({ nombre: departamento });
      if (!departamentoDoc) {
        return res.status(404).json({ message: `No se encontró el departamento con nombre: ${departamento}` });
      }
      filtro.departamento = departamentoDoc._id;
    }

    if (sucursal) {
      const sucursalDoc = await Sucursal.findOne({ nombre: sucursal });
      if (!sucursalDoc) {
        return res.status(404).json({ message: `No se encontró la sucursal con nombre: ${sucursal}` });
      }
      filtro.sucursal = sucursalDoc._id;
    }

    const empleados = await Empleado.find(filtro)
      .populate('role', 'nombre')
      .populate('departamento', 'nombre')
      .populate('sucursal', 'nombre');

    if (!empleados || empleados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron empleados con los filtros proporcionados' });
    }

    res.status(200).json({ empleados });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword, id } = req.body;

  const userId = id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Debe proporcionar la contraseña actual, la nueva contraseña y la confirmación de la nueva contraseña" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "La nueva contraseña y la confirmación de la nueva contraseña deben coincidir" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  const validPassword = await user.comparePassword(currentPassword);

  if (!validPassword) {
    return res.status(400).json({ message: "La contraseña actual es incorrecta" });
  }

  const samePassword = await user.comparePassword(newPassword);

  if (samePassword) {
    return res.status(400).json({ message: "La nueva contraseña no puede ser la misma que la actual" });
  }

  user.password = await user.encryptPassword(newPassword);
  await user.save();

  return res.status(200).json({ message: "Contraseña actualizada con éxito" });
};

const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await Empleado.findById(id)
      .populate('departamento', 'nombre')
      .populate('role', 'nombre')
      .populate('sucursal', 'nombre');

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener el empleado:', error);
    res.status(500).json({ message: 'Error al obtener el empleado' });
  }
};

module.exports = {
  register,
  login,
  verEmpleados,
  verEmpleadosFiltrados,
  requestPasswordReset,
  resetPassword,
  getEmpleadoById
};