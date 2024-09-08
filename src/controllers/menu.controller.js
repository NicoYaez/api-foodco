const Menu = require('../models/menu'); // Importa tu modelo Menu

// Controlador para crear un menú semanal con imagen
const crearMenu = async (req, res) => {
    const { nombre, productos, dieta } = req.body;

    try {
        if (!nombre || !productos || !dieta) {
            return res.status(400).json({
                message: 'Debe proporcionar todos los campos requeridos'
            });
        }

        // Crea el menú con los datos proporcionados
        const nuevoMenu = new Menu({
            nombre,
            productos,
            disponible: false, // Por defecto, el menú no estará disponible
            dieta
        });

        // Guarda el menú en la base de datos
        await nuevoMenu.save();

        // Devuelve la respuesta al cliente
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
        // Buscar todos los menús en la base de datos
        const menus = await Menu.find().populate('productos');

        // Devolver la lista de menús encontrados
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

        // Determinar la consulta basada en el valor del status
        if (status === 'true') {
            query.disponible = true;
        } else if (status === 'false') {
            query.disponible = false;
        }

        // Buscar menús en la base de datos según la consulta generada
        const menus = await Menu.find(query).populate('productos').populate({
            path: 'productos',
            populate: {
                path: 'ingredientes.ingrediente'
            }
        });

        // Devolver la lista de menús encontrados
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
        // Extraer los filtros de los parámetros de consulta
        const { categoria, dieta, tipoDeServicio } = req.query;

        // Construir un objeto de filtros dinámicamente
        let filtros = { disponible: true };

        if (dieta) {
            filtros.dieta = dieta;
        }
        if (tipoDeServicio) {
            filtros.tipoDeServicio = tipoDeServicio;
        }

        // Si la categoría está definida, usar $elemMatch para buscar dentro de productos
        if (categoria) {
            filtros.productos = { $elemMatch: { categoria: categoria } };
        }

        // Buscar los menús en la base de datos con los filtros aplicados
        const menus = await Menu.find(filtros).populate('productos');

        // Devolver la lista de menús encontrados
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
        const { id } = req.params; // Se asume que pasas el ID del menú en los parámetros de la URL
        const { disponible } = req.body; // Se asume que pasas el nuevo estado de disponibilidad en el cuerpo de la solicitud

        // Verificamos que el campo "disponible" exista en el cuerpo de la solicitud
        if (typeof disponible !== 'boolean') {
            return res.status(400).json({ message: 'El campo "disponible" debe ser un booleano' });
        }

        // Actualizamos el estado de disponibilidad del menú
        const menuActualizado = await Menu.findByIdAndUpdate(
            id,
            { disponible: disponible },
            { new: true } // Retorna el menú actualizado
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
    const { id } = req.params;  // ID del menú a actualizar
    const { nombre, productos, dieta, disponible } = req.body;

    try {
        // Verificar si el menú existe
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: `Menú con id ${id} no encontrado` });
        }

        // Actualizar solo los campos proporcionados
        if (nombre) menu.nombre = nombre;
        if (productos) menu.productos = productos;
        if (dieta) menu.dieta = dieta;
        if (typeof disponible !== 'undefined') menu.disponible = disponible;  // Se verifica el tipo para manejar valores booleanos

        // Guardar los cambios en la base de datos
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
    const { id } = req.params;  // ID del menú a eliminar

    try {
        // Verificar si el menú existe
        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ message: `Menú con id ${id} no encontrado` });
        }

        // Eliminar el menú
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
