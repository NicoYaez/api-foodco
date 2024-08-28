const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
dotenv.config();
const path = require('path');
const { fileURLToPath } = require('url');

require('../src/database.js');

//const routesAuth = require('../src/routes/auth.routes');
//const tallerRoutes = require('../src/routes/taller.routes.js');
//const userRoutes = require('../src/routes/user.routes.js');
//const horaRoutes = require('../src/routes/hora.routes.js');
//const pacienteRoutes = require('../src/routes/paciente.routes.js');
//const fichaPacienteRoutes = require('../src/routes/fichapaciente.routes.js');

const app = express();
app.set('PORT', process.env.PORT);
app.use(express.json());

app.use(cookieParser());
app.use(morgan('dev'));

app.use(cors());

app.use(express.urlencoded({ extended: false }));

//app.use("/auth", routesAuth);
//app.use("/taller", tallerRoutes);
//app.use("/user", userRoutes);
//app.use("/hora", horaRoutes);
//app.use("/paciente", pacienteRoutes);
//app.use("/ficha/paciente", fichaPacienteRoutes);

//app.get('*', function(req, res){ res.status(404).json({message: '404'}) });

app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('PORT'), () => {
    console.log(`Server funcionando en el puerto ${app.get('PORT')}`)
});
