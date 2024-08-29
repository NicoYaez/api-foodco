const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
dotenv.config();
const path = require('path');
const { fileURLToPath } = require('url');

require('../src/database.js');

const authRoutes = require('../src/routes/auth.routes');
const productoRoutes = require('../src/routes/producto.routes');
const ingredienteRoutes = require('../src/routes/ingrediente.routes');  
const sucursalRoutes = require('../src/routes/sucursal.routes');
const almacenRoutes = require('../src/routes/almacen.routes');

const app = express();
app.set('PORT', process.env.PORT);
app.use(express.json());

app.use(cookieParser());
app.use(morgan('dev'));

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRoutes);
app.use("/producto", productoRoutes);
app.use("/ingrediente", ingredienteRoutes);
app.use("/sucursal", sucursalRoutes);
app.use("/almacen", almacenRoutes);

//app.get('*', function(req, res){ res.status(404).json({message: '404'}) });

app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('PORT'), () => {
    console.log(`Server funcionando en el puerto ${app.get('PORT')}`)
});
