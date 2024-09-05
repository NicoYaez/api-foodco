const OrdenCompra = require('../models/ordenCompra');

async function verOrdenesCompra(req, res) {
    try {
        const ordenes = await OrdenCompra.find()
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Aquí se hace el populate de los productos dentro de seleccionProductos
                    model: 'Producto'  // Asegúrate de que 'Producto' es el nombre del modelo de productos
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',  // Aquí se hace el populate de los productos dentro de seleccionProductos
                    model: 'Producto'  // Asegúrate de que 'Producto' es el nombre del modelo de productos
                }
            });
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorCliente(req, res) {
    try {
        const { clienteId } = req.params;

        if (!clienteId) {
            return res.status(400).json({ message: 'El ID del cliente es requerido' });
        }

        const ordenes = await OrdenCompra.find({ cliente: clienteId })
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Aquí se hace el populate de los productos dentro de seleccionProductos
                    model: 'Producto'  // Asegúrate de que 'Producto' es el nombre del modelo de productos
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes para este cliente' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por cliente:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const verOrdenCompraPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar la orden de compra por su ID
        const orden = await OrdenCompra.findById(id)
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Popula los productos dentro de seleccionProductos
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',  // Popula los ingredientes dentro de los productos
                    model: 'IngredienteAlmacen'
                }
            });

        // Verificar si se encontró la orden
        if (!orden) {
            return res.status(404).json({ message: `Orden de compra con id ${id} no encontrada` });
        }

        // Responder con la orden encontrada
        return res.status(200).json(orden);
    } catch (error) {
        console.error('Error al obtener la orden de compra:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

async function actualizarEstadoOrden(req, res) {
    try {
        const { nuevoEstado, empleadoId } = req.body;
        const { ordenId } = req.params;

        console.log(ordenId);

        // Verificar si la orden existe
        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        // Registrar el cambio de estado
        const cambioEstado = {
            estadoAnterior: orden.estado,
            estadoNuevo: nuevoEstado,
            empleado: empleadoId,
            fechaCambio: new Date()
        };

        // Actualizar el estado y guardar el historial de cambios
        orden.estado = nuevoEstado;
        orden.historialCambios.push(cambioEstado);

        await orden.save();

        res.status(200).json(orden);
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

module.exports = {
    verOrdenesCompra,
    verOrdenesPorCliente,
    actualizarEstadoOrden,
    verOrdenCompraPorId
};
