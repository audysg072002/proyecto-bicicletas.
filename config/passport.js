const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_proyecto_bicicletas_2026';

// --- Estrategia local: login con email + password, usando sesión ---
// User.authenticate() la agrega passport-local-mongoose automáticamente:
// compara el password recibido contra el hash guardado.
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));

// Estas dos funciones son las que pide la guía en este archivo:
// definen qué se guarda en la sesión (serialize) y cómo se recupera
// el usuario completo a partir de eso (deserialize).
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- Estrategia JWT: para proteger la API (sin sesión) ---
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.id);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
module.exports.JWT_SECRET = JWT_SECRET;
