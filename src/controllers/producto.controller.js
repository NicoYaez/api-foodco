const Producto = require('../models/producto');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

const crearProducto = async (req, res) => {
    const { nombre, cantidad, precio, costoProduccion, almacen, ingredientes } = req.body;

    try {
        // Verificar si el almacén existe
        const almacenBD = await Almacen.findById(almacen);
        if (!almacenBD) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Calcular el costo de producción sin descontar el stock
        let costoProduccionTotal = 0;
        for (const ingrediente of ingredientes) {
            const { ingredienteId, cantidadRequerida } = ingrediente;

            // Verificar si el ingrediente existe en el almacén
            const ingredienteAlmacen = await IngredienteAlmacen.findOne({
                ingrediente: ingredienteId,
                almacen: almacen
            });

            if (!ingredienteAlmacen) {
                return res.status(404).json({
                    message: `Ingrediente con ID ${ingredienteId} no encontrado en el almacén`
                });
            }

            // Calcular el costo de producción basado en el ingrediente y su cantidad
            costoProduccionTotal += ingredienteAlmacen.ingrediente.costo * cantidadRequerida;
        }

        // Crear el nuevo producto sin alterar el stock de los ingredientes
        const nuevoProducto = new Producto({
            nombre,
            cantidad,
            precio,
            costoProduccion,
            almacen,
            ingredienteAlmacen: ingredientes.map(i => i.ingredienteId)
        });

        // Guardar el nuevo producto en la base de datos
        await nuevoProducto.save();

        return res.status(201).json({
            message: 'Producto creado exitosamente',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

const mostrarProductos = async (req, res) => {
    try {
        // Obtener todos los productos de la base de datos
        const productos = await Producto.find().populate('almacen ingredienteAlmacen');

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

module.exports = {
    crearProducto,
    mostrarProductos
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