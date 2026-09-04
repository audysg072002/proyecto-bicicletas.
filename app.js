const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

require('./config/database');

const indexRouter = require('./routes/index');
const mapaRouter = require('./routes/mapa');
const bicicletasApiRouter = require('./routes/api/bicicletas');

const app = express();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);
app.use('/mapa', mapaRouter);
app.use('/api/bicicletas', bicicletasApiRouter);

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
