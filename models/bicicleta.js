// Modelo de Bicicleta.
// La colección se mantiene en memoria (un arreglo), tal como pide la guía.

class Bicicleta {
  constructor(id, color, modelo, ubicacion) {
    this.id = id;
    this.color = color;
    this.modelo = modelo;
    // ubicacion = [lat, lng]
    this.ubicacion = ubicacion;
  }

  toString() {
    return `id: ${this.id} | color: ${this.color} | modelo: ${this.modelo}`;
  }
}

// Colección en memoria (estática a nivel de módulo)
Bicicleta.allBicis = [];

Bicicleta.add = function (aBici) {
  Bicicleta.allBicis.push(aBici);
};

Bicicleta.findById = function (aBiciId) {
  const bici = Bicicleta.allBicis.find(b => b.id == aBiciId);
  if (bici) return bici;
  throw new Error(`No existe una bicicleta con el id ${aBiciId}`);
};

Bicicleta.removeById = function (aBiciId) {
  const index = Bicicleta.allBicis.findIndex(b => b.id == aBiciId);
  if (index === -1) {
    throw new Error(`No existe una bicicleta con el id ${aBiciId}`);
  }
  Bicicleta.allBicis.splice(index, 1);
};

// --- Datos semilla ---
// Un par de bicicletas ya cargadas en la colección, con ubicaciones
// cercanas al centro del mapa (Tegucigalpa, Honduras: 14.0723, -87.1921)
const a = new Bicicleta(1, 'rojo', 'urbana', [14.0818, -87.2068]);
const b = new Bicicleta(2, 'azul', 'montaña', [14.0736, -87.1892]);

Bicicleta.add(a);
Bicicleta.add(b);

module.exports = Bicicleta;
