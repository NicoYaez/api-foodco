const OrdenCompra = require('../models/ordenCompra');
const Empleado = require('../models/empleado');
const Cliente = require('../models/cliente');

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

module.exports = {
    verOrdenesCompra,
    verOrdenesPorCliente,
    actualizarEstadoOrden,
    verOrdenCompraPorId,
    verOrdenesPorEmpleado,
    verOrdenesCompletadasPorEmpleado,
    verOrdenesPorEstado,
    actualizarOrdenCompra
};
