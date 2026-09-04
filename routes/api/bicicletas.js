const express = require('express');
const router = express.Router();
const Bicicleta = require('../../models/bicicleta');
const { requireJWT } = require('../../middleware/auth');

// Todas las rutas de este archivo requieren un JWT válido
// (header: Authorization: Bearer <token>).
router.use(requireJWT);


// GET /api/bicicletas
// Lista toda la colección de bicicletas (desde MongoDB)
router.get('/', async function (req, res) {
  try {
    const bicicletas = await Bicicleta.allBicis();
    res.status(200).json({ bicicletas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bicicletas/create
// Crea y guarda una bicicleta nueva en MongoDB
// body JSON esperado: { "color": "verde", "modelo": "urbana", "lat": 14.07, "lng": -87.19 }
router.post('/create', async function (req, res) {
  try {
    const { color, modelo, lat, lng } = req.body;

    if (!color || !modelo || lat === undefined || lng === undefined) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: color, modelo, lat, lng'
      });
    }

    const nuevaBici = Bicicleta.createInstance(color, modelo, [lat, lng]);
    await Bicicleta.add(nuevaBici);
    res.status(201).json({ bicicleta: nuevaBici });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bicicletas/:id
// Devuelve una bicicleta por id
router.get('/:id', async function (req, res) {
  try {
    const bici = await Bicicleta.findById(req.params.id);
    if (!bici) {
      return res.status(404).json({ error: 'Bicicleta no encontrada' });
    }
    res.status(200).json({ bicicleta: bici });
  } catch (err) {
    res.status(404).json({ error: 'Bicicleta no encontrada' });
  }
});

// PUT /api/bicicletas/:id
// Actualiza una bicicleta existente
router.put('/:id', async function (req, res) {
  try {
    const { color, modelo, lat, lng } = req.body;
    const cambios = {};
    if (color !== undefined) cambios.color = color;
    if (modelo !== undefined) cambios.modelo = modelo;
    if (lat !== undefined && lng !== undefined) cambios.ubicacion = [lat, lng];

    const bici = await Bicicleta.findByIdAndUpdate(req.params.id, cambios, { new: true });
    if (!bici) {
      return res.status(404).json({ error: 'Bicicleta no encontrada' });
    }
    res.status(200).json({ bicicleta: bici });
  } catch (err) {
    res.status(404).json({ error: 'Bicicleta no encontrada' });
  }
});

// DELETE /api/bicicletas/:id
// Elimina una bicicleta de la base de datos
router.delete('/:id', async function (req, res) {
  try {
    await Bicicleta.removeById(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Bicicleta no encontrada' });
  }
});

module.exports = router;
