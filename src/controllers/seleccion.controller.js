const SeleccionProductos = require('../models/seleccionProductos');
const Producto = require('../models/producto');
const Cliente = require('../models/cliente');

async function crearSeleccionProductos(req, res) {
    try {
        const { productos, clienteId, direccion, ciudad, pais, fechaRequerida } = req.body;

        if (!productos || !clienteId || !fechaRequerida || !direccion || !ciudad || !pais) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: `Cliente con id ${clienteId} no encontrado` });
        }

        const fechaActual = new Date();
        const diasAntelacion = 15;
        const fechaMinima = new Date(fechaActual.setDate(fechaActual.getDate() + diasAntelacion));

        if (new Date(fechaRequerida) < fechaMinima) {
            return res.status(400).json({ message: 'La fecha de entrega debe ser al menos 15 días de antelación.' });
        }

        let precioTotal = 0;
        const productosValidos = [];

        for (const item of productos) {
            const producto = await Producto.findById(item.producto);
            if (!producto) {
                return res.status(404).json({ message: `Producto con id ${item.producto} no encontrado` });
            }

            const precioUnitario = producto.precio;

            const subtotal = precioUnitario * item.cantidad;
            precioTotal += subtotal;

            productosValidos.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precioUnitario: precioUnitario
            });
        }

        const nuevaSeleccion = new SeleccionProductos({
            productos: productosValidos,
            cliente: clienteId,
            precio: precioTotal,
            direccion,
            ciudad,
            pais,
            fechaRequerida
        });

        await nuevaSeleccion.save();

        return res.status(200).json(nuevaSeleccion);
    } catch (error) {
        console.error('Error al crear la selección de productos:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    crearSeleccionProductos
};
