const SeleccionProductos = require('../models/seleccionProductos');
const Producto = require('../models/producto');
const Cliente = require('../models/cliente');

async function crearSeleccionProductos(req, res) {
    try {
        const { productos, clienteId, direccion, ciudad, pais, fechaRequerida } = req.body;

        if (!productos || !clienteId || !fechaRequerida || !direccion || !ciudad || !pais) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Verificar si el cliente existe
        const cliente = await Cliente.findById(clienteId);
        if (!cliente) {
            return res.status(404).json({ message: `Cliente con id ${clienteId} no encontrado` });
        }

        // Validar la fecha requerida
        const fechaActual = new Date();
        const diasAntelacion = 15;
        const fechaMinima = new Date(fechaActual.setDate(fechaActual.getDate() + diasAntelacion));

        if (new Date(fechaRequerida) < fechaMinima) {
            return res.status(400).json({ message: 'La fecha de entrega debe ser al menos 15 días de antelación.' });
        }

        // Validar que los productos existan y calcular el precio total
        let precioTotal = 0;
        const productosValidos = [];

        for (const item of productos) {
            const producto = await Producto.findById(item.producto);
            if (!producto) {
                return res.status(404).json({ message: `Producto con id ${item.producto} no encontrado` });
            }

            // Obtener el precio unitario del producto desde la base de datos
            const precioUnitario = producto.precio;

            // Calcular el precio total de este producto considerando la cantidad
            const subtotal = precioUnitario * item.cantidad;
            precioTotal += subtotal;

            // Agregar el producto con su precio unitario a la selección
            productosValidos.push({
                producto: item.producto,
                cantidad: item.cantidad,
                precioUnitario: precioUnitario // Agregamos el precio unitario al objeto
            });
        }

        // Crear la selección de productos con los nuevos campos
        const nuevaSeleccion = new SeleccionProductos({
            productos: productosValidos,
            cliente: clienteId,
            precio: precioTotal,  // Precio total de la selección de productos
            direccion,
            ciudad,
            pais,
            fechaRequerida
        });

        // Guardar en la base de datos
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
