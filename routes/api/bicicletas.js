const express = require('express');
const router = express.Router();
const Bicicleta = require('../../models/bicicleta');

// GET /api/bicicletas
// Lista toda la colección de bicicletas
router.get('/', function (req, res) {
  res.status(200).json({ bicicletas: Bicicleta.allBicis });
});

// POST /api/bicicletas/create
// Crea una bicicleta nueva
// body JSON esperado: { "id": 3, "color": "verde", "modelo": "urbana", "lat": 14.07, "lng": -87.19 }
router.post('/create', function (req, res) {
  const { id, color, modelo, lat, lng } = req.body;

  if (id === undefined || !color || !modelo || lat === undefined || lng === undefined) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: id, color, modelo, lat, lng'
    });
  }

  const nuevaBici = new Bicicleta(id, color, modelo, [lat, lng]);
  Bicicleta.add(nuevaBici);
  res.status(201).json({ bicicleta: nuevaBici });
});

// GET /api/bicicletas/:id
// Devuelve una bicicleta por id
router.get('/:id', function (req, res) {
  try {
    const bici = Bicicleta.findById(req.params.id);
    res.status(200).json({ bicicleta: bici });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// PUT /api/bicicletas/:id
// Actualiza una bicicleta existente
router.put('/:id', function (req, res) {
  try {
    const bici = Bicicleta.findById(req.params.id);
    const { color, modelo, lat, lng } = req.body;

    if (color !== undefined) bici.color = color;
    if (modelo !== undefined) bici.modelo = modelo;
    if (lat !== undefined && lng !== undefined) bici.ubicacion = [lat, lng];

    res.status(200).json({ bicicleta: bici });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// DELETE /api/bicicletas/:id
// Elimina una bicicleta de la colección
router.delete('/:id', function (req, res) {
  try {
    Bicicleta.removeById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
