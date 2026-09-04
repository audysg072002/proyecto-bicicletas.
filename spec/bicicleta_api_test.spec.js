const request = require('request');
const mongoose = require('../config/database');
const Bicicleta = require('../models/bicicleta');
const app = require('../app');

const PORT = 3900;
const base = `http://localhost:${PORT}/api/bicicletas`;
let server;

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
    server.close(() => {
      mongoose.connection.close().then(done);
    });
  });

  describe('GET /api/bicicletas', () => {
    it('status 200 y devuelve un arreglo de bicicletas', (done) => {
      request.get(base, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        const bicis = JSON.parse(body).bicicletas;
        expect(Array.isArray(bicis)).toBe(true);
        done();
      });
    });
  });

  describe('POST /api/bicicletas/create', () => {
    it('status 201 y crea la bicicleta en la base de datos', (done) => {
      const headers = { 'content-type': 'application/json' };
      const aBici = { color: 'verde', modelo: 'urbana', lat: -12, lng: -77 };

      request.post({
        headers,
        url: `${base}/create`,
        body: JSON.stringify(aBici)
      }, (error, response, body) => {
        expect(response.statusCode).toBe(201);
        const bici = JSON.parse(body).bicicleta;
        expect(bici.color).toBe('verde');
        expect(bici.modelo).toBe('urbana');
        done();
      });
    });
  });

  describe('GET /api/bicicletas/:id', () => {
    it('status 200 y devuelve la bicicleta pedida', async (done) => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );

      request.get(`${base}/${nuevaBici._id}`, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(body).bicicleta.color).toBe('rojo');
        done();
      });
    });
  });

  describe('PUT /api/bicicletas/:id', () => {
    it('status 200 y actualiza la bicicleta', async (done) => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );
      const headers = { 'content-type': 'application/json' };

      request.put({
        headers,
        url: `${base}/${nuevaBici._id}`,
        body: JSON.stringify({ color: 'negro' })
      }, (error, response, body) => {
        expect(response.statusCode).toBe(200);
        expect(JSON.parse(body).bicicleta.color).toBe('negro');
        done();
      });
    });
  });

  describe('DELETE /api/bicicletas/:id', () => {
    it('status 204 y elimina la bicicleta de la base de datos', async (done) => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('azul', 'urbana', [2, 2])
      );

      request.delete(`${base}/${nuevaBici._id}`, (error, response, body) => {
        expect(response.statusCode).toBe(204);
        done();
      });
    });
  });
});
