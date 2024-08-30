const Role = require('../models/role'); // Asegúrate de ajustar la ruta según tu estructura de carpetas

// Crear un nuevo rol
const createRole = async (req, res) => {
    try {
        const { nombre } = req.body;
        const newRole = new Role({ nombre });
        await newRole.save();
        return res.status(200).json(newRole);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener todos los roles
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        return res.status(200).json(roles);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Obtener un rol por ID
const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).json({ message: "Rol no encontrado" });
        return res.status(200).json(role);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Actualizar un rol
const updateRole = async (req, res) => {
    try {
        const { nombre } = req.body;
        const role = await Role.findByIdAndUpdate(req.params.id, { nombre }, { new: true });
        if (!role) return res.status(404).json({ message: "Rol no encontrado" });
        return res.status(200).json(role);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar un rol
const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).json({ message: "Rol no encontrado" });
        return res.status(200).json({ message: "Rol eliminado exitosamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole
};
