const OrdenDespacho = require('../models/ordenDespacho');

const seguimientoOrdenDespacho = async (req, res) => {
    const { numeroOrdenDespacho } = req.params;  // El número de la orden de despacho se pasa como parámetro en la URL
    try {
        // Buscar la orden de despacho por su número único
        const ordenDespacho = await OrdenDespacho.findOne({ numero: numeroOrdenDespacho })
            .populate({
                path: 'ordenCompra',
                select: '-empleado -cliente',  // Excluir empleado y cliente de ordenCompra si no es necesario
                populate: {
                    path: 'seleccionProductos',
                    select: 'productos direccion ciudad pais precioTotalOrden',  // Popula la selección de productos
                }
            })
            .populate({
                path: 'empleado',  // Popula el empleado que creó la orden de despacho
                select: 'nombre apellido username',  // Puedes ajustar los campos necesarios
                populate: {
                    path: 'role',  // Popula el role del empleado
                    select: 'nombre'
                }
            })
            .populate({
                path: 'cliente',  // Popula el cliente asociado a la orden de despacho
                select: 'nombre apellido email',
                populate: [
                    {
                        path: 'empresa',  // Popula la empresa del cliente
                    },
                    {
                        path: 'contacto',  // Popula el contacto del cliente
                        select: 'nombre telefono email',
                    }
                ]
            });

        // Si no se encuentra la orden de despacho
        if (!ordenDespacho) {
            return res.status(404).json({
                message: 'No se encontró una orden de despacho con ese número'
            });
        }

        // Devolver la información de la orden de despacho encontrada
        return res.status(200).json({
            ordenDespacho
        });

    } catch (error) {
        console.error('Error al hacer seguimiento de la orden de despacho:', error);
        return res.status(500).json({
            message: 'Error al hacer seguimiento de la orden de despacho'
        });
    }
};

module.exports = {
    seguimientoOrdenDespacho
};
