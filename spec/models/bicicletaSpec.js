const mongoose = require('../../config/database');
const Bicicleta = require('../../models/bicicleta');

describe('Testing Bicicleta (con persistencia en Mongo)', () => {
  beforeAll((done) => {
    if (mongoose.connection.readyState === 1) return done();
    mongoose.connection.once('open', done);
  });

  afterEach(async () => {
    await Bicicleta.deleteMany({});
  });

  describe('Bicicleta.createInstance', () => {
    it('crea una instancia con los datos dados', () => {
      const bici = Bicicleta.createInstance('verde', 'urbana', [-12, -77]);
      expect(bici.color).toBe('verde');
      expect(bici.modelo).toBe('urbana');
      expect(bici.ubicacion[0]).toBe(-12);
      expect(bici.ubicacion[1]).toBe(-77);
    });
  });

  describe('Bicicleta.allBicis', () => {
    it('comienza vacía', async () => {
      const bicis = await Bicicleta.allBicis();
      expect(bicis.length).toBe(0);
    });
  });

  describe('Bicicleta.add', () => {
    it('agrega una bicicleta y queda guardada en la base', async () => {
      const aBici = Bicicleta.createInstance('verde', 'urbana', [-12, -77]);
      await Bicicleta.add(aBici);

      const bicis = await Bicicleta.allBicis();
      expect(bicis.length).toEqual(1);
      expect(bicis[0].color).toEqual('verde');
      expect(bicis[0].modelo).toEqual('urbana');
    });
  });

  describe('Bicicleta.findById', () => {
    it('devuelve la bicicleta correcta según el id', async () => {
      const aBici = Bicicleta.createInstance('rojo', 'urbana', [1, 1]);
      const nuevaBici = await Bicicleta.add(aBici);

      const targetBici = await Bicicleta.findById(nuevaBici._id);
      expect(targetBici.color).toBe('rojo');
      expect(targetBici.modelo).toBe('urbana');
    });
  });

  describe('Bicicleta.removeById', () => {
    it('elimina la bicicleta de la base de datos', async () => {
      const aBici = Bicicleta.createInstance('azul', 'montaña', [2, 2]);
      const nuevaBici = await Bicicleta.add(aBici);

      await Bicicleta.removeById(nuevaBici._id);

      const bicis = await Bicicleta.allBicis();
      expect(bicis.length).toBe(0);
    });
  });
});
