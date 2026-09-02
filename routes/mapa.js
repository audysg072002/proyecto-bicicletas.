const express = require('express');
const router = express.Router();

/* GET mapa con bicicletas. */
router.get('/', function (req, res, next) {
  res.render('mapa', {
    title: 'Mapa de Bicicletas',
    centro: { lat: 14.0723, lng: -87.1921 } // Tegucigalpa, Honduras
  });
});

module.exports = router;
