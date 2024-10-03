const Empleado = require("../models/empleado.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const { generateToken } = require("../utils/tokenManager");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    // Validar que el correo y la contraseña estén presentes
    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    // Verificar si el correo tiene un formato válido
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    // Buscar al empleado por su correo
    const empleadoFound = await Empleado.findOne({ email }).populate('role', 'nombre');
    if (!empleadoFound) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    // Verificar la contraseña
    const matchPassword = await empleadoFound.validatePassword(password, empleadoFound.password);
    if (!matchPassword) {
      return res.status(401).json({ token: null, message: "Contraseña incorrecta" });
    }

    // Generar el token de acceso
    const expiresIn = 60 * 60 * 24; // 1 día de validez
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

    // Validar que todos los campos obligatorios estén presentes
    if (!username || !password || !email || !rut || !nombre || !departamento || !role) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados" });
    }

    // Verificar si el correo tiene un formato válido
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "El correo no es válido" });
    }

    // Verificar la longitud de la contraseña
    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar si el nombre de usuario contiene solo caracteres alfanuméricos
    if (!validator.isAlphanumeric(username)) {
      return res.status(400).json({ message: "El nombre de usuario debe contener solo letras y números" });
    }

    // Verificar si ya existe un empleado con el mismo email o username
    const empleadoExistente = await Empleado.findOne({
      $or: [{ email }, { username }]
    });

    if (empleadoExistente) {
      return res.status(400).json({ message: 'El nombre de usuario o el email ya están en uso' });
    }

    // Crear una nueva instancia de empleado
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

    // Encriptar la contraseña antes de guardar
    nuevoEmpleado.password = await nuevoEmpleado.encryptPassword(password);

    if (req.file) {
      nuevoEmpleado.setImagenPerfil(req.file.filename);
    };
    
    // Guardar el empleado en la base de datos
    let empleadoSave = await nuevoEmpleado.save();

    // Popular el campo role para obtener el nombre del role
    empleadoSave = await empleadoSave.populate('role', 'nombre');

    // Generar token
    const { token, expiresIn } = generateToken({ id: empleadoSave._id, type: 'Empleado', role: empleadoSave.role.nombre }, res);

    // Responder con éxito
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
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'No user found with this email.' });
  }

  // Generate reset token and set expiration
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = Date.now() + 3600000; // Token valid for 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;

  await user.save();

  // Send email to user with reset link
  await sendPasswordResetEmail(user.email, resetToken);

  res.status(200).json({ message: 'Password reset email sent.' });
};

const resetPassword = async (req, res) => {
  const { token: { token: tokenString }, password } = req.body;

  const user = await User.findOne({ passwordResetToken: tokenString, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
  }

  // Hash new password and clear reset token fields
  user.password = bcrypt.hashSync(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({ message: 'Password has been reset. You can now log in with your new password.' });
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

const verEmpleados = async (req, res) => {
  try {
    // Obtener todos los empleados con populate para los campos relacionados
    const empleados = await Empleado.find()
      .populate('role', 'nombre') // Popular el campo 'role' y solo traer el 'nombre'
      .populate('departamento', 'nombre') // Popular el campo 'departamento' y solo traer el 'nombre'
      .populate('sucursal', 'nombre'); // Popular el campo 'sucursal' y solo traer el 'nombre'

    // Verificar si hay empleados
    if (!empleados || empleados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron empleados' });
    }

    // Responder con la lista de empleados y sus campos populados
    res.status(200).json({ empleados });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const verEmpleadosFiltrados = async (req, res) => {
  try {
    const { role, departamento, sucursal } = req.query; // Obtener filtros desde query params

    // Crear un objeto de búsqueda dinámico
    let filtro = {};

    if (role) {
      filtro.role = role; // Filtrar por ObjectId del role si se proporciona
    }

    if (departamento) {
      filtro.departamento = departamento; // Filtrar por ObjectId del departamento si se proporciona
    }

    if (sucursal) {
      filtro.sucursal = sucursal; // Filtrar por ObjectId de la sucursal si se proporciona
    }

    // Buscar empleados con los filtros proporcionados
    const empleados = await Empleado.find(filtro)
      .populate('role', 'nombre') // Popular el campo 'role' y solo traer el 'nombre'
      .populate('departamento', 'nombre') // Popular el campo 'departamento' y solo traer el 'nombre'
      .populate('sucursal', 'nombre'); // Popular el campo 'sucursal' y solo traer el 'nombre'

    // Verificar si hay empleados
    if (!empleados || empleados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron empleados con los filtros proporcionados' });
    }

    // Responder con la lista de empleados y sus campos populados
    res.status(200).json({ empleados });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { register, login, verEmpleados, verEmpleadosFiltrados };