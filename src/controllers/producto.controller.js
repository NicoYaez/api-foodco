const mongoose = require('mongoose');
const Producto = require('../models/producto');
const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

async function crearProducto(req, res) {
    const { nombre, descripcion, ingredientes, categoria, tipoDeServicio, precio, imagenes = [] } = req.body;

    // Verificar que 'ingredientes' es un arreglo
    if (!Array.isArray(ingredientes)) {
        return res.status(400).json({ message: 'El campo ingredientes debe ser un arreglo' });
    }

    if (!nombre || !descripcion || !categoria || !tipoDeServicio || !precio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        let costoProduccionTotal = 0;

        // Iterar sobre los ingredientes proporcionados
        for (const ingredienteInfo of ingredientes) {
            const { ingrediente, cantidadRequerida } = ingredienteInfo;

            // Buscar el IngredienteAlmacen que tiene el ingrediente con el ID proporcionado
            const ingredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente }).populate('ingrediente');

            if (!ingredienteAlmacen) {
                return res.status(404).json({ message: `El ingrediente con id ${ingrediente} no se encuentra en el almacén` });
            }

            // Verificar si hay suficiente cantidad en el almacén
            if (ingredienteAlmacen.cantidad < cantidadRequerida) {
                return res.status(400).json({ message: `No hay suficiente cantidad del ingrediente ${ingredienteAlmacen.ingrediente.nombre} en el almacén` });
            }

            // Calcular el costo de producción para este ingrediente
            const costoPorIngrediente = ingredienteAlmacen.ingrediente.precio * cantidadRequerida;
            costoProduccionTotal += costoPorIngrediente;

            // Actualizar la cantidad del ingrediente en el almacén
            await ingredienteAlmacen.save();
        }

        // Crear el nuevo producto
        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            costoProduccion: costoProduccionTotal,
            precio,  // Almacenamos el precio
            ingredientes: ingredientes.map(i => ({
                ingrediente: i.ingrediente,
                cantidadRequerida: i.cantidadRequerida
            })),
            categoria,
            tipoDeServicio,
            imagenes
        });

        // Establecer las imágenes (si se proporcionaron)
        if (imagenes.length > 0) {
            nuevoProducto.setImagenes(imagenes);
        }

        // Guardar el producto en la base de datos
        await nuevoProducto.save();
        return res.status(200).json({ message: 'Producto creado exitosamente', producto: nuevoProducto });

    } catch (error) {
        console.error('Error al crear el producto:', error.message);
        return res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
}

const mostrarProductos = async (req, res) => {
    try {
        const productos = await Producto.find()

        // Verificar si hay productos
        if (productos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }

        // Devolver los productos encontrados
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

        // Buscar el producto por su ID
        const producto = await Producto.findById(id);

        // Verificar si se encontró el producto
        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        // Devolver el producto encontrado
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

        // Verificar si el producto existe
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        // Actualizar solo los campos que se proporcionan en la solicitud
        if (nombre) producto.nombre = nombre;
        if (descripcion) producto.descripcion = descripcion;
        if (categoria) producto.categoria = categoria;
        if (tipoDeServicio) producto.tipoDeServicio = tipoDeServicio;
        if (precio) producto.precio = precio;

        // Si se proporcionan ingredientes, recalcular el costo de producción
        if (ingredientes) {
            if (!Array.isArray(ingredientes)) {
                return res.status(400).json({ message: 'El campo ingredientes debe ser un arreglo' });
            }

            let costoProduccionTotal = 0;

            for (const ingredienteInfo of ingredientes) {
                const { ingrediente, cantidadRequerida } = ingredienteInfo;

                // Buscar el ingrediente en el almacén
                const ingredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente }).populate('ingrediente');
                if (!ingredienteAlmacen) {
                    return res.status(404).json({ message: `El ingrediente con id ${ingrediente} no se encuentra en el almacén` });
                }

                // Verificar si hay suficiente cantidad en el almacén
                if (ingredienteAlmacen.cantidad < cantidadRequerida) {
                    return res.status(400).json({ message: `No hay suficiente cantidad del ingrediente ${ingredienteAlmacen.ingrediente.nombre} en el almacén` });
                }

                // Calcular el costo de producción
                const costoPorIngrediente = ingredienteAlmacen.ingrediente.precio * cantidadRequerida;
                costoProduccionTotal += costoPorIngrediente;
            }

            producto.ingredientes = ingredientes.map(i => ({
                ingrediente: i.ingrediente,
                cantidadRequerida: i.cantidadRequerida
            }));

            producto.costoProduccion = costoProduccionTotal;
        }

        // Si se proporcionan imágenes, actualizarlas
        if (imagenes && Array.isArray(imagenes)) {
            producto.imagenes = imagenes;
        }

        // Guardar el producto actualizado
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

        // Verificar si el producto existe
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: `Producto con id ${id} no encontrado` });
        }

        // Eliminar el producto
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
    eliminarProducto
};

/*
const realizarVenta = async (req, res) => {
    const { productoId, cantidadVendida, almacen } = req.body;

    try {
        // Verificar si el producto existe
        const producto = await Producto.findById(productoId).populate('ingredienteAlmacen');
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar si hay suficiente cantidad del producto para la venta
        if (producto.cantidad < cantidadVendida) {
            return res.status(400).json({ message: 'Stock insuficiente del producto' });
        }

        // Descontar la cantidad de ingredientes requeridos en el almacén
        for (const ingredienteId of producto.ingredienteAlmacen) {
            const cantidadRequerida = producto.cantidad;  // Cantidad de ingrediente necesaria para producir una unidad del producto

            const ingredienteAlmacen = await IngredienteAlmacen.findOne({
                ingrediente: ingredienteId,
                almacen: almacen
            });

            if (!ingredienteAlmacen) {
                return res.status(404).json({
                    message: `Ingrediente con ID ${ingredienteId} no encontrado en el almacén`
                });
            }

            // Verificar si hay suficiente cantidad del ingrediente
            if (ingredienteAlmacen.cantidad < cantidadRequerida * cantidadVendida) {
                return res.status(400).json({
                    message: `Stock insuficiente para el ingrediente con ID ${ingredienteId}`
                });
            }

            // Descontar la cantidad de ingrediente en el almacén
            await IngredienteAlmacen.findOneAndUpdate(
                { ingrediente: ingredienteId, almacen: almacen },
                { $inc: { cantidad: -cantidadRequerida * cantidadVendida } }
            );
        }

        // Actualizar la cantidad del producto en el almacén
        producto.cantidad -= cantidadVendida;
        await producto.save();

        return res.status(200).json({
            message: 'Venta realizada exitosamente',
            producto
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al realizar la venta',
            error: error.message
        });
    }
};

*/