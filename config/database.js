const mongoose = require('mongoose');

// Usa una base de datos distinta cuando se corren los tests
// (NODE_ENV=test), para no mezclar datos reales con datos de prueba.
const dbName = process.env.NODE_ENV === 'test' ? 'testdb' : 'red_bicicletas';
const mongoUri = `mongodb://localhost/${dbName}`;

mongoose.connect(mongoUri)
  .then(() => {
    console.log(`Mongoose conectado a la base de datos "${dbName}"`);
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err.message);
  });

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión de Mongoose:', err.message);
});

module.exports = mongoose;
