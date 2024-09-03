const SeleccionProductos = require('../models/seleccionProductos');
const Producto = require('../models/producto'); // Supongo que tienes un modelo Producto definido

exports.agregarAlCarrito = async (req, res) => {
    try {
        const { clienteId, productos } = req.body;

        // Validación básica
        if (!clienteId || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: 'Datos inválidos' });
        }

        // Crear el objeto para almacenar en la colección seleccionProductos
        const seleccionProductos = new SeleccionProductos({
            cliente: clienteId,
            productos: productos.map(p => ({
                producto: p.productoId,
                cantidad: p.cantidad
            }))
        });

        // Guardar la selección en la base de datos
        await seleccionProductos.save();

        return res.status(201).json({
            message: 'Menús agregados al carrito exitosamente',
            data: seleccionProductos
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al agregar menús al carrito' });
    }
};
