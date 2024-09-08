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
const validator = require('validator'); // Necesitarás instalar validator con npm install validator

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

        // Generar token
        const { token, expiresIn } = generateToken({ id: userSave._id, type: 'Cliente' }, res);

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
            return res.status(401).json({ token: null, message: "Contraseña incorrecta" });
        }

        // Generar el token de acceso
        const expiresIn = 60 * 60 * 24; // 1 día de validez
        const tokenPayload = { id: clienteFound._id, userType: 'Cliente' };
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

module.exports = {
    register,
    login,
    verClientes,
    actualizarCliente,
    deleteCliente
};