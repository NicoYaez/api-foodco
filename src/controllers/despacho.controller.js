const OrdenCompra = require('../models/ordenCompra');
const OrdenDespacho = require('../models/ordenDespacho');

function generarNumeroOrdenDespacho() {
    let numero = '';
    while (numero.length < 10) {
        numero += Math.floor(Math.random() * 10).toString();
    }
    return numero;
}

const crearOrdenDespacho = async (req, res) => {
    const { ordenCompraId, camion } = req.body;

    try {
        const ordenCompra = await OrdenCompra.findById(ordenCompraId);

        if (!ordenCompra) {
            return res.status(404).json({ message: 'Orden de compra no encontrada' });
        }

        const ordenDespachoExistente = await OrdenDespacho.findOne({ ordenCompra: ordenCompra._id });

        if (ordenDespachoExistente) {
            return res.status(400).json({ message: 'Ya existe una orden de despacho para esta orden de compra' });
        }

        const numeroDespacho = generarNumeroOrdenDespacho();

        const nuevaOrdenDespacho = new OrdenDespacho({
            numero: numeroDespacho,
            empleado: ordenCompra.empleado,
            ordenCompra: ordenCompra._id,
            cliente: ordenCompra.cliente,
            estado: 'en_preparación',
            fechaRequerida: ordenCompra.fechaRequerida,
            camion: camion || {}
        });

        await nuevaOrdenDespacho.save();

        return res.status(200).json({
            message: 'Orden de despacho creada exitosamente',
            ordenDespacho: nuevaOrdenDespacho
        });

    } catch (error) {
        console.error('Error al crear la orden de despacho:', error);
        return res.status(500).json({ message: 'Error al crear la orden de despacho' });
    }
};

const verOrdenesDespacho = async (req, res) => {
    try {
        const ordenesDespacho = await OrdenDespacho.find()
            .populate({
                path: 'ordenCompra',
                select: '-empleado -cliente',
                populate: {
                    path: 'seleccionProductos',
                    select: 'productos direccion ciudad pais precioTotalOrden',
                }
            })
            .populate({
                path: 'empleado',
                select: '-password',
                populate: {
                    path: 'role',
                    select: 'nombre'
                }
            })
            .populate({
                path: 'cliente',
                select: '-password',
                populate: [
                    {
                        path: 'empresa',
                    },
                    {
                        path: 'contacto',
                    }
                ]
            });
        if (ordenesDespacho.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes de despacho' });
        }

        return res.status(200).json(ordenesDespacho);
    } catch (error) {
        console.error('Error al obtener las órdenes de despacho:', error);
        return res.status(500).json({ message: 'Error al obtener las órdenes de despacho' });
    }
}

const actualizarEstadoOrdenDespacho = async (req, res) => {
    const ordenDespachoId = req.params.ordenDespachoId;
    const { nuevoEstado } = req.body;

    try {
        const ordenDespacho = await OrdenDespacho.findById(ordenDespachoId);

        if (!ordenDespacho) {
            return res.status(404).json({ message: 'Orden de despacho no encontrada' });
        }

        await ordenDespacho.cambiarEstado(nuevoEstado);

        return res.status(200).json({
            message: 'Estado de la orden de despacho actualizado exitosamente',
            ordenDespacho
        });

    } catch (error) {
        if (error.message === 'El estado actual ya es el mismo que el nuevo estado. No se realizó ningún cambio.') {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error('Error al actualizar el estado de la orden de despacho:', error);
        return res.status(500).json({ message: 'Error al actualizar el estado de la orden de despacho' });
    }
};

const asignarCamion = async (req, res) => {
    const ordenDespachoId = req.params.ordenDespachoId;
    const { camion } = req.body;
    try {
        const ordenDespacho = await OrdenDespacho.findById(ordenDespachoId);

        if (!ordenDespacho) {
            return res.status(404).json({ message: 'Orden de despacho no encontrada' });
        }

        ordenDespacho.camion = {
            nombreConductor: camion.nombreConductor,
            patente: camion.patente,
            tipoCamion: camion.tipoCamion
        };

        await ordenDespacho.save();

        return res.status(200).json({
            message: 'Camión asignado exitosamente a la orden de despacho',
            ordenDespacho
        });

    } catch (error) {
        console.error('Error al asignar el camión:', error);
        return res.status(500).json({ message: 'Error al asignar el camión' });
    }
};

const verOrdenDespachoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const ordenDespacho = await OrdenDespacho.findById(id)
            .populate({
                path: 'ordenCompra',
                select: '-empleado -cliente',
                populate: {
                    path: 'seleccionProductos',
                    select: 'productos direccion ciudad pais precioTotalOrden',
                }
            })
            .populate({
                path: 'empleado',
                select: '-password',
                populate: {
                    path: 'role',
                    select: 'nombre'
                }
            })
            .populate({
                path: 'cliente',
                select: '-password',
                populate: [
                    {
                        path: 'empresa',
                    },
                    {
                        path: 'contacto',
                    }
                ]
            });

        if (!ordenDespacho) {
            return res.status(404).json({ message: 'Orden de despacho no encontrada' });
        }

        res.status(200).json(ordenDespacho);
    } catch (error) {
        console.error('Error al obtener la orden de despacho por ID:', error);
        return res.status(500).json({ message: 'Error al obtener la orden de despacho' });
    }
};

const actualizarOrdenDespacho = async (req, res) => {
    const { id } = req.params;
    const { estado, comentario, fechaRequerida, camion } = req.body;

    try {
        const ordenDespacho = await OrdenDespacho.findById(id);
        if (!ordenDespacho) {
            return res.status(404).json({ message: `Orden de despacho con id ${id} no encontrada` });
        }

        if (estado) ordenDespacho.estado = estado;
        if (comentario) ordenDespacho.comentario = comentario;
        if (fechaRequerida) ordenDespacho.fechaRequerida = fechaRequerida;

        if (camion) {
            if (camion.nombreConductor) ordenDespacho.camion.nombreConductor = camion.nombreConductor;
            if (camion.patente) ordenDespacho.camion.patente = camion.patente;
            if (camion.tipoCamion) ordenDespacho.camion.tipoCamion = camion.tipoCamion;
        }

        await ordenDespacho.save();
        return res.status(200).json({ message: 'Orden de despacho actualizada exitosamente', ordenDespacho });
    } catch (error) {
        console.error('Error al actualizar la orden de despacho:', error.message);
        return res.status(500).json({ message: 'Error al actualizar la orden de despacho', error: error.message });
    }
};

module.exports = {
    crearOrdenDespacho,
    verOrdenesDespacho,
    actualizarEstadoOrdenDespacho,
    asignarCamion,
    verOrdenDespachoPorId,
    actualizarOrdenDespacho
};