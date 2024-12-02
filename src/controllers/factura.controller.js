const mongoose = require('mongoose');
const Factura = require('../models/factura');
const OrdenCompra = require('../models/ordenCompra');
const Cliente = require('../models/cliente');

async function subirFactura(req, res) {
    const { ordenCompraId } = req.body;

    if (!ordenCompraId) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Por favor, sube un archivo PDF de factura' });
    }

    try {
        const ordenCompra = await OrdenCompra.findById(ordenCompraId);

        if (!ordenCompra) {
            return res.status(404).json({ message: `La orden de compra con id ${ordenCompraId} no se encuentra` });
        }

        const nuevaFactura = new Factura({
            numero: ordenCompra.numero,
            cliente: ordenCompra.cliente,
            ordenCompra: ordenCompra._id,
        });

        nuevaFactura.setArchivos(req.file.filename);

        await nuevaFactura.save();

        return res.status(200).json({ message: 'Factura subida', factura: nuevaFactura });

    } catch (error) {
        console.error('Error al subir la factura:', error.message);
        return res.status(500).json({ message: 'Error al subir la factura', error: error.message });
    }
}

async function obtenerFacturas(req, res) {
    try {
        const facturas = await Factura.find()
            .populate({
                path: 'cliente',
                select: '-password'
            })
            .populate('ordenCompra');

        return res.status(200).json({ facturas });
    } catch (error) {
        console.error('Error al obtener las facturas:', error.message);
        return res.status(500).json({ message: 'Error al obtener las facturas', error: error.message });
    }
}

async function obtenerFacturasPorCliente(req, res) {
    const { clienteId } = req.params;

    try {
        const facturas = await Factura.find({ cliente: clienteId })
            .populate({
                path: 'cliente',
                select: '-password'
            })
            .populate('ordenCompra');

        if (facturas.length === 0) {
            return res.status(404).json({ message: `No se encontraron facturas para el cliente con ID ${clienteId}` });
        }

        return res.status(200).json({ facturas });

    } catch (error) {
        console.error('Error al obtener las facturas por cliente:', error.message);
        return res.status(500).json({ message: 'Error al obtener las facturas por cliente', error: error.message });
    }
}

async function obtenerFacturaPorId(req, res) {
    const { id } = req.params;
    try {
        const factura = await Factura.findById(id)
            .populate({
                path: 'cliente',
                select: '-password'
            })
            .populate('ordenCompra');
        if (!factura) {
            return res.status(404).json({ message: `La factura con id ${id} no se encuentra` });
        }
        return res.status(200).json({ factura });
    } catch (error) {
        console.error('Error al obtener la factura:', error.message);
        return res.status(500).json({ message: 'Error al obtener la factura', error: error.message });
    }
}

async function actualizarFactura(req, res) {
    const { id } = req.params;
    const { ordenCompraId } = req.body;

    try {
        const factura = await Factura.findById(id);
        if (!factura) {
            return res.status(404).json({ message: `La factura con id ${id} no se encuentra` });
        }

        if (ordenCompraId) {
            const ordenCompra = await OrdenCompra.findById(ordenCompraId);
            if (!ordenCompra) {
                return res.status(404).json({ message: `La orden de compra con id ${ordenCompraId} no se encuentra` });
            }
            factura.ordenCompra = ordenCompra._id;
        }

        if (req.file) {
            factura.setArchivos([req.file.filename]);
        }

        await factura.save();
        return res.status(200).json({ message: 'Factura actualizada', factura });

    } catch (error) {
        console.error('Error al actualizar la factura:', error.message);
        return res.status(500).json({ message: 'Error al actualizar la factura', error: error.message });
    }
}

async function eliminarFactura(req, res) {
    const { id } = req.params;

    try {
        const factura = await Factura.findByIdAndDelete(id);
        if (!factura) {
            return res.status(404).json({ message: `La factura con id ${id} no se encuentra` });
        }
        return res.status(200).json({ message: 'Factura eliminada' });
    } catch (error) {
        console.error('Error al eliminar la factura:', error.message);
        return res.status(500).json({ message: 'Error al eliminar la factura', error: error.message });
    }
}

async function obtenerFacturaPorOrdenCompra(req, res) {
    try {
        const { ordenCompraId } = req.params;

        const factura = await Factura.findOne({ ordenCompra: ordenCompraId })
            .populate({
                path: 'cliente',
                select: '-password'
            })
            .populate('ordenCompra');

        if (!factura) {
            return res.status(404).json({ message: 'No se encontró ninguna factura para la orden de compra especificada' });
        }

        return res.status(200).json({ factura });
    } catch (error) {
        console.error('Error al obtener la factura:', error.message);
        return res.status(500).json({ message: 'Error al obtener la factura', error: error.message });
    }
}

module.exports = {
    subirFactura,
    obtenerFacturas,
    obtenerFacturaPorId,
    actualizarFactura,
    eliminarFactura,
    obtenerFacturasPorCliente,
    obtenerFacturaPorOrdenCompra
};
