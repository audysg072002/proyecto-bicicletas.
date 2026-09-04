const passport = require('../config/passport');

// Para rutas de VISTAS (navegador, con sesión).
// Si no estás logueado, te manda directo a /login.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Para rutas de la API (sin sesión, con JWT en el header Authorization).
// Si el token falta o es inválido, responde 401 con un mensaje claro.
function requireJWT(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({
        error: 'No estás autenticado. Envía un token válido en el header Authorization (Bearer <token>).'
      });
    }
    req.user = user;
    next();
  })(req, res, next);
}

module.exports = { ensureAuthenticated, requireJWT };
