const Menu = require('../models/menu'); // Importa tu modelo Menu
const Producto = require('../models/producto'); // Importa tu modelo Producto
const Ingrediente = require('../models/ingrediente'); // Importa tu modelo Ingrediente

// Función para calcular el costo total de los ingredientes
const calcularCostoIngredientes = async (productos) => {
    let costoTotal = 0;

    // Itera sobre cada producto del menú
    for (const producto of productos) {
        // Encuentra el producto en la base de datos
        const productoDB = await Producto.findById(producto).populate('ingredienteAlmacen');

        if (productoDB) {
            // Itera sobre los ingredientes del producto
            for (const ingrediente of productoDB.ingredienteAlmacen) {
                const ingredienteDB = await Ingrediente.findById(ingrediente._id);

                if (ingredienteDB) {
                    // Calcula el costo total del ingrediente (precio * cantidad)
                    costoTotal += ingredienteDB.costo * ingredienteDB.cantidad;
                }
            }
        }
    }
    return costoTotal;
};

// actualizar el stock después de verificar que hay suficiente, agrega una función para actualizar las cantidades de los ingredientes:

// Recorre todos los productos y sus ingredientes asociados, comprobando si hay suficiente stock en el almacén. Si no hay suficiente stock, devuelve una lista de ingredientes con stock insuficiente.
// Si hay suficiente stock, resta la cantidad requerida de cada ingrediente en el almacén y guarda los cambios.
// La función se llama recursivamente para actualizar el stock después de guardar el menú.

const verificarStockIngredientes = async (productos) => {
    let ingredientesInsuficientes = [];

    // Itera sobre cada producto del menú
    for (const producto of productos) {
        const productoDB = await Producto.findById(producto).populate('ingredienteAlmacen');

        if (productoDB) {
            for (const ingrediente of productoDB.ingredienteAlmacen) {
                const ingredienteDB = await Ingrediente.findById(ingrediente._id);

                if (ingredienteDB) {
                    // Comprueba si la cantidad requerida es mayor que la cantidad disponible en el almacén
                    if (ingrediente.cantidad > ingredienteDB.cantidad) {
                        // Agrega a la lista de ingredientes insuficientes
                        ingredientesInsuficientes.push({
                            nombre: ingredienteDB.nombre,
                            cantidadDisponible: ingredienteDB.cantidad,
                            cantidadRequerida: ingrediente.cantidad
                        });
                    }
                }
            }
        }
    }
    
    // Retorna los ingredientes que no tienen stock suficiente
    return ingredientesInsuficientes;
};

const actualizarStockIngredientes = async (productos) => {
    for (const producto of productos) {
        const productoDB = await Producto.findById(producto).populate('ingredienteAlmacen');

        if (productoDB) {
            for (const ingrediente of productoDB.ingredienteAlmacen) {
                const ingredienteDB = await Ingrediente.findById(ingrediente._id);

                if (ingredienteDB) {
                    // Actualiza la cantidad en el almacén después de crear el menú
                    ingredienteDB.cantidad -= ingrediente.cantidad;
                    await ingredienteDB.save();
                    await actualizarStockIngredientes(productos); // Actualiza el stock después de guardar el menú
                }
            }
        }
    }
};

// Controlador para crear un menú semanal
const crearMenuSemanal = async (req, res) => {
    const { nombre, descripcion, precio, productos } = req.body;

    try {
        // Verifica el stock de los ingredientes
        const ingredientesInsuficientes = await verificarStockIngredientes(productos);

        if (ingredientesInsuficientes.length > 0) {
            // Si hay ingredientes insuficientes, devuelve un error
            return res.status(400).json({
                message: 'Stock insuficiente para algunos ingredientes',
                ingredientesInsuficientes
            });
        }

        // Calcula el costo total de los ingredientes
        const costoIngredientes = await calcularCostoIngredientes(productos);

        // Crea el menú con los datos proporcionados
        const nuevoMenu = new Menu({
            nombre,
            descripcion,
            precio,
            productos,
            disponible: true // Por defecto, el menú estará disponible
        });

        // Guarda el menú en la base de datos
        await nuevoMenu.save();

        // Devuelve la respuesta al cliente
        return res.status(201).json({
            message: 'Menú semanal creado exitosamente',
            menu: nuevoMenu,
            costoIngredientes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear el menú semanal',
            error: error.message
        });
    }
};




module.exports = {
    crearMenuSemanal
};
