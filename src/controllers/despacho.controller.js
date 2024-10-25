const OrdenCompra = require('../models/ordenCompra');
const OrdenDespacho = require('../models/ordenDespacho');

function generarNumeroOrdenDespacho() {
    let numero = '';
    while (numero.length < 20) {
        numero += Math.floor(Math.random() * 10).toString(); // Genera números entre 0 y 9
    }
    return numero;
}

const crearOrdenDespacho = async (req, res) => {
    const { ordenCompraId } = req.body;
    try {
        // Buscar la orden de compra seleccionada
        const ordenCompra = await OrdenCompra.findById(ordenCompraId);

        if (!ordenCompra) {
            return res.status(404).json({ message: 'Orden de compra no encontrada' });
        }

        // Verificar si ya existe una orden de despacho para esta orden de compra
        const ordenDespachoExistente = await OrdenDespacho.findOne({ ordenCompra: ordenCompra._id });

        if (ordenDespachoExistente) {
            return res.status(400).json({ message: 'Ya existe una orden de despacho para esta orden de compra' });
        }

        // Generar el número único de 25 dígitos para la orden de despacho
        const numeroDespacho = generarNumeroOrdenDespacho();

        // Crear una nueva orden de despacho
        const nuevaOrdenDespacho = new OrdenDespacho({
            numero: numeroDespacho, // Número único de 25 dígitos
            empleado: ordenCompra.empleado,  // ID del empleado que genera la orden de despacho
            ordenCompra: ordenCompra._id,  // Referencia a la orden de compra
            cliente: ordenCompra.cliente,  // Cliente asociado a la orden de compra
            estado: 'en_preparación',  // Estado inicial de la orden de despacho
            fechaRequerida: ordenCompra.fechaRequerida,  // Fecha de entrega requerida
        });

        // Guardar la nueva orden de despacho en la base de datos
        await nuevaOrdenDespacho.save();

        return res.status(200).json({
            message: 'Orden de despacho creada exitosamente',
            ordenDespacho: nuevaOrdenDespacho
        });

    } catch (error) {
        console.error('Error al crear la orden de despacho:', error);
        return res.status(500).json({ message: 'Error al crear la orden de despacho' });
    }
}

const verOrdenesDespacho = async (req, res) => {
    try {
        // Buscar todas las órdenes de despacho y hacer populate a la orden de compra
        const ordenesDespacho = await OrdenDespacho.find()
            .populate({
                path: 'ordenCompra',
                select: '-empleado -cliente',  // Excluye empleado y cliente dentro de ordenCompra
                populate: {
                    path: 'seleccionProductos',
                    select: 'productos direccion ciudad pais precioTotalOrden',  // Popula la selección de productos
                }
            })
            .populate({
                path: 'empleado',  // Popula el empleado que creó la orden de despacho
                select: '-password',  // Excluye solo el campo password
                populate: {
                    path: 'role',  // Popula el role del empleado
                    select: 'nombre'  // Selecciona solo el nombre del rol
                }
            })
            .populate({
                path: 'cliente',  // Popula el cliente asociado a la orden de despacho
                select: '-password',  // Excluye solo el campo password
                populate: [
                    {
                        path: 'empresa',  // Popula la empresa asociada al cliente
                    },
                    {
                        path: 'contacto',  // Popula el contacto asociado al cliente
                    }
                ]
            });
        // Si no se encuentran órdenes de despacho
        if (ordenesDespacho.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes de despacho' });
        }

        // Responder con las órdenes de despacho y la orden de compra populada
        res.status(200).json(ordenesDespacho);
    } catch (error) {
        console.error('Error al obtener las órdenes de despacho:', error);
        return res.status(500).json({ message: 'Error al obtener las órdenes de despacho' });
    }
}

const actualizarEstadoOrdenDespacho = async (req, res) => {
    const { numeroOrdenDespacho } = req.params;  // El número de la orden de despacho se pasa como parámetro en la URL
    const { nuevoEstado } = req.body;  // El nuevo estado se envía en el cuerpo de la solicitud

    try {
        // Buscar la orden de despacho por su número
        const ordenDespacho = await OrdenDespacho.findOne({ numero: numeroOrdenDespacho });

        if (!ordenDespacho) {
            return res.status(404).json({ message: 'Orden de despacho no encontrada' });
        }

        // Usar el método cambiarEstado para actualizar el estado y guardar en el historial
        await ordenDespacho.cambiarEstado(nuevoEstado);

        return res.status(200).json({
            message: 'Estado de la orden de despacho actualizado exitosamente',
            ordenDespacho
        });

    } catch (error) {
        // Verificar si el error es porque el estado es el mismo
        if (error.message === 'El estado actual ya es el mismo que el nuevo estado. No se realizó ningún cambio.') {
            return res.status(400).json({
                message: error.message  // Devuelve el mensaje de que no se hizo ningún cambio
            });
        }

        console.error('Error al actualizar el estado de la orden de despacho:', error);
        return res.status(500).json({ message: 'Error al actualizar el estado de la orden de despacho' });
    }
};

module.exports = {
    crearOrdenDespacho,
    verOrdenesDespacho,
    actualizarEstadoOrdenDespacho
};