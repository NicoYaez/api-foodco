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
        const menus = await Menu.find(query).populate('productos');

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

module.exports = {
    crearMenu,
    verMenus,
    verMenusFilter,
    verMenusStatus
};
