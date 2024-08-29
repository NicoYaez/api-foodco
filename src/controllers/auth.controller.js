const Empleado = require("../models/empleado.js");
const Cliente = require("../models/cliente.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const { generateToken } = require("../utils/tokenManager");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generatePassword() {
  const length = 16,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const registerEmpleado = async (req, res) => {
  const { rut, nombre, departamento, rol, sucursal } = req.body; // Recibo los datos
  let { username } = req.body; // Recibo los datos
  const email = req.body.email.toLowerCase();
  const password = generatePassword();

  if (!username) {
    return res.status(400).json({ message: "Debe proporcionar un username" });
  }
  // Verificar si ya existe un usuario con el mismo nombre de correo
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "El correo ya está en uso" });
  }
  let newUser;
  if (role === 'Ejecutivo') {
    newUser = new Empleado({
      username: username,
      email: email,
      password: password,
      rut: rut,
      nombre: nombre,
      departamento: departamento,
      rol: 'Ejecutivo',
      sucursal: sucursal
    });
  } else if (role === 'Admin') {
    newUser = new Admin({
      username: username,
      name: name,
      email: email,
      password: password,
      role: 'Admin'
      
    });
  } else {
    return res.status(400).json({ message: "Rol inválido" });
  }

  newUser.password = await newUser.encryptPassword(password); //Cifrar contraseña
  const userSave = await newUser.save(); //Usuario Guardado

  const { token, expiresIn } = generateToken({ id: userSave._id, role: userSave.role, username: userSave.username }, res);

  return res.status(200).json({
    token,
    expiresIn,
    username: userSave.username,
    name: userSave.name,
    email: userSave.email,
    role: userSave.role,
    password // Devuelve la contraseña generada
  });
};

const registerCliente = async (req, res) => {
  let { username } = req.body; // Recibo los datos
  const { nombre, nombreEmpresa, ubicacion, rubro, contacto, sucursal } = req.body; // Recibo los datos
  const email = req.body.email.toLowerCase();
  const password = generatePassword();

  //En caso de no entregar el username, se toma el nombre de usuario como el nombre de correo
  if (!username) {
    username = email.split('@')[0];
  }
  // Verificar si ya existe un usuario con el mismo correo
  const existingUser = await Cliente.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "El correo ya está en uso" });
  }
  let newUser;
  newUser = new Cliente({
    username: username,
    name: nombre,
    email: email,
    password: password,
    nombreEmpresa: nombreEmpresa,
    ubicacion: ubicacion,
    rubro: rubro,
    contacto: contacto,
    sucursal: sucursal
  });

  newUser.password = await newUser.encryptPassword(password); //Cifrar contraseña
  const userSave = await newUser.save(); //Usuario Guardado

  const { token, expiresIn } = generateToken({ id: userSave._id, username: userSave.username }, res);

  return res.status(200).json({
    token,
    expiresIn,
    username: userSave.username,
    name: userSave.name,
    email: userSave.email,
    password // Devuelve la contraseña generada
  });
};

const login = async (req, res, next) => {
  try {
    const rut = req.body.rut; // Recibo el RUT
    const password = req.body.password; // Recibo la contraseña

    console.log(rut)

    const userFound = await User.findOne({rut: rut});
    if (!userFound)
      return res.status(404).json({ message: "Usuario no encontrado" });

    //Verificar Contraseñas
    const matchPassword = await User.validatePassword(
      req.body.password,
      userFound.password
    );

    if (!matchPassword)
      return res
        .status(401)
        .json({ token: null, message: "Contraseña incorrecta" });
    const expiresIn = 60 * 60 * 24;

    const token = jwt.sign({ id: userFound._id, role: userFound.role }, process.env.SECRET_API, { expiresIn });
    return res.status(200).json({ token, expiresIn });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  };
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

module.exports = { registerEmpleado, registerCliente, login, requestPasswordReset, resetPassword, changePassword };
