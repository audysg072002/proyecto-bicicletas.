const request = require('request');
const mongoose = require('../config/database');
const Bicicleta = require('../models/bicicleta');
const User = require('../models/user');
const app = require('../app');

const PORT = 3900;
const base = `http://localhost:${PORT}/api/bicicletas`;
const authBase = `http://localhost:${PORT}/api/auth`;
const TEST_EMAIL = 'test.bicicletas@example.com';
const TEST_PASSWORD = 'clave12345';

let server;
let authToken;

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) return reject(error);
      resolve({ response, body });
    });
  });
}

describe('Bicicleta API (protegida con JWT)', () => {
  beforeAll(async () => {
    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once('open', resolve);
    });

    await new Promise((resolve) => { server = app.listen(PORT, resolve); });

    // Crea un usuario de prueba y obtiene su token JWT antes de correr los tests.
    await User.deleteOne({ email: TEST_EMAIL });
    const nuevoUsuario = new User({ email: TEST_EMAIL, verificado: true });
    await User.register(nuevoUsuario, TEST_PASSWORD);

    const { body } = await requestAsync({
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      url: `${authBase}/login`,
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
    });
    authToken = JSON.parse(body).token;
  });

  afterEach(async () => {
    await Bicicleta.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteOne({ email: TEST_EMAIL });
    await new Promise((resolve) => server.close(resolve));
  });

  function authHeaders(extra) {
    return Object.assign({ Authorization: `Bearer ${authToken}` }, extra || {});
  }

  describe('Sin token', () => {
    it('status 401 al pedir la lista de bicicletas sin autenticarse', async () => {
      const { response, body } = await requestAsync({ method: 'GET', url: base });
      expect(response.statusCode).toBe(401);
      expect(JSON.parse(body).error).toBeDefined();
    });
  });

  describe('GET /api/bicicletas', () => {
    it('status 200 y devuelve un arreglo de bicicletas (con token)', async () => {
      const { response, body } = await requestAsync({
        method: 'GET',
        url: base,
        headers: authHeaders()
      });
      expect(response.statusCode).toBe(200);
      const bicis = JSON.parse(body).bicicletas;
      expect(Array.isArray(bicis)).toBe(true);
    });
  });

  describe('POST /api/bicicletas/create', () => {
    it('status 201 y crea la bicicleta en la base de datos (con token)', async () => {
      const aBici = { color: 'verde', modelo: 'urbana', lat: -12, lng: -77 };

      const { response, body } = await requestAsync({
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
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
    it('status 200 y devuelve la bicicleta pedida (con token)', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );

      const { response, body } = await requestAsync({
        method: 'GET',
        url: `${base}/${nuevaBici._id}`,
        headers: authHeaders()
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(body).bicicleta.color).toBe('rojo');
    });
  });

  describe('PUT /api/bicicletas/:id', () => {
    it('status 200 y actualiza la bicicleta (con token)', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('rojo', 'urbana', [1, 1])
      );

      const { response, body } = await requestAsync({
        method: 'PUT',
        headers: authHeaders({ 'content-type': 'application/json' }),
        url: `${base}/${nuevaBici._id}`,
        body: JSON.stringify({ color: 'negro' })
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(body).bicicleta.color).toBe('negro');
    });
  });

  describe('DELETE /api/bicicletas/:id', () => {
    it('status 204 y elimina la bicicleta de la base de datos (con token)', async () => {
      const nuevaBici = await Bicicleta.add(
        Bicicleta.createInstance('azul', 'urbana', [2, 2])
      );

      const { response } = await requestAsync({
        method: 'DELETE',
        url: `${base}/${nuevaBici._id}`,
        headers: authHeaders()
      });

      expect(response.statusCode).toBe(204);
    });
  });
});
