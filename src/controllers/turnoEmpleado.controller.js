const TurnoEmpleado = require('../models/turnoEmpleado');
const Empleado = require('../models/empleado');

const getAllTurnosEmpleados = async (req, res) => {
    try {
        const turnos = await TurnoEmpleado.find()
            .populate({
                path: 'empleado_id',
                select: 'nombre username email departamento sucursal',
                populate: { path: 'role', select: 'nombre' }
            });
        res.status(200).json(turnos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los turnos de empleados.', error: error.message });
    }
};

const asignarTurnoEmpleado = async (req, res) => {
    const { empleado_id, fecha, hora_inicio, hora_fin } = req.body;

    if (!empleado_id || !fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    try {
        const empleado = await Empleado.findById(empleado_id);
        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado.' });
        }

        const turnoEmpleado = new TurnoEmpleado({
            empleado_id,
            fecha,
            hora_inicio,
            hora_fin
        });

        await turnoEmpleado.save();
        res.status(200).json({ message: 'Turno asignado exitosamente.', turnoEmpleado });
    } catch (error) {
        res.status(500).json({ message: 'Error al asignar el turno.', error: error.message });
    }
};

const updateTurnoEmpleado = async (req, res) => {
    const { id } = req.params;
    const { empleado_id, fecha, hora_inicio, hora_fin } = req.body;

    try {
        const turnoEmpleado = await TurnoEmpleado.findById(id);
        if (!turnoEmpleado) {
            return res.status(404).json({ message: `Turno con id ${id} no encontrado.` });
        }

        if (empleado_id) {
            const empleado = await Empleado.findById(empleado_id);
            if (!empleado) {
                return res.status(404).json({ message: 'Empleado no encontrado.' });
            }
            turnoEmpleado.empleado_id = empleado_id;
        }
        if (fecha) turnoEmpleado.fecha = fecha;
        if (hora_inicio) turnoEmpleado.hora_inicio = hora_inicio;
        if (hora_fin) turnoEmpleado.hora_fin = hora_fin;

        await turnoEmpleado.save();
        res.status(200).json({ message: 'Turno actualizado exitosamente.', turnoEmpleado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el turno.', error: error.message });
    }
};

const deleteTurnoEmpleado = async (req, res) => {
    const { id } = req.params;

    try {
        const turnoEmpleado = await TurnoEmpleado.findByIdAndDelete(id);
        if (!turnoEmpleado) {
            return res.status(404).json({ message: `Turno con id ${id} no encontrado.` });
        }

        res.status(200).json({ message: 'Turno eliminado exitosamente.', turnoEmpleado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el turno.', error: error.message });
    }
};

module.exports = {
    getAllTurnosEmpleados,
    asignarTurnoEmpleado,
    updateTurnoEmpleado,
    deleteTurnoEmpleado
};
