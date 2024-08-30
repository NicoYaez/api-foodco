const Producto = require('../models/producto');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');

// Función para crear un producto con ingredientes
const crearProducto = async (req, res) => {
    const { nombre, cantidad, precio, almacenId, ingredientes } = req.body;

    try {
        // Verificar si el almacén existe
        const almacen = await Almacen.findById(almacenId);
        if (!almacen) {
            return res.status(404).json({ message: 'Almacén no encontrado' });
        }

        // Verificar ingredientes y calcular el costo de producción
        let costoProduccionTotal = 0;
        for (const ingrediente of ingredientes) {
            const { ingredienteId, cantidadRequerida } = ingrediente;

            // Verificar si el ingrediente existe en el almacén
            const ingredienteAlmacen = await IngredienteAlmacen.findOne({ 
                ingrediente: ingredienteId, 
                almacen: almacenId 
            });

            if (!ingredienteAlmacen) {
                return res.status(404).json({ 
                    message: `Ingrediente con ID ${ingredienteId} no encontrado en el almacén` 
                });
            }

            // Verificar si hay suficiente cantidad del ingrediente
            if (ingredienteAlmacen.cantidad < cantidadRequerida) {
                return res.status(400).json({ 
                    message: `Stock insuficiente para el ingrediente con ID ${ingredienteId}` 
                });
            }

            // Calcular el costo de producción basado en el ingrediente y su cantidad
            costoProduccionTotal += ingredienteAlmacen.ingrediente.costo * cantidadRequerida;
        }

        // Crear el nuevo producto
        const nuevoProducto = new Producto({
            nombre,
            cantidad,
            precio,
            costoProduccion: costoProduccionTotal,
            almacen: almacenId,
            ingredienteAlmacen: ingredientes.map(i => i.ingredienteId)
        });

        // Guardar el nuevo producto en la base de datos
        await nuevoProducto.save();

        // Actualizar las cantidades de los ingredientes en el almacén
        for (const ingrediente of ingredientes) {
            const { ingredienteId, cantidadRequerida } = ingrediente;

            // Reducir la cantidad de ingrediente en el almacén
            await IngredienteAlmacen.findOneAndUpdate(
                { ingrediente: ingredienteId, almacen: almacenId },
                { $inc: { cantidad: -cantidadRequerida } }
            );
        }

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

module.exports = {
    crearProducto
};
