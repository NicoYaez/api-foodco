const Subcontrato = require('../models/subContrato');

const crearSubcontrato = async (req, res) => {
    try {
        const { empresa, contacto, telefono, email, fechaInicio, fechaFinalizacion, detalles } = req.body;

        if (!empresa || !contacto || !telefono || !email || !fechaInicio || !fechaFinalizacion || !detalles) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const nuevoSubcontrato = new Subcontrato({
            empresa,
            contacto,
            telefono,
            email,
            fechaInicio,
            fechaFinalizacion,
            detalles,
        });

        await nuevoSubcontrato.save();

        res.status(201).json({
            message: 'Subcontrato creado con éxito',
            nuevoSubcontrato
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el subcontrato', error: error.message });
    }
};

const obtenerSubcontratos = async (req, res) => {
    try {
        const subcontratos = await Subcontrato.find();

        res.status(200).json({
            subcontratos
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los subcontratos', error: error.message });
    }
};

const obtenerSubcontratoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const subcontrato = await Subcontrato.findById(id);

        if (!subcontrato) {
            return res.status(404).json({ message: 'Subcontrato no encontrado' });
        }

        res.status(200).json({
            subcontrato
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el subcontrato', error: error.message });
    }
};

const actualizarSubcontrato = async (req, res) => {
    const { id } = req.params;
    const { empresa, contacto, telefono, email, fechaInicio, fechaFinalizacion, detalles } = req.body;

    try {
        const subcontrato = await Subcontrato.findById(id);
        if (!subcontrato) {
            return res.status(404).json({ message: `Subcontrato con id ${id} no encontrado` });
        }

        if (empresa) subcontrato.empresa = empresa;
        if (contacto) subcontrato.contacto = contacto;
        if (telefono) subcontrato.telefono = telefono;
        if (email) subcontrato.email = email;
        if (fechaInicio) subcontrato.fechaInicio = fechaInicio;
        if (fechaFinalizacion) subcontrato.fechaFinalizacion = fechaFinalizacion;
        if (detalles) {
            subcontrato.detalles = detalles;

            const total = subcontrato.detalles.reduce((sum, detalle) => sum + detalle.precio, 0);
            subcontrato.precioTotal = total;
            subcontrato.precioTotalConIVA = total * 1.19;
        }

        await subcontrato.save();

        return res.status(200).json({
            message: 'Subcontrato actualizado exitosamente',
            subcontrato
        });
    } catch (error) {
        console.error('Error al actualizar el subcontrato:', error.message);
        return res.status(500).json({
            message: 'Error al actualizar el subcontrato',
            error: error.message,
        });
    }
};

const eliminarSubcontrato = async (req, res) => {
    try {
        const { id } = req.params;

        const subcontratoEliminado = await Subcontrato.findByIdAndDelete(id);

        if (!subcontratoEliminado) {
            return res.status(404).json({ message: 'Subcontrato no encontrado' });
        }

        res.status(200).json({ message: 'Subcontrato eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el subcontrato', error: error.message });
    }
};


module.exports = {
    crearSubcontrato,
    obtenerSubcontratos,
    obtenerSubcontratoPorId,
    actualizarSubcontrato,
    eliminarSubcontrato,
};