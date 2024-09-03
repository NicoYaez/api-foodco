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

const app = express();
app.set('PORT', process.env.PORT);
app.use(express.json());

app.use(cookieParser());
app.use(morgan('dev'));

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/producto", productoRoutes);
app.use("/api/v1/ingrediente", ingredienteRoutes);
app.use("/api/v1/sucursal", sucursalRoutes);
app.use("/api/v1/almacen", almacenRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/compra", compraRoutes);
app.use("/api/v1/role", roleRoutes);
app.use("/api/v1/rubro", rubroRoutes);

//app.get('*', function(req, res){ res.status(404).json({message: '404'}) });

app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(app.get('PORT'), () => {
    console.log(`Server funcionando en el puerto ${app.get('PORT')}`)
});
