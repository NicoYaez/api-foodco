const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { fileURLToPath } = require('url');

require('../src/database.js');

const authRoutes = require('../src/routes/auth.routes');
const productoRoutes = require('../src/routes/producto.routes');
const ingredienteRoutes = require('../src/routes/ingrediente.routes');  
const sucursalRoutes = require('../src/routes/sucursal.routes');
const almacenRoutes = require('../src/routes/almacen.routes');
const compraRoutes = require('../src/routes/compra.routes');
const menuRoutes = require('../src/routes/menu.routes');
const roleRoutes = require('../src/routes/role.routes');
const rubroRoutes = require('../src/routes/rubro.routes');
const seleccionRoutes = require('../src/routes/seleccion.routes');
const ordenRoutes = require('../src/routes/orden.routes.js');
const devRoutes = require('../src/routes/dev.routes.js');
const tokenRoutes = require('../src/routes/token.routes');
const departamentoRoutes = require('../src/routes/departamento.routes');
const clienteRoutes = require('../src/routes/cliente.routes');
const testRoutes = require('../src/routes/test_upload.routes');
const materiaPrimaRoutes = require('../src/routes/materias.routes.js');
const tipoProductoRoutes = require('../src/routes/tipos.routes.js');
const produccionDiariaRoutes = require('../src/routes/produccion.routes.js');
const inventarioRoutes = require('../src/routes/inventario.routes.js');
const turnosEmpleados = require('../src/routes/turnoEmpleado.routes.js');
const reportesRoutes = require('../src/routes/reportes.routes.js');
const controlCalidadRoutes = require('../src/routes/controlCalidad.routes.js');

const app = express();
app.set('PORT', process.env.PORT);

app.use(cookieParser());
app.use(morgan('dev'));

app.use(cors());

app.use(express.json()); // Para datos en JSON
app.use(express.urlencoded({ extended: true })); // Para datos tipo formulario

app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API!<br>https://nicoyaez.notion.site/Foodco-API-5e33eef09a3f460997403ef67933a478'); // Salto de línea en HTML
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/producto", productoRoutes);
app.use("/api/v1/ingrediente", ingredienteRoutes);
app.use("/api/v1/sucursal", sucursalRoutes);
app.use("/api/v1/almacen", almacenRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/compra", compraRoutes);
app.use("/api/v1/role", roleRoutes);
app.use("/api/v1/rubro", rubroRoutes);
app.use("/api/v1/seleccion-productos", seleccionRoutes);
app.use("/api/v1/orden-compra", ordenRoutes);
app.use("/api/v1/dev", devRoutes);
app.use("/api/v1/verify", tokenRoutes);
app.use("/api/v1/departamento", departamentoRoutes);
app.use("/api/v1/cliente", clienteRoutes);
app.use("/api/v1/test", testRoutes)
app.use("/api/v1/materia-prima", materiaPrimaRoutes);
app.use("/api/v1/tipos-producto", tipoProductoRoutes);
app.use("/api/v1/produccion-diaria", produccionDiariaRoutes);
app.use("/api/v1/inventario", inventarioRoutes);
app.use("/api/v1/turnos-empleados", turnosEmpleados);
app.use("/api/v1/reportes", reportesRoutes);
app.use("/api/v1/control-calidad", controlCalidadRoutes);



//app.get('*', function(req, res){ res.status(404).json({message: 'ERROR 404'}) });

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(app.get('PORT'), () => {
    console.log(`Server funcionando en el puerto ${app.get('PORT')}`)
});
