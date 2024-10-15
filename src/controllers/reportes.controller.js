const ProduccionDiaria = require('../models/produccionDiaria');
const MateriaPrima = require('../models/materiaPrima');
const TurnoEmpleado = require('../models/turnoEmpleado');

// Reporte de producción
const getReporteProduccion = async (req, res) => {
    try {
        const producciones = await ProduccionDiaria.find().populate('tipo_producto_id');
        // Aquí puedes agregar lógica para generar resúmenes o estadísticas
        res.status(200).json(producciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el reporte de producción.', error: error.message });
    }
};

// Reporte de materias primas
const getReporteMateriasPrimas = async (req, res) => {
    try {
        const materiasPrimas = await MateriaPrima.find();
        // Agrega lógica para resumir o agregar estadísticas de inventario
        res.status(200).json(materiasPrimas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el reporte de materias primas.', error: error.message });
    }
};

// Reporte de turnos de empleados
const getReporteTurnosEmpleados = async (req, res) => {
    try {
        const turnos = await TurnoEmpleado.find().populate({
            path: 'empleado_id',
            select: 'nombre username email departamento role',
            populate: { path: 'role', select: 'nombre' }
        });
        // Aquí puedes agregar lógica para generar resúmenes de los turnos
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