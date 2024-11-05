// controllers/registerController.js
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
        // Validaciones de campos
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Todos los campos obligatorios deben ser completados" });
        }

        // Verificar formato de correo válido
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "El correo no es válido" });
        }

        // Verificar si ya existe un cliente con el mismo correo
        const existingUser = await Cliente.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está en uso" });
        }

        // Validar la longitud de la contraseña
        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        // Validar otros campos, como el formato del nombre de usuario
        if (!validator.isAlphanumeric(username)) {
            return res.status(400).json({ message: "El nombre de usuario debe contener solo letras y números" });
        }

        // Validar los datos de la empresa si se proporcionan
        let savedEmpresa;
        if (empresa) {
            if (!empresa.rut_empresa || !empresa.nombre_empresa) {
                return res.status(400).json({ message: "Los campos de RUT y nombre de la empresa son obligatorios" });
            }

            // Validar el formato del correo de contacto de la empresa
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

        // Crear nuevo cliente
        let newClient = new Cliente({
            username: username,
            email: email,
            password: password,
            empresa: savedEmpresa ? savedEmpresa._id : null,  // Asigna el ID de la empresa guardada
            sucursal: sucursal
        });

        // Encriptar la contraseña
        newClient.password = await newClient.encryptPassword(password);

        // Guardar contacto si se proporciona
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

        // Guardar cliente
        const userSave = await newClient.save();
        await sendRegister(username, email, password); // Enviar correo electrónico

        // Generar token
        const { token, expiresIn } = generateToken({ id: userSave._id, type: 'Cliente', role: 'Cliente' }, res);

        // Responder con los datos del cliente
        return res.status(200).json({
            token,
            expiresIn,
            username: userSave.username,
            email: userSave.email,
            password: userSave.password,  // Devuelve la contraseña en respuesta solo en registro
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

        // Validar que el correo y la contraseña estén presentes
        if (!email || !password) {
            return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
        }

        // Verificar si el correo tiene un formato válido
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "El correo no es válido" });
        }

        // Buscar al cliente por su correo
        const clienteFound = await Cliente.findOne({ email });
        if (!clienteFound) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        // Verificar la contraseña
        const matchPassword = await clienteFound.validatePassword(password, clienteFound.password);
        if (!matchPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar el token de acceso
        const expiresIn = 60 * 60 * 24; // 1 día de validez
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
        // Obtener todos los clientes de la base de datos
        const clientes = await Cliente.find().populate('contacto').populate('empresa').populate('sucursal');

        // Si no hay clientes registrados
        if (clientes.length === 0) {
            return res.status(404).json({ message: "No hay clientes registrados" });
        }

        // Retornar la lista de clientes
        return res.status(200).json(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const verClientePorId = async (req, res) => {
    try {
        // Obtener el id del cliente desde los parámetros de la URL
        const clienteId = req.params.id;

        // Buscar el cliente en la base de datos por su id y realizar los populates necesarios
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

        // Si el cliente no existe
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        // Retornar el cliente encontrado
        return res.status(200).json(cliente);
    } catch (error) {
        console.error('Error al obtener el cliente por ID:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const actualizarCliente = async (req, res) => {
    const { id } = req.params;  // ID del cliente a actualizar
    const { username, password, empresa, contacto, sucursal, email } = req.body;

    try {
        // Verificar si el cliente existe
        const cliente = await Cliente.findById(id);
        if (!cliente) {
            return res.status(404).json({ message: `Cliente con id ${id} no encontrado` });
        }

        // Actualizar el correo solo si es diferente
        if (email && email.toLowerCase() !== cliente.email) {
            const existingUser = await Cliente.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: "El correo ya está en uso" });
            }
            cliente.email = email.toLowerCase();
        }

        // Actualizar los campos proporcionados
        if (username) cliente.username = username;
        if (password) cliente.password = await cliente.encryptPassword(password);  // Encriptar la nueva contraseña si se proporciona
        if (sucursal) cliente.sucursal = sucursal;

        // Actualizar la empresa si se proporciona
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

        // Actualizar el contacto si se proporciona
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

        // Guardar los cambios del cliente
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

        // Buscar el cliente por su ID
        const cliente = await Cliente.findById(id);

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Eliminar contacto si existe
        if (cliente.contacto) {
            await Contacto.findByIdAndDelete(cliente.contacto);
        }

        // Eliminar empresa si existe
        if (cliente.empresa) {
            await Empresa.findByIdAndDelete(cliente.empresa);
        }

        // Eliminar el cliente
        await Cliente.findByIdAndDelete(id);

        // Responder con éxito
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

    // Generate 6-character alphanumeric reset code and set expiration
    const resetCode = generateResetCode();
    const resetExpires = Date.now() + 3600000; // Code valid for 1 hour

    clienteFound.passwordResetCode = resetCode;
    clienteFound.passwordResetExpires = resetExpires;

    await clienteFound.save();

    // Send email to user with the reset code
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

    // Verificar que el código de restablecimiento coincide y no ha expirado
    if (clienteFound.passwordResetCode !== resetCode || clienteFound.passwordResetExpires < Date.now()) {
        return res.status(400).json({ message: 'Código de restablecimiento inválido o expirado.' });
    }

    // Verificar que la nueva contraseña tenga al menos 6 caracteres
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    // Verificar que la nueva contraseña no sea igual a la actual
    const isSamePassword = await bcrypt.compare(newPassword, clienteFound.password);
    if (isSamePassword) {
        return res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la contraseña actual.' });
    }

    // Actualizar la contraseña con la nueva
    clienteFound.password = await bcrypt.hash(newPassword, 10);
    clienteFound.passwordResetCode = undefined;
    clienteFound.passwordResetExpires = undefined;

    await clienteFound.save();

    // Enviar correo de confirmación de cambio de contraseña
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

    const userId = decoded.id;

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

    //console.log(currentPassword)
    //console.log(user.password);

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
    verificarCliente
};