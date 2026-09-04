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

module.exports = router;
