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

const register = async (req, res) => {
    const { username, password, empresa, contacto, sucursal } = req.body;
    const email = req.body.email.toLowerCase();

    try {
        // Verificar si ya existe un cliente con el mismo correo
        const existingUser = await Cliente.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está en uso" });
        }

        // Crear nueva empresa si se proporciona
        let savedEmpresa;
        if (empresa) {
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

        // Generar token
        const { token, expiresIn } = generateToken({ id: userSave._id, type: 'cliente' }, res);

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
        const { email, password } = req.body; // Recibimos el RUT y la contraseña

        const clienteFound = await Cliente.findOne({ email });
        if (!clienteFound) return res.status(404).json({ message: "Cliente no encontrado" });

        // Verificar la contraseña
        const matchPassword = await clienteFound.validatePassword(password, clienteFound.password);
        if (!matchPassword) return res.status(401).json({ token: null, message: "Contraseña incorrecta" });

        // Generar el token de acceso
        const expiresIn = 60 * 60 * 24;
        const tokenPayload = { id: clienteFound._id, userType: 'Cliente' };
        const token = jwt.sign(tokenPayload, process.env.SECRET_API, { expiresIn });

        // Redirigir al dashboard de clientes
        const redirectUrl = '/cliente/dashboard';

        return res.status(200).json({ token, expiresIn, redirectUrl });
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

module.exports = {
    register,
    login,
    verClientes
};