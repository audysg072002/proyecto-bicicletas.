const mongoose = require('mongoose');

const BicicletaSchema = new mongoose.Schema({
  color: String,
  modelo: String,
  // ubicacion = [lat, lng]
  ubicacion: {
    type: [Number],
    index: { type: '2dsphere', sparse: true }
  }
});

BicicletaSchema.methods.toString = function () {
  return `id: ${this._id} | color: ${this.color} | modelo: ${this.modelo}`;
};

// Crea una instancia (sin guardarla todavía) a partir de sus datos.
BicicletaSchema.statics.createInstance = function (color, modelo, ubicacion) {
  return new this({ color, modelo, ubicacion });
};

// Devuelve todas las bicicletas de la colección.
BicicletaSchema.statics.allBicis = function () {
  return this.find({});
};

// Guarda una bicicleta nueva en la base de datos.
BicicletaSchema.statics.add = function (aBici) {
  return this.create(aBici);
};

// Elimina una bicicleta por su id.
BicicletaSchema.statics.removeById = function (aBiciId) {
  return this.findByIdAndDelete(aBiciId);
};

// Nota: findById, findByIdAndUpdate, find, etc. ya vienen incluidos
// de forma nativa en cualquier modelo de Mongoose, no hace falta
// redefinirlos aquí.

module.exports = mongoose.model('Bicicleta', BicicletaSchema);
