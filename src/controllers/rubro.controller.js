const Rubro = require('../models/rubro');

// Crear un nuevo rubro (Create)
exports.crearRubro = async (req, res) => {
    try {
        const { clasificacion, nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio' });
        }
        if (!clasificacion) {
            return res.status(400).json({ error: 'La clasificación es obligatoria' });
        }

        const nuevoRubro = new Rubro({
            nombre,
            clasificacion
        });

        await nuevoRubro.save();

        res.status(200).json(nuevoRubro);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el rubro' });
    }
};

// Leer todos los rubros (Read)
exports.obtenerRubros = async (req, res) => {
    try {
        const rubros = await Rubro.find();
        res.status(200).json(rubros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los rubros' });
    }
};

// Leer un rubro por ID (Read)
exports.obtenerRubroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const rubro = await Rubro.findById(id);

        if (!rubro) {
            return res.status(404).json({ error: 'Rubro no encontrado' });
        }

        res.status(200).json(rubro);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el rubro' });
    }
};

// Actualizar un rubro por ID (Update)
exports.actualizarRubro = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        const rubroActualizado = await Rubro.findByIdAndUpdate(id, { nombre }, { new: true });

        if (!rubroActualizado) {
            return res.status(404).json({ error: 'Rubro no encontrado' });
        }

        res.status(200).json(rubroActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el rubro' });
    }
};

// Eliminar un rubro por ID (Delete)
exports.eliminarRubro = async (req, res) => {
    try {
        const { id } = req.params;

        const rubroEliminado = await Rubro.findByIdAndDelete(id);

        if (!rubroEliminado) {
            return res.status(404).json({ error: 'Rubro no encontrado' });
        }

        res.status(200).json({ message: 'Rubro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el rubro' });
    }
};