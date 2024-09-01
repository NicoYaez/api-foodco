const Menu = require('../models/menu'); // Importa tu modelo Menu

// Controlador para crear un menú semanal con imagen
const crearMenu = async (req, res) => {
    const { nombre, descripcion, precio, productos, dieta, categoria, tipoDeServicio } = req.body;
    const imagenes = req.files ? req.files.map(file => file.filename) : []; // Verifica si se subieron imágenes

    try {
        if (!nombre || !descripcion || !productos || !dieta || !categoria || !tipoDeServicio) {
            return res.status(400).json({
                message: 'Debe proporcionar todos los campos requeridos'
            });
        }

        // Crea el menú con los datos proporcionados
        const nuevoMenu = new Menu({
            nombre,
            descripcion,
            precio,
            productos,
            disponible: true, // Por defecto, el menú estará disponible
            dieta,
            categoria,
            tipoDeServicio
        });

        nuevoMenu.setImagenes(imagenes);

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
        const menus = await Menu.find();

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


// Controlador para ver menús filtrados por dieta (etiquetas) y categoría
const verMenusFilter = async (req, res) => {
    const { categoria, dieta } = req.query; // Obtener los parámetros de filtro de la solicitud

    // Verificar que ambos parámetros estén presentes
    if (!categoria || !dieta) {
        return res.status(400).json({
            message: 'Debe proporcionar tanto la categoría como la dieta para realizar la búsqueda'
        });
    }

    try {
        // Buscar menús en la base de datos que coincidan con los filtros
        const menus = await Menu.find({ categoria, dieta });

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
    verMenusFilter
};
