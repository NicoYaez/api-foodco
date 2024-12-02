const RevisionControlCalidad = require('../models/revisionControlCalidad');
const ProduccionDiaria = require('../models/produccionDiaria');

const registrarRevisionControlCalidad = async (req, res) => {
    const { produccion_id, estado, observaciones, inspector } = req.body;

    if (!produccion_id || !estado || !inspector) {
        return res.status(400).json({ message: 'Producción, estado e inspector son requeridos.' });
    }

    try {
        const produccion = await ProduccionDiaria.findById(produccion_id);
        if (!produccion) {
            return res.status(404).json({ message: 'Producción no encontrada.' });
        }

        const nuevaRevision = new RevisionControlCalidad({
            produccion_id,
            estado,
            observaciones,
            inspector
        });

        await nuevaRevision.save();
        res.status(200).json({ message: 'Revisión registrada exitosamente.', nuevaRevision });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la revisión de control de calidad.', error: error.message });
    }
};

const obtenerResultadosControlCalidad = async (req, res) => {
    try {
        const resultados = await RevisionControlCalidad.find()
            .populate('produccion_id', 'tipo_producto_id cantidad_producida fecha_produccion')
            .exec();
        res.status(200).json(resultados);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los resultados de control de calidad.', error: error.message });
    }
};

const deleteControlCalidad = async (req, res) => {
    const { id } = req.params;
    try {
        const controlCalidad = await RevisionControlCalidad.findByIdAndDelete(id);
        if (!controlCalidad) {
            return res.status(404).json({ error: 'Control de calidad no encontrado.' });
        }
        res.status(200).json({ message: 'Control de calidad eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    registrarRevisionControlCalidad,
    obtenerResultadosControlCalidad,
    deleteControlCalidad
};
