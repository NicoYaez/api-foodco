const OrdenCompra = require('../models/ordenCompra');
const SeleccionProductos = require('../models/seleccionProductos');
const Menu = require('../models/menu');

// Controlador para crear una orden de compra
const crearOrdenCompra = async (req, res) => {
    const { cliente, empleado, productosSeleccionados } = req.body;

    try {
        // Verifica que el cliente y el empleado sean válidos
        if (!cliente || !empleado) {
            return res.status(400).json({ message: 'Cliente y empleado son requeridos' });
        }

        // Procesa cada producto seleccionado
        const seleccionProductosIds = [];
        let numeroOrden = await OrdenCompra.countDocuments() + 1; // Calcula un número de orden único

        for (const producto of productosSeleccionados) {
            const { menuId, cantidad } = producto;

            // Busca el menú y verifica si existe
            const menu = await Menu.findById(menuId);
            if (!menu) {
                return res.status(404).json({ message: `Menú con id ${menuId} no encontrado` });
            }

            // Calcula el precio total para la cantidad seleccionada
            const precioTotal = menu.precio * cantidad;

            // Crea una nueva selección de productos
            const nuevaSeleccionProducto = new SeleccionProductos({
                menu: menu._id,
                cliente,
                cantidad,
                precio: precioTotal
            });

            // Guarda la selección de productos y agrega su ID a la lista
            await nuevaSeleccionProducto.save();
            seleccionProductosIds.push(nuevaSeleccionProducto._id);
        }

        // Crea la orden de compra con todas las selecciones de productos
        const nuevaOrdenCompra = new OrdenCompra({
            numero: numeroOrden,
            cliente,
            empleado,
            seleccionProductos: seleccionProductosIds
        });

        // Guarda la orden de compra en la base de datos
        await nuevaOrdenCompra.save();

        return res.status(201).json({
            message: 'Orden de compra creada exitosamente',
            ordenCompra: nuevaOrdenCompra
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear la orden de compra',
            error: error.message
        });
    }
};

module.exports = {
    crearOrdenCompra
};