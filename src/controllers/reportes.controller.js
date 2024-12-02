const ProduccionDiaria = require('../models/produccionDiaria');
const MateriaPrima = require('../models/materiaPrima');
const TurnoEmpleado = require('../models/turnoEmpleado');

const getReporteProduccion = async (req, res) => {
    try {
        const producciones = await ProduccionDiaria.find().populate('tipo_producto_id');
        res.status(200).json(producciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el reporte de producción.', error: error.message });
    }
};

const getReporteMateriasPrimas = async (req, res) => {
    try {
        const materiasPrimas = await MateriaPrima.find();
        res.status(200).json(materiasPrimas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el reporte de materias primas.', error: error.message });
    }
};

const getReporteTurnosEmpleados = async (req, res) => {
    try {
        const turnos = await TurnoEmpleado.find().populate({
            path: 'empleado_id',
            select: 'nombre username email departamento role',
            populate: { path: 'role', select: 'nombre' }
        });
        res.status(200).json(turnos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el reporte de turnos de empleados.', error: error.message });
    }
};

module.exports = {
    getReporteProduccion,
    getReporteMateriasPrimas,
    getReporteTurnosEmpleados
};