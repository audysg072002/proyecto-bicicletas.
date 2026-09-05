const mongoose = require('mongoose');

// - En producción (NODE_ENV=production, en Heroku): usa MONGO_URI,
//   la cadena de conexión de MongoDB Atlas.
// - En test: usa una base local aparte para no ensuciar la real.
// - En desarrollo (por defecto, en tu máquina): usa Mongo local.
let mongoUri;
let entorno;

if (process.env.NODE_ENV === 'production') {
  mongoUri = process.env.MONGO_URI;
  entorno = 'producción (MongoDB Atlas)';
} else if (process.env.NODE_ENV === 'test') {
  mongoUri = 'mongodb://localhost/testdb';
  entorno = 'test (Mongo local)';
} else {
  mongoUri = 'mongodb://localhost/red_bicicletas';
  entorno = 'desarrollo (Mongo local)';
}

if (!mongoUri) {
  console.error('Falta la variable de entorno MONGO_URI en producción.');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Mongoose conectado — entorno: ${entorno}`);
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
  });

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión de Mongoose:', err.message);
});

module.exports = mongoose;
