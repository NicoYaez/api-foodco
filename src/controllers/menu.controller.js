const Menu = require('../models/menu')

const crearMenu = async (req, res) => {
    const { nombre, productos, dieta } = req.body;

    try {
        if (!nombre || !productos || !dieta) {
            return res.status(400).json({
                message: 'Debe proporcionar todos los campos requeridos'
            });
        }

        const nuevoMenu = new Menu({
            nombre,
            productos,
            disponible: false,
            dieta
        });

        await nuevoMenu.save();

        return res.status(200).json({
            message: 'Menú creado exitosamente',
            menu: nuevoMenu
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear el menú',
            error: error.message
        });
    }
};

const verMenus = async (req, res) => {
    try {
        const menus = await Menu.find().populate('productos');

        return res.status(200).json({
            menus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al buscar los menús',
            error: error.message
        });
    }
};

const verMenusStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!status) {
            return res.status(400).json({
                message: 'Debe proporcionar un estado'
            });
        }

        let query = {};

        if (status === 'true') {
            query.disponible = true;
        } else if (status === 'false') {
            query.disponible = false;
        }

        const menus = await Menu.find(query).populate('productos').populate({
            path: 'productos',
            populate: {
                path: 'ingredientes.ingrediente'
            }
        });

        return res.status(200).json({
            menus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al buscar los menús',
            error: error.message
        });
    }
};

const verMenusFilter = async (req, res) => {
    try {
        const { categoria, dieta, tipoDeServicio } = req.query;

        let filtros = { disponible: true };

        if (dieta) {
            filtros.dieta = dieta;
        }
        if (tipoDeServicio) {
            filtros.tipoDeServicio = tipoDeServicio;
        }

        if (categoria) {
            filtros.productos = { $elemMatch: { categoria: categoria } };
        }

        const menus = await Menu.find(filtros).populate('productos');

        return res.status(200).json({
            menus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al buscar los menús',
            error: error.message
        });
    }
};

const cambiarDisponibilidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { disponible } = req.body;

        if (typeof disponible !== 'boolean') {
            return res.status(400).json({ message: 'El campo "disponible" debe ser un booleano' });
        }

        const menuActualizado = await Menu.findByIdAndUpdate(
            id,
            { disponible: disponible },
            { new: true }
        );

        if (!menuActualizado) {
            return res.status(404).json({ message: 'Menú no encontrado' });
        }

        return res.status(200).json({
            message: 'Disponibilidad del menú actualizada exitosamente',
            menu: menuActualizado
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar la disponibilidad del menú' });
    }
};

const actualizarMenu = async (req, res) => {
    const { id } = req.params;
    const { nombre, productos, dieta, disponible } = req.body;

    try {
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: `Menú con id ${id} no encontrado` });
        }

        if (nombre) menu.nombre = nombre;
        if (productos) menu.productos = productos;
        if (dieta) menu.dieta = dieta;
        if (typeof disponible !== 'undefined') menu.disponible = disponible;

        await menu.save();

        return res.status(200).json({
            message: 'Menú actualizado exitosamente',
            menu
        });
    } catch (error) {
        console.error('Error al actualizar el menú:', error.message);
        return res.status(500).json({
            message: 'Error al actualizar el menú',
            error: error.message
        });
    }
};

const eliminarMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: `Menú con id ${id} no encontrado` });
        }

        await menu.remove();

        return res.status(200).json({
            message: 'Menú eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar el menú:', error.message);
        return res.status(500).json({
            message: 'Error al eliminar el menú',
            error: error.message
        });
    }
};

module.exports = {
    crearMenu,
    verMenus,
    verMenusFilter,
    verMenusStatus,
    cambiarDisponibilidad,
    actualizarMenu,
    eliminarMenu
};
