const mongoose = require('mongoose');
const Producto = require('../models/producto');
const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');
const MateriaPrima = require('../models/materiaPrima');

async function crearProducto(req, res) {
    const { nombre, descripcion, ingredientes, categoria, tipoDeServicio, precio, imagenes = [] } = req.body;

    if (!Array.isArray(ingredientes)) {
        return res.status(400).json({ message: 'El campo ingredientes debe ser un arreglo' });
    }

    if (!nombre || !descripcion || !categoria || !tipoDeServicio || !precio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        let costoProduccionTotal = 0;

        for (const ingredienteInfo of ingredientes) {
            const { ingrediente, cantidadRequerida } = ingredienteInfo;

            const ingredienteData = await MateriaPrima.findById(ingrediente);

            if (!ingredienteData) {
                return res.status(404).json({ message: `El ingrediente con id ${ingrediente} no se encuentra` });
            }

            const costoPorIngrediente = ingredienteData.precio * cantidadRequerida;
            costoProduccionTotal += costoPorIngrediente;
        }

        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            costoProduccion: costoProduccionTotal,
            precio,
            ingredientes: ingredientes.map(i => ({
                ingrediente: i.ingrediente,
                cantidadRequerida: i.cantidadRequerida
            })),
            categoria,
            tipoDeServicio,
            imagenes
        });

        if (imagenes.length > 0) {
            nuevoProducto.setImagenes(imagenes);
        }

        await nuevoProducto.save();
        return res.status(200).json({ message: 'Producto creado exitosamente', producto: nuevoProducto });

    } catch (error) {
        console.error('Error al crear el producto:', error.message);
        return res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
}

const mostrarProductos = async (req, res) => {
    try {
        const productos = await Producto.find().populate('ingredientes.ingrediente');

        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }

        return res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

const mostrarProductosNombres = async (req, res) => {
    try {
        const productos = await Producto.find({}, 'nombre _id').sort({ nombre: 1 });

        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }

        return res.status(200).json({ productos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

const verProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        return res.status(200).json({ producto });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        return res.status(500).json({
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, ingredientes, categoria, tipoDeServicio, precio, imagenes } = req.body;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        if (nombre) producto.nombre = nombre;
        if (descripcion) producto.descripcion = descripcion;
        if (categoria) producto.categoria = categoria;
        if (tipoDeServicio) producto.tipoDeServicio = tipoDeServicio;
        if (precio) producto.precio = precio;
        if (ingredientes) {
            if (!Array.isArray(ingredientes)) {
                return res.status(400).json({ message: 'El campo ingredientes debe ser un arreglo' });
            }

            let costoProduccionTotal = 0;

            for (const ingredienteInfo of ingredientes) {
                const { ingrediente, cantidadRequerida } = ingredienteInfo;

                const ingredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente }).populate('ingrediente');
                if (!ingredienteAlmacen) {
                    return res.status(404).json({ message: `El ingrediente con id ${ingrediente} no se encuentra en el almacén` });
                }

                if (ingredienteAlmacen.cantidad < cantidadRequerida) {
                    return res.status(400).json({ message: `No hay suficiente cantidad del ingrediente ${ingredienteAlmacen.ingrediente.nombre} en el almacén` });
                }

                const costoPorIngrediente = ingredienteAlmacen.ingrediente.precio * cantidadRequerida;
                costoProduccionTotal += costoPorIngrediente;
            }

            producto.ingredientes = ingredientes.map(i => ({
                ingrediente: i.ingrediente,
                cantidadRequerida: i.cantidadRequerida
            }));

            producto.costoProduccion = costoProduccionTotal;
        }

        if (imagenes && Array.isArray(imagenes)) {
            producto.imagenes = imagenes;
        }

        await producto.save();
        return res.status(200).json({ message: 'Producto actualizado exitosamente', producto });
    } catch (error) {
        console.error('Error al actualizar el producto:', error.message);
        return res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        await producto.remove();
        return res.status(200).json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el producto:', error.message);
        return res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
    }
};

module.exports = {
    crearProducto,
    mostrarProductos,
    verProductoPorId,
    actualizarProducto,
    eliminarProducto,
    mostrarProductosNombres
};