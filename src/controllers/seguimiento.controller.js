const OrdenDespacho = require('../models/ordenDespacho');

const seguimientoOrdenDespacho = async (req, res) => {
    const { numeroOrdenDespacho } = req.params;
    try {
        const ordenDespacho = await OrdenDespacho.findOne({ numero: numeroOrdenDespacho })
            .populate({
                path: 'ordenCompra',
                select: '-empleado -cliente',
                populate: {
                    path: 'seleccionProductos',
                    select: 'productos direccion ciudad pais precioTotalOrden',
                }
            })
            .populate({
                path: 'empleado',
                select: 'nombre apellido username',
                populate: {
                    path: 'role',
                    select: 'nombre'
                }
            })
            .populate({
                path: 'cliente',
                select: 'nombre apellido email',
                populate: [
                    {
                        path: 'empresa',
                    },
                    {
                        path: 'contacto',
                        select: 'nombre telefono email',
                    }
                ]
            });

        if (!ordenDespacho) {
            return res.status(404).json({
                message: 'No se encontró una orden de despacho con ese número'
            });
        }

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
