// Debe ser el primer require de todo el archivo (así lo exige New Relic).
// Sin NEW_RELIC_LICENSE_KEY configurada, solo imprime un aviso y no hace
// nada más — no rompe el proyecto en local.
require('newrelic');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const mongoose = require('./config/database');
const passport = require('./config/passport');
const { ensureAuthenticated } = require('./middleware/auth');

const indexRouter = require('./routes/index');
const mapaRouter = require('./routes/mapa');
const authRouter = require('./routes/auth');
const bicicletasApiRouter = require('./routes/api/bicicletas');
const authApiRouter = require('./routes/api/auth');

const app = express();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Sesiones (necesarias para el login con Passport en el navegador)
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_secreta_sesion_bicicletas_2026',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ client: mongoose.connection.getClient() })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Rutas
app.use('/', indexRouter);
app.use('/', authRouter); // /login, /register, /logout, /verify/:token, etc.
app.use('/mapa', ensureAuthenticated, mapaRouter); // protegida: sin sesión -> redirige a /login
app.use('/api/bicicletas', bicicletasApiRouter); // protegida con JWT (adentro del router)
app.use('/api/auth', authApiRouter); // POST /api/auth/login -> devuelve JWT

// Manejo de 404
app.use(function (req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
