const Cliente = require('../models/cliente');
const Empresa = require('../models/empresa');
const Contacto = require('../models/contacto');
const Sucursal = require('../models/sucursal');

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const { generateToken } = require("../utils/tokenManager");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const { sendPasswordResetEmail, sendRegister, sendPasswordChangeConfirmationEmail } = require('../services/email.service');

const register = async (req, res) => {
    const { username, password, empresa, contacto, sucursal } = req.body;
    const email = req.body.email ? req.body.email.toLowerCase() : '';

    try {
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "El correo no es válido" });
        }

        const existingUser = await Cliente.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está en uso" });
        }

        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        if (!validator.isAlphanumeric(username)) {
            return res.status(400).json({ message: "El nombre de usuario debe contener solo letras y números" });
        }

        let savedEmpresa;
        if (empresa) {
            if (!empresa.rut_empresa || !empresa.nombre_empresa) {
                return res.status(400).json({ message: "Los campos de RUT y nombre de la empresa son obligatorios" });
            }

            if (empresa.correo_contacto && !validator.isEmail(empresa.correo_contacto)) {
                return res.status(400).json({ message: "El correo de contacto de la empresa no es válido" });
            }

            const newEmpresa = new Empresa({
                rut_empresa: empresa.rut_empresa,
                giro: empresa.giro,
                direccion: empresa.direccion,
                comuna: empresa.comuna,
                ciudad: empresa.ciudad,
                correo_contacto: empresa.correo_contacto,
                telefono_empresa: empresa.telefono_empresa,
                nombre_empresa: empresa.nombre_empresa,
                rubro: empresa.rubro
            });
            savedEmpresa = await newEmpresa.save();
        }

        let newClient = new Cliente({
            username: username,
            email: email,
            password: password,
            empresa: savedEmpresa ? savedEmpresa._id : null,
            sucursal: sucursal
        });

        newClient.password = await newClient.encryptPassword(password);

        if (contacto) {
            if (!validator.isEmail(contacto.email)) {
                return res.status(400).json({ message: "El correo del contacto no es válido" });
            }

            const newContact = new Contacto({
                nombre: contacto.nombre,
                apellido: contacto.apellido,
                telefono: contacto.telefono,
                email: contacto.email
            });
            const savedContact = await newContact.save();
            newClient.contacto = savedContact._id;
        }

        const userSave = await newClient.save();
        await sendRegister(username, email, password);

        const { token, expiresIn } = generateToken({ id: userSave._id, type: 'Cliente', role: 'Cliente' }, res);

        return res.status(200).json({
            token,
            expiresIn,
            username: userSave.username,
            email: userSave.email,
            password: userSave.password,
            empresa: savedEmpresa ? savedEmpresa : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al registrar el cliente', error: error.message });
    }
};

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

        const clienteFound = await Cliente.findOne({ email });
        if (!clienteFound) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const matchPassword = await clienteFound.validatePassword(password, clienteFound.password);
        if (!matchPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        const expiresIn = 60 * 60 * 24;
        const tokenPayload = { id: clienteFound._id, type: 'Cliente', role: 'Cliente' };
        const token = jwt.sign(tokenPayload, process.env.SECRET_API, { expiresIn });

        return res.status(200).json({ token, expiresIn });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

const verClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find()
            .populate('contacto')
            .populate('empresa')
            .populate('sucursal');

        if (clientes.length === 0) {
            return res.status(404).json({ message: "No hay clientes registrados" });
        }

        return res.status(200).json(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const verClientePorId = async (req, res) => {
    try {
        const clienteId = req.params.id;

        const cliente = await Cliente.findById(clienteId)
            .populate('contacto')
            .populate({
                path: 'empresa',
                populate: {
                    path: 'rubro',
                    select: 'nombre'
                }
            })
            .populate('sucursal');

        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Error al obtener el cliente por ID:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const actualizarCliente = async (req, res) => {
    const { id } = req.params;
    const { username, password, empresa, contacto, sucursal, email } = req.body;

    try {
        const cliente = await Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({ message: `Cliente con id ${id} no encontrado` });
        }

        if (email && email.toLowerCase() !== cliente.email) {
            const existingUser = await Cliente.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: "El correo ya está en uso" });
            }
            cliente.email = email.toLowerCase();
        }

        if (username) cliente.username = username;
        if (password) cliente.password = await cliente.encryptPassword(password);
        if (sucursal) cliente.sucursal = sucursal;
        if (empresa) {
            const empresaExistente = await Empresa.findById(cliente.empresa);
            if (empresaExistente) {
                empresaExistente.rut_empresa = empresa.rut_empresa || empresaExistente.rut_empresa;
                empresaExistente.giro = empresa.giro || empresaExistente.giro;
                empresaExistente.direccion = empresa.direccion || empresaExistente.direccion;
                empresaExistente.comuna = empresa.comuna || empresaExistente.comuna;
                empresaExistente.ciudad = empresa.ciudad || empresaExistente.ciudad;
                empresaExistente.correo_contacto = empresa.correo_contacto || empresaExistente.correo_contacto;
                empresaExistente.telefono_empresa = empresa.telefono_empresa || empresaExistente.telefono_empresa;
                empresaExistente.nombre_empresa = empresa.nombre_empresa || empresaExistente.nombre_empresa;
                empresaExistente.rubro = empresa.rubro || empresaExistente.rubro;
                await empresaExistente.save();
            } else {
                const nuevaEmpresa = new Empresa({
                    rut_empresa: empresa.rut_empresa,
                    giro: empresa.giro,
                    direccion: empresa.direccion,
                    comuna: empresa.comuna,
                    ciudad: empresa.ciudad,
                    correo_contacto: empresa.correo_contacto,
                    telefono_empresa: empresa.telefono_empresa,
                    nombre_empresa: empresa.nombre_empresa,
                    rubro: empresa.rubro
                });
                const savedEmpresa = await nuevaEmpresa.save();
                cliente.empresa = savedEmpresa._id;
            }
        }

        if (contacto) {
            const contactoExistente = await Contacto.findById(cliente.contacto);
            if (contactoExistente) {
                contactoExistente.nombre = contacto.nombre || contactoExistente.nombre;
                contactoExistente.apellido = contacto.apellido || contactoExistente.apellido;
                contactoExistente.telefono = contacto.telefono || contactoExistente.telefono;
                contactoExistente.email = contacto.email || contactoExistente.email;
                await contactoExistente.save();
            } else {
                const nuevoContacto = new Contacto({
                    nombre: contacto.nombre,
                    apellido: contacto.apellido,
                    telefono: contacto.telefono,
                    email: contacto.email
                });
                const savedContacto = await nuevoContacto.save();
                cliente.contacto = savedContacto._id;
            }
        }

        await cliente.save();

        return res.status(200).json({
            message: 'Cliente actualizado exitosamente',
            cliente
        });
    } catch (error) {
        console.error('Error al actualizar el cliente:', error.message);
        return res.status(500).json({ message: 'Error al actualizar el cliente', error: error.message });
    }
};

const deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const cliente = await Cliente.findById(id);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        if (cliente.contacto) {
            await Contacto.findByIdAndDelete(cliente.contacto);
        }

        if (cliente.empresa) {
            await Empresa.findByIdAndDelete(cliente.empresa);
        }

        await Cliente.findByIdAndDelete(id);

        res.status(200).json({ message: 'Cliente, empresa y contacto eliminados exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        res.status(500).json({ message: 'Error al eliminar el cliente', error: error.message });
    }
};

const generateResetCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};

const requestPasswordReset = async (req, res) => {
    const email = req.body.email.toLowerCase();

    const clienteFound = await Cliente.findOne({ email });

    if (!email) {
        return res.status(400).json({ message: 'Debe proporcionar un correo electrónico.' });
    }

    if (!clienteFound) {
        return res.status(404).json({ message: 'No se ha encontrado ningún usuario con este correo electrónico.' });
    }

    const resetCode = generateResetCode();
    const resetExpires = Date.now() + 3600000;

    clienteFound.passwordResetCode = resetCode;
    clienteFound.passwordResetExpires = resetExpires;

    await clienteFound.save();

    await sendPasswordResetEmail(clienteFound.email, resetCode);

    res.status(200).json({ message: 'Código de restablecimiento de contraseña enviado.' });
};

const resetPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;
    const clienteFound = await Cliente.findOne({ email });

    if (!email) {
        return res.status(400).json({ message: 'Debe proporcionar el correo electrónico' });
    }

    if (!resetCode) {
        return res.status(400).json({ message: 'Debe proporcionar el código de restablecimiento' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'Debe proporcionar la nueva contraseña' });
    }

    if (!clienteFound) {
        return res.status(404).json({ message: 'No se ha encontrado ningún usuario con este correo electrónico.' });
    }

    if (clienteFound.passwordResetCode !== resetCode || clienteFound.passwordResetExpires < Date.now()) {
        return res.status(400).json({ message: 'Código de restablecimiento inválido o expirado.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, clienteFound.password);
    if (isSamePassword) {
        return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la contraseña actual.' });
    }

    clienteFound.password = await bcrypt.hash(newPassword, 10);
    clienteFound.passwordResetCode = undefined;
    clienteFound.passwordResetExpires = undefined;

    await clienteFound.save();

    await sendPasswordChangeConfirmationEmail(clienteFound.email);

    res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ auth: false, message: 'Token no proporcionado' });
    }
    const extractedToken = token.split(' ')[1];

    if (!extractedToken) {
        return res.status(401).json({ auth: false, message: 'Token no proporcionado' });
    }

    if (!process.env.SECRET_API) {
        return res.status(500).json({ message: "La clave secreta del API no está definida" });
    }

    let decoded;
    try {
        decoded = jwt.verify(extractedToken, process.env.SECRET_API);
    } catch (err) {
        return res.status(401).json({ auth: false, message: 'Token no es válido' });
    }

    const clienteId = decoded.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Debe proporcionar la contraseña actual, la nueva contraseña y la confirmación de la nueva contraseña" });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "La nueva contraseña y la confirmación de la nueva contraseña deben coincidir" });
    }

    const cliente = await Cliente.findById(clienteId);

    if (!cliente) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await cliente.comparePassword(currentPassword);

    if (!validPassword) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    const samePassword = await cliente.comparePassword(newPassword);

    if (samePassword) {
        return res.status(400).json({ message: "La nueva contraseña no puede ser la misma que la actual" });
    }

    cliente.password = await cliente.encryptPassword(newPassword);
    await cliente.save();

    return res.status(200).json({ message: "Contraseña actualizada con éxito" });
};

const verificarCliente = async (req, res) => {
    try {
        const { id, password } = req.body;

        if (!id || !password) {
            return res.status(400).json({ auth: false, message: "ID y contraseña son obligatorios" });
        }

        const clienteFound = await Cliente.findOne({ _id: id });
        if (!clienteFound) {
            return res.status(404).json({ auth: false, message: "Cliente no encontrado" });
        }

        const matchPassword = await clienteFound.validatePassword(password, clienteFound.password);
        if (!matchPassword) {
            return res.status(401).json({ auth: false, message: "Contraseña incorrecta" });
        }

        return res.status(200).json({ auth: true, message: "Verificacion Correcta" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    register,
    login,
    verClientes,
    actualizarCliente,
    deleteCliente,
    requestPasswordReset,
    verClientePorId,
    resetPassword,
    verificarCliente,
    changePassword
};