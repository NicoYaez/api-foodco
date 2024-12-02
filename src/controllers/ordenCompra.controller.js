const OrdenCompra = require('../models/ordenCompra');
const Empleado = require('../models/empleado');
const Cliente = require('../models/cliente');
const Factura = require('../models/factura');

async function verOrdenesCompra(req, res) {
    try {
        const ordenes = await OrdenCompra.find()
            .populate({
                path: 'cliente',
                populate: [
                    {
                        path: 'empresa',
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',
                            model: 'Rubro',
                            select: 'nombre'
                        }
                    },
                    {
                        path: 'sucursal',
                        model: 'Sucursal'
                    },
                    {
                        path: 'contacto',
                        model: 'Contacto'
                    }
                ]
            })
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',
                    model: 'Ingrediente'
                }
            });

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorCliente(req, res) {
    try {
        const { clienteId } = req.params;

        if (!clienteId) {
            return res.status(400).json({ message: 'El ID del cliente es requerido' });
        }

        const ordenes = await OrdenCompra.find({ cliente: clienteId })
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes para este cliente' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por cliente:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const verOrdenCompraPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const orden = await OrdenCompra.findById(id)
            .populate({
                path: 'cliente',
                populate: [
                    {
                        path: 'empresa',
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',
                            model: 'Rubro',
                            select: 'nombre'
                        }
                    },
                    {
                        path: 'sucursal',
                        model: 'Sucursal'
                    },
                    {
                        path: 'contacto',
                        model: 'Contacto'
                    }
                ]
            })
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingredientes.ingrediente',
                    model: 'Ingrediente',
                    select: 'nombre descripcion'
                }
            });

        if (!orden) {
            return res.status(404).json({ message: `Orden de compra con id ${id} no encontrada` });
        }

        return res.status(200).json(orden);
    } catch (error) {
        console.error('Error al obtener la orden de compra:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const actualizarEstadoOrden = async (req, res) => {
    try {
        const { nuevoEstado, empleadoId } = req.body;
        const { ordenId } = req.params;

        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        if (!nuevoEstado || !empleadoId) {
            return res.status(400).json({ message: 'El nuevo estado y el ID del empleado son requeridos' });
        }

        const empleado = await Empleado.findById(empleadoId);
        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        const cambioEstado = {
            estadoAnterior: orden.estado,
            estadoNuevo: nuevoEstado,
            empleado: empleado._id,
            fechaCambio: new Date()
        };

        if (!orden.empleado) {
            orden.empleado = empleado._id;
        }

        orden.estado = nuevoEstado;
        orden.historialCambios.push(cambioEstado);

        await orden.save();

        res.status(200).json({
            message: 'Estado de la orden actualizado y asignado al empleado',
            orden
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la orden:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorEmpleado(req, res) {
    try {
        const { empleadoId } = req.params;

        if (!empleadoId) {
            return res.status(400).json({ message: 'El ID del empleado es requerido' });
        }

        const ordenes = await OrdenCompra.find({ empleado: empleadoId, estado: { $ne: 'completado' } })
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes activas para este empleado' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por empleado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesCompletadasPorEmpleado(req, res) {
    try {
        const { empleadoId } = req.params;

        if (!empleadoId) {
            return res.status(400).json({ message: 'El ID del empleado es requerido' });
        }

        const ordenes = await OrdenCompra.find({ empleado: empleadoId, estado: 'completado' })
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes completadas para este empleado' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes completadas por empleado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorEstado(req, res) {
    try {
        const { estado } = req.query;

        const filtro = {};
        if (estado) {
            filtro.estado = estado;
        }

        const ordenes = await OrdenCompra.find(filtro)
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes para el estado proporcionado' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por estado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function actualizarOrdenCompra(req, res) {
    try {
        const { ordenId } = req.params;
        const actualizaciones = req.body;

        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        if (actualizaciones.estado) {
            const cambioEstado = {
                estadoAnterior: orden.estado,
                estadoNuevo: actualizaciones.estado,
                empleado: actualizaciones.empleadoId || orden.empleado,
                fechaCambio: new Date()
            };

            orden.historialCambios.push(cambioEstado);
            orden.estado = actualizaciones.estado;
        }

        if (actualizaciones.cliente) {
            const cliente = await Cliente.findById(actualizaciones.cliente);
            if (!cliente) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }
            orden.cliente = cliente._id;
        }

        if (actualizaciones.seleccionProductos) {
            orden.seleccionProductos = actualizaciones.seleccionProductos;
        }

        if (actualizaciones.fechaRequerida) {
            orden.fechaRequerida = actualizaciones.fechaRequerida;
        }

        if (actualizaciones.seleccionProductos) {
            await orden.save();
        }

        await orden.save();

        res.status(200).json({
            message: 'Orden actualizada exitosamente',
            orden
        });
    } catch (error) {
        console.error('Error al actualizar la orden de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

async function verOrdenesCompraFiltrado(req, res) {
    try {
        const { periodo } = req.params;
        const now = new Date();
        let startDate;

        switch (periodo) {
            case 'diario':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'semanal':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'bisemanal':
                startDate = new Date(now.setDate(now.getDate() - (now.getDay() + 7)));
                break;
            case 'mensual':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'trimestral':
                const currentMonth = now.getMonth() + 1;
                const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
                startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
                break;
            case 'semestral':
                const currentSemester = Math.floor((now.getMonth() + 1 - 1) / 6) + 1;
                startDate = new Date(now.getFullYear(), (currentSemester - 1) * 6, 1);
                break;
            default:
                startDate = null;
        }

        const query = startDate ? { createdAt: { $gte: startDate } } : {};

        const ordenes = await OrdenCompra.find(query)
            .populate({
                path: 'cliente',
                populate: [
                    {
                        path: 'empresa',
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',
                            model: 'Rubro',
                            select: 'nombre'
                        }
                    },
                    {
                        path: 'sucursal',
                        model: 'Sucursal'
                    },
                    {
                        path: 'contacto',
                        model: 'Contacto'
                    }
                ]
            })
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',
                    model: 'Ingrediente'
                }
            });

        if (ordenes.length === 0) {
            return res.status(200).json({ message: `No se encontraron órdenes de compra para el período ${periodo}.` });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorClienteYEstado(req, res) {
    try {
        const { clienteId } = req.params;
        const { estado } = req.query;

        const filtro = {};
        if (clienteId) {
            filtro.cliente = clienteId;
        }
        if (estado && estado !== 'no-completado' && estado !== 'completado') {
            filtro.estado = estado;
        } else if (estado === 'completado') {
            filtro.estado = { $in: ['entregado', 'rechazado', 'completado'] };
        } else if (estado === 'no-completado') {
            filtro.estado = { $nin: ['entregado', 'rechazado', 'completado'] };
        }

        const ordenes = await OrdenCompra.find(filtro)
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes con los criterios proporcionados' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por cliente y estado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesCompraSinFactura(req, res) {
    try {
        const facturas = await Factura.find().select('ordenCompra');
        const ordenesConFacturaIds = facturas.map(factura => factura.ordenCompra.toString());

        const ordenesSinFactura = await OrdenCompra.find({ _id: { $nin: ordenesConFacturaIds } })
            .populate({
                path: 'cliente',
                populate: [
                    {
                        path: 'empresa',
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',
                            model: 'Rubro',
                            select: 'nombre'
                        }
                    },
                    { path: 'sucursal', model: 'Sucursal' },
                    { path: 'contacto', model: 'Contacto' }
                ]
            })
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',
                    model: 'Ingrediente'
                }
            });

        res.status(200).json(ordenesSinFactura);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra sin factura:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesListasParaDespacho(req, res) {
    try {
        const filtro = { estado: 'listo_para_despachar' };

        const ordenes = await OrdenCompra.find(filtro)
            .sort({ fechaRequerida: 1 })
            .populate('cliente')
            .populate('empleado')
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',
                    model: 'Producto'
                }
            });

        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes con estado listo_para_despachar' });
        }

        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes listas para despacho:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const actualizarNumeroDeCuotas = async (req, res) => {
    try {
        const { ordenId } = req.params;
        const { numeroDeCuotas } = req.body;

        if (!numeroDeCuotas || numeroDeCuotas <= 0) {
            return res.status(400).json({ message: 'El número de cuotas debe ser mayor a 0.' });
        }

        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        const montoPorCuota = Math.round(orden.precioFinalConIva / numeroDeCuotas);

        orden.cuotas = [];
        for (let i = 0; i < numeroDeCuotas; i++) {
            orden.cuotas.push({
                numeroCuota: i + 1,
                estado: 'por_pagar',
                monto: montoPorCuota
            });
        }

        orden.numeroDeCuotas = numeroDeCuotas;

        await orden.save();

        return res.status(200).json({
            message: 'Número de cuotas y montos actualizados automáticamente.',
            orden
        });
    } catch (error) {
        console.error('Error al actualizar las cuotas:', error);
        return res.status(500).json({
            message: 'Error al actualizar las cuotas.',
            error: error.message
        });
    }
};

const actualizarEstadoCuota = async (req, res) => {
    try {
        const { ordenId, numeroCuota } = req.params;
        const { estado } = req.body;

        if (!['por_pagar', 'pagado'].includes(estado)) {
            return res.status(400).json({ message: "El estado debe ser 'por_pagar' o 'pagado'." });
        }

        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        const cuota = orden.cuotas.find(c => c.numeroCuota === parseInt(numeroCuota));
        if (!cuota) {
            return res.status(404).json({ message: `No se encontró la cuota número ${numeroCuota}.` });
        }

        cuota.estado = estado;

        await orden.save();

        return res.status(200).json({
            message: `Estado de la cuota número ${numeroCuota} actualizado correctamente.`,
            orden
        });
    } catch (error) {
        console.error('Error al actualizar el estado de la cuota:', error);
        return res.status(500).json({
            message: 'Error al actualizar el estado de la cuota.',
            error: error.message
        });
    }
};

const verOrdenesCompraCuotas = async (req, res) => {
    const { ordenId } = req.params;

    if (!ordenId) {
        return res.status(400).json({ message: 'El ID de la orden es requerido' });
    }

    if (ordenId.length !== 24) {
        return res.status(400).json({ message: 'El ID de la orden no es válido' });
    }

    try {
        const orden = await OrdenCompra.findById(ordenId)
            .populate('empleado')
            .populate('cliente')
            .populate('seleccionProductos');

        if (!orden) {
            return res.status(404).json({ message: 'Orden de compra no encontrada' });
        }

        const totalCuotas = orden.cuotas.length;
        const cuotasPagadas = orden.cuotas.filter(cuota => cuota.estado === 'pagado').length;
        const cuotasPorPagar = totalCuotas - cuotasPagadas;

        const resultado = {
            numeroOrden: orden.numero,
            cliente: orden.cliente,
            precioTotalOrden: orden.precioTotalOrden,
            precioFinalConIva: orden.precioFinalConIva,
            numeroDeCuotas: orden.numeroDeCuotas,
            detallesCuotas: {
                totalCuotas,
                cuotasPagadas,
                cuotasPorPagar,
                listaCuotas: orden.cuotas
            }
        };

        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al obtener la orden de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    verOrdenesCompra,
    verOrdenesPorCliente,
    actualizarEstadoOrden,
    verOrdenCompraPorId,
    verOrdenesPorEmpleado,
    verOrdenesCompletadasPorEmpleado,
    verOrdenesPorEstado,
    actualizarOrdenCompra,
    verOrdenesCompraFiltrado,
    verOrdenesPorClienteYEstado,
    verOrdenesCompraSinFactura,
    verOrdenesListasParaDespacho,
    actualizarNumeroDeCuotas,
    actualizarEstadoCuota,
    verOrdenesCompraCuotas
};
