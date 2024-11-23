const OrdenCompra = require('../models/ordenCompra');
const Empleado = require('../models/empleado');
const Cliente = require('../models/cliente');
const Factura = require('../models/factura');

async function verOrdenesCompra(req, res) {
    try {
        const ordenes = await OrdenCompra.find()
            .populate({
                path: 'cliente',  // Populamos el campo cliente
                populate: [
                    {
                        path: 'empresa',  // Populamos la referencia a Empresa dentro de Cliente
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',  // Populamos la referencia a Rubro dentro de Empresa
                            model: 'Rubro',  // Asegúrate de que 'Rubro' es el nombre correcto del modelo
                            select: 'nombre'  // Seleccionamos solo el nombre de Rubro
                        }
                    },
                    {
                        path: 'sucursal',  // Populamos la referencia a Sucursal dentro de Cliente
                        model: 'Sucursal'  // Asegúrate de que 'Sucursal' es el nombre correcto de tu modelo
                    },
                    {
                        path: 'contacto',  // Populamos la referencia a Contacto dentro de Cliente
                        model: 'Contacto'  // Asegúrate de que 'Contacto' es el nombre correcto de tu modelo
                    }
                ]
            })
            .populate('empleado')  // Populamos el empleado relacionado
            .populate({
                path: 'seleccionProductos',  // Populamos la selección de productos
                populate: {
                    path: 'productos.producto',  // Aquí se hace el populate de los productos dentro de seleccionProductos
                    model: 'Producto'  // Asegúrate de que 'Producto' es el nombre correcto de tu modelo
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingrediente',  // Populamos el ingrediente dentro de cada producto
                    model: 'Ingrediente'  // Asegúrate de que 'Ingrediente' es el nombre correcto de tu modelo
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
                    path: 'productos.producto',  // Aquí se hace el populate de los productos dentro de seleccionProductos
                    model: 'Producto'  // Asegúrate de que 'Producto' es el nombre del modelo de productos
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

        // Buscar la orden de compra por su ID
        const orden = await OrdenCompra.findById(id)
            .populate({
                path: 'cliente',  // Populamos el campo cliente
                populate: [
                    {
                        path: 'empresa',  // Populamos la referencia a Empresa dentro de Cliente
                        model: 'Empresa',
                        populate: {
                            path: 'rubro',  // Populamos la referencia a Rubro dentro de Empresa
                            model: 'Rubro',  // Asegúrate de que 'Rubro' es el nombre correcto del modelo
                            select: 'nombre'  // Seleccionamos solo el nombre del Rubro
                        }
                    },
                    {
                        path: 'sucursal',  // Populamos la referencia a Sucursal dentro de Cliente
                        model: 'Sucursal'
                    },
                    {
                        path: 'contacto',  // Populamos la referencia a Contacto dentro de Cliente
                        model: 'Contacto'
                    }
                ]
            })
            .populate('empleado')  // Populamos el empleado relacionado
            .populate({
                path: 'seleccionProductos',  // Populamos la selección de productos
                populate: {
                    path: 'productos.producto',  // Populamos los productos dentro de seleccionProductos
                    model: 'Producto'
                }
            })
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto.ingredientes.ingrediente',  // Populamos los ingredientes dentro de los productos
                    model: 'Ingrediente',  // Asegúrate de que 'Ingrediente' es el nombre correcto del modelo
                    select: 'nombre descripcion'  // Seleccionamos campos específicos, como el nombre y la descripción
                }
            });

        // Verificar si se encontró la orden
        if (!orden) {
            return res.status(404).json({ message: `Orden de compra con id ${id} no encontrada` });
        }

        // Responder con la orden encontrada
        return res.status(200).json(orden);
    } catch (error) {
        console.error('Error al obtener la orden de compra:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

async function actualizarEstadoOrden(req, res) {
    try {
        const { nuevoEstado, empleadoId } = req.body;
        const { ordenId } = req.params;

        // Verificar si la orden existe
        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        // Verificar si el empleado existe
        const empleado = await Empleado.findById(empleadoId);
        if (!empleado) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // Registrar el cambio de estado
        const cambioEstado = {
            estadoAnterior: orden.estado,
            estadoNuevo: nuevoEstado,
            empleado: empleado._id,
            fechaCambio: new Date()
        };

        // Si es el primer cambio, asignar al empleado responsable
        if (!orden.empleado) {
            orden.empleado = empleado._id;
        }

        // Actualizar el estado y guardar el historial de cambios
        orden.estado = nuevoEstado;
        orden.historialCambios.push(cambioEstado);

        // Guardar la orden con los cambios
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

        // Buscar órdenes de compra asignadas al empleado que NO estén en estado "completado"
        const ordenes = await OrdenCompra.find({ empleado: empleadoId, estado: { $ne: 'completado' } })
            .populate('cliente')  // Información del cliente
            .populate('empleado')  // Información del empleado que realizó la orden
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Poblamos los productos dentro de seleccionProductos
                    model: 'Producto'  // Nombre del modelo de productos
                }
            });

        // Si no se encuentran órdenes asignadas al empleado que cumplan el filtro
        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes activas para este empleado' });
        }

        // Responder con las órdenes encontradas
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

        // Buscar órdenes de compra asignadas al empleado que estén en estado "completado"
        const ordenes = await OrdenCompra.find({ empleado: empleadoId, estado: 'completado' })
            .populate('cliente')  // Información del cliente
            .populate('empleado')  // Información del empleado que realizó la orden
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Poblamos los productos dentro de seleccionProductos
                    model: 'Producto'  // Nombre del modelo de productos
                }
            });

        // Si no se encuentran órdenes completadas asignadas al empleado
        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes completadas para este empleado' });
        }

        // Responder con las órdenes encontradas
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes completadas por empleado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesPorEstado(req, res) {
    try {
        const { estado } = req.query;  // Obtener el estado de la consulta (query)

        // Construimos el filtro dependiendo si el estado es proporcionado o no
        const filtro = {};
        if (estado) {
            filtro.estado = estado;  // Agregar el filtro de estado si es proporcionado
        }

        // Buscar órdenes de compra filtradas por estado (si se proporcionó) o traer todas
        const ordenes = await OrdenCompra.find(filtro)
            .populate('cliente')  // Información del cliente
            .populate('empleado')  // Información del empleado que realizó la orden
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Poblamos los productos dentro de seleccionProductos
                    model: 'Producto'  // Nombre del modelo de productos
                }
            });

        // Si no se encuentran órdenes que cumplan el filtro
        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes para el estado proporcionado' });
        }

        // Responder con las órdenes encontradas
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por estado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function actualizarOrdenCompra(req, res) {
    try {
        const { ordenId } = req.params;  // Obtener el ID de la orden
        const actualizaciones = req.body;  // Obtener los campos a actualizar desde el cuerpo de la solicitud

        // Verificar si la orden existe
        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        // Actualizar solo los campos proporcionados
        if (actualizaciones.estado) {
            const cambioEstado = {
                estadoAnterior: orden.estado,
                estadoNuevo: actualizaciones.estado,
                empleado: actualizaciones.empleadoId || orden.empleado,  // Asignar empleado si se proporciona
                fechaCambio: new Date()
            };

            // Agregar el historial de cambio de estado
            orden.historialCambios.push(cambioEstado);
            orden.estado = actualizaciones.estado;  // Actualizar el estado
        }

        // Actualizar otros campos si están presentes en el cuerpo de la solicitud
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

        // Calcular el precio nuevamente si se ha actualizado la selección de productos
        if (actualizaciones.seleccionProductos) {
            await orden.save();  // Guardar los cambios para recalcular los precios (gracias a los hooks)
        }

        // Guardar los cambios en la orden
        await orden.save();

        // Devolver la orden actualizada
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
        const { periodo } = req.params;  // Obtenemos el periodo desde los query params
        const now = new Date();  // Fecha actual
        let startDate;  // Fecha de inicio para el filtro

        // Definir la fecha de inicio basada en el período seleccionado
        switch (periodo) {
            case 'diario':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());  // Hoy
                break;
            case 'semanal':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));  // Primer día de la semana (domingo)
                break;
            case 'bisemanal':
                startDate = new Date(now.setDate(now.getDate() - (now.getDay() + 7)));  // Dos semanas atrás
                break;
            case 'mensual':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);  // Primer día del mes
                break;
            case 'trimestral':
                const currentMonth = now.getMonth() + 1;  // Mes actual (0-indexado, por lo que sumamos 1)
                const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;  // Trimestre actual
                startDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);  // Primer día del trimestre
                break;
            case 'semestral':
                const currentSemester = Math.floor((now.getMonth() + 1 - 1) / 6) + 1;  // Semestre actual
                startDate = new Date(now.getFullYear(), (currentSemester - 1) * 6, 1);  // Primer día del semestre
                break;
            default:
                startDate = null;  // Si no se selecciona período, no filtramos por fecha
        }

        // Crear la consulta con el filtro de fecha
        const query = startDate ? { createdAt: { $gte: startDate } } : {};  // Aplicamos el filtro solo si tenemos una startDate

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

        // Verificamos si no hay órdenes y enviamos un mensaje adecuado
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
        const { clienteId } = req.params; // Obtener el clienteId de los parámetros de la ruta
        const { estado } = req.query;     // Obtener el estado de la consulta (query)

        // Construimos el filtro dependiendo de si clienteId y/o estado son proporcionados
        const filtro = {};
        if (clienteId) {
            filtro.cliente = clienteId; // Agregar filtro por cliente si es proporcionado
        }
        if (estado && estado !== 'no-completado' && estado !== 'completado') {
            filtro.estado = estado;
        } else if (estado === 'completado') {
            filtro.estado = { $in: ['entregado', 'rechazado', 'completado'] };
        } else if (estado === 'no-completado') {
            filtro.estado = { $nin: ['entregado', 'rechazado', 'completado'] };
        }

        // Buscar órdenes de compra filtradas por cliente y estado (si se proporcionaron)
        const ordenes = await OrdenCompra.find(filtro)
            .populate('cliente')  // Información del cliente
            .populate('empleado')  // Información del empleado que realizó la orden
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Poblamos los productos dentro de seleccionProductos
                    model: 'Producto'  // Nombre del modelo de productos
                }
            });

        // Si no se encuentran órdenes que cumplan el filtro
        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes con los criterios proporcionados' });
        }

        // Responder con las órdenes encontradas
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes de compra por cliente y estado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function verOrdenesCompraSinFactura(req, res) {
    try {
        // Obtener los IDs de las órdenes de compra que ya tienen una factura
        const facturas = await Factura.find().select('ordenCompra'); // Obtiene solo el campo de ordenCompra
        const ordenesConFacturaIds = facturas.map(factura => factura.ordenCompra.toString());

        // Filtrar las órdenes de compra que no están en la lista de IDs de órdenes con factura
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
        // Definir el filtro para estado "listo_para_despachar"
        const filtro = { estado: 'listo_para_despachar' };

        // Buscar órdenes de compra con estado "listo_para_despachar" y ordenarlas por fechaRequerida
        const ordenes = await OrdenCompra.find(filtro)
            .sort({ fechaRequerida: 1 }) // Ordena por fechaRequerida en orden ascendente (más urgente primero)
            .populate('cliente')  // Información del cliente
            .populate('empleado')  // Información del empleado que realizó la orden
            .populate({
                path: 'seleccionProductos',
                populate: {
                    path: 'productos.producto',  // Poblamos los productos dentro de seleccionProductos
                    model: 'Producto'  // Nombre del modelo de productos
                }
            });

        // Si no se encuentran órdenes que cumplan el filtro
        if (ordenes.length === 0) {
            return res.status(404).json({ message: 'No se encontraron órdenes con estado listo_para_despachar' });
        }

        // Responder con las órdenes encontradas
        res.status(200).json(ordenes);
    } catch (error) {
        console.error('Error al obtener las órdenes listas para despacho:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const actualizarNumeroDeCuotas = async (req, res) => {
    try {
        const { ordenId } = req.params; // ID de la orden
        const { numeroDeCuotas } = req.body; // Número de cuotas enviado

        // Validar el número de cuotas
        if (!numeroDeCuotas || numeroDeCuotas <= 0) {
            return res.status(400).json({ message: 'El número de cuotas debe ser mayor a 0.' });
        }

        // Buscar la orden
        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        // Calcular el monto de cada cuota
        const montoPorCuota = Math.round(orden.precioFinalConIva / numeroDeCuotas);

        // Limpiar cuotas anteriores y crear nuevas cuotas
        orden.cuotas = [];
        for (let i = 0; i < numeroDeCuotas; i++) {
            orden.cuotas.push({
                numeroCuota: i + 1,
                estado: 'por_pagar', // Estado inicial
                monto: montoPorCuota
            });
        }

        // Actualizar el número de cuotas
        orden.numeroDeCuotas = numeroDeCuotas;

        // Guardar la orden actualizada
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
        const { ordenId, numeroCuota } = req.params; // ID de la orden y número de la cuota
        const { estado } = req.body; // Estado proporcionado

        // Validar que el estado sea válido
        if (!['por_pagar', 'pagado'].includes(estado)) {
            return res.status(400).json({ message: "El estado debe ser 'por_pagar' o 'pagado'." });
        }

        // Buscar la orden
        const orden = await OrdenCompra.findById(ordenId);
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada.' });
        }

        // Buscar la cuota correspondiente
        const cuota = orden.cuotas.find(c => c.numeroCuota === parseInt(numeroCuota));
        if (!cuota) {
            return res.status(404).json({ message: `No se encontró la cuota número ${numeroCuota}.` });
        }

        // Actualizar el estado de la cuota
        cuota.estado = estado;

        // Guardar la orden actualizada
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

    // Validación del ID de la orden
    if (!ordenId) {
        return res.status(400).json({ message: 'El ID de la orden es requerido' });
    }

    if (ordenId.length !== 24) {
        return res.status(400).json({ message: 'El ID de la orden no es válido' });
    }

    try {
        // Buscar la orden por ID
        const orden = await OrdenCompra.findById(ordenId)
            .populate('empleado') // Popula el empleado si es necesario
            .populate('cliente') // Popula el cliente si es necesario
            .populate('seleccionProductos'); // Popula los productos si es necesario

        // Verificamos si la orden existe
        if (!orden) {
            return res.status(404).json({ message: 'Orden de compra no encontrada' });
        }

        // Calculamos los detalles de las cuotas
        const totalCuotas = orden.cuotas.length;
        const cuotasPagadas = orden.cuotas.filter(cuota => cuota.estado === 'pagado').length;
        const cuotasPorPagar = totalCuotas - cuotasPagadas;

        // Formateamos el resultado
        const resultado = {
            numeroOrden: orden.numero,
            cliente: orden.cliente, // Incluye el cliente si es necesario
            precioTotalOrden: orden.precioTotalOrden,
            precioFinalConIva: orden.precioFinalConIva,
            numeroDeCuotas: orden.numeroDeCuotas,
            detallesCuotas: {
                totalCuotas,
                cuotasPagadas,
                cuotasPorPagar,
                listaCuotas: orden.cuotas // Incluye el detalle de cada cuota
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
