const Producto = require('../models/producto');

// Crear un producto
const crearProducto = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        const nuevoProducto = new Producto({ nombre });
        const productoGuardado = await nuevoProducto.save();
        return res.status(200).json(productoGuardado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear el producto' });
    }
};

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        return res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

// Obtener un producto por ID
const obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(id, { nombre }, { new: true });
        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json(productoActualizado);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

// Eliminar un producto
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoEliminado = await Producto.findByIdAndDelete(id);
        if (!productoEliminado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar el producto' });
    }
};

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto
};
