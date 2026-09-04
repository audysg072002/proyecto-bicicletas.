const request = require('request');
const mongoose = require('../config/database');
const Bicicleta = require('../models/bicicleta');
const app = require('../app');

const PORT = 3900;
const base = `http://localhost:${PORT}/api/bicicletas`;
let server;

// Convierte una llamada de "request" (basada en callbacks) en una promesa,
// para poder usar async/await de forma limpia en los tests.
function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) return reject(error);
      resolve({ response, body });
    });
  });
}

describe('Bicicleta API', () => {
  beforeAll((done) => {
    const startServer = () => { server = app.listen(PORT, done); };
    if (mongoose.connection.readyState === 1) {
      startServer();
    } else {
      mongoose.connection.once('open', startServer);
    }
  });

  afterEach(async () => {
    await Bicicleta.deleteMany({});
  });

  afterAll((done) => {
    // No cerramos la conexión de Mongoose aquí: la comparte con
    // spec/models/bicicletaSpec.js y cerrarla la rompería para ese
    // archivo si corre después. Node cierra todo solo al terminar.
    server.close(done);
  });

  describe('GET /api/bicicletas', () => {
    it('status 200 y devuelve un arreglo de bicicletas', async () => {
      const { response, body } = await requestAsync({ method: 'GET', url: base });
      expect(response.statusCode).toBe(200);
      const bicis = JSON.parse(body).bicicletas;
      expect(Array.isArray(bicis)).toBe(true);
    });
  });

  describe('POST /api/bicicletas/create', () => {
    it('status 201 y crea la bicicleta en la base de datos', async () => {
      const headers = { 'content-type': 'application/json' };
      const aBici = { color: 'verde', modelo: 'urbana', lat: -12, lng: -77 };

      const { response, body } = await requestAsync({
        method: 'POST',
        headers,
        url: `${base}/create`,
        body: JSON.stringify(aBici)
      });

      expect(response.statusCode).toBe(201);
      const bici = JSON.parse(body).bicicleta;
      expect(bici.color).toBe('verde');
      expect(bici.modelo).toBe('urbana');
    });
  });

  describe('GET /api/bicicletas/:id', () => {
    it('status 200 y devuelve la bicicleta pedida', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );

      const { response, body } = await requestAsync({
        method: 'GET',
        url: `${base}/${nuevaBici._id}`
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(body).bicicleta.color).toBe('rojo');
    });
  });

  describe('PUT /api/bicicletas/:id', () => {
    it('status 200 y actualiza la bicicleta', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );
      const headers = { 'content-type': 'application/json' };

      const { response, body } = await requestAsync({
        method: 'PUT',
        headers,
        url: `${base}/${nuevaBici._id}`,
        body: JSON.stringify({ color: 'negro' })
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(body).bicicleta.color).toBe('negro');
    });
  });

  describe('DELETE /api/bicicletas/:id', () => {
    it('status 204 y elimina la bicicleta de la base de datos', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('azul', 'urbana', [2, 2])
      );

      const { response } = await requestAsync({
        method: 'DELETE',
        url: `${base}/${nuevaBici._id}`
      });

      expect(response.statusCode).toBe(204);
    });
  });
});
