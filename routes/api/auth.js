const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../../models/user');
const { JWT_SECRET } = require('../../config/passport');

// POST /api/auth/login
// body: { "email": "...", "password": "..." }
// Devuelve un token JWT si las credenciales son correctas.
router.post('/login', function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Debes enviar email y password' });
  }

  User.authenticate()(email, password, function (err, user, options) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      const mensaje = (options && options.message) || 'Credenciales incorrectas';
      return res.status(401).json({ error: mensaje });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token });
  });
});

// POST /api/auth/facebook
// body: { "accessToken": "<token que el cliente obtuvo del SDK de Facebook>" }
// Valida ese token contra la Graph API de Facebook; si es válido,
// crea/recupera el usuario y devuelve un JWT igual que el login normal.
router.post('/facebook', async function (req, res) {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ error: 'Falta el accessToken de Facebook' });
    }

    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
    );
    const fbProfile = await fbResponse.json();

    if (!fbResponse.ok || fbProfile.error) {
      return res.status(401).json({ error: 'Token de Facebook inválido o expirado' });
    }

    const user = await User.findOneOrCreateByFacebook(fbProfile);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
