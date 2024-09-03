const mongoose = require('mongoose');
const Producto = require('../models/producto');
const Ingrediente = require('../models/ingrediente');
const IngredienteAlmacen = require('../models/ingredienteAlmacen');
const Almacen = require('../models/almacen');


async function crearProducto(req, res) {
    const { nombre, descripcion, ingredientes, categoria, tipoDeServicio, imagenes = [] } = req.body;


    console.log(ingredientes)
    // Verificar que 'ingredientes' es un arreglo
    if (!Array.isArray(ingredientes)) {
        return res.status(400).json({ message: 'El campo ingredientes debe ser un arreglo' });
    }

    if(!nombre || !descripcion || !categoria || !tipoDeServicio) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        let costoProduccionTotal = 0;

        // Iterar sobre los ingredientes proporcionados
        for (const ingredienteInfo of ingredientes) {
            const { ingredienteId, cantidadRequerida } = ingredienteInfo;

            //console.log("Buscando IngredienteAlmacen con ID de Ingrediente:", ingredienteId);

            // Buscar el IngredienteAlmacen que tiene el ingrediente con el ID proporcionado
            const ingredienteAlmacen = await IngredienteAlmacen.findOne({ ingrediente: ingredienteId }).populate('ingrediente');

            //console.log(ingredienteAlmacen)

            if (!ingredienteAlmacen) {
                return res.status(404).json({ message: `El ingrediente con id ${ingredienteId} no se encuentra en el almacén` });
            }

            // Verificar si hay suficiente cantidad en el almacén
            if (ingredienteAlmacen.cantidad < cantidadRequerida) {
                return res.status(400).json({ message: `No hay suficiente cantidad del ingrediente ${ingredienteAlmacen.ingrediente.nombre} en el almacén` });
            }

            // Calcular el costo de producción para este ingrediente
            const costoPorIngrediente = ingredienteAlmacen.ingrediente.precio * cantidadRequerida;
            costoProduccionTotal += costoPorIngrediente;

            // Actualizar la cantidad del ingrediente en el almacén (descontar stock)
            //ingredienteAlmacen.cantidad -= cantidadRequerida;
            await ingredienteAlmacen.save();
        }

        // Crear el nuevo producto
        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            costoProduccion: costoProduccionTotal,
            ingredientes: ingredientes.map(i => ({
                ingredienteId: i.ingredienteId,
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

module.exports = {
    crearProducto,
    mostrarProductos
};

/*
{
  "nombre": "Pizza Margarita",
  "cantidad": 10,
  "ingredientes": [
    {
      "ingredienteAlmacenId": "66d4aceac976161eef17f634",
      "cantidadRequerida": 2
    },
    {
      "ingredienteAlmacenId": "64fda8a69c1e5f4f3b0d6a48",
      "cantidadRequerida": 3
    }
  ],
  "categoria": "Cena",
  "imagenes": [
    "pizza1.jpg",
    "pizza2.jpg"
  ]
}
*/


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