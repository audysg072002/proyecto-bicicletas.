const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido']
  },
  // "password" la maneja passport-local-mongoose (queda hasheada + con salt,
  // nunca se guarda en texto plano).
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetTokenExpires: {
    type: Date,
    default: null
  },
  verificado: {
    type: Boolean,
    default: false
  },
  // Para cuentas vinculadas por login social (no todas las cuentas
  // van a tener estos campos, solo las que entraron por ahí).
  googleId: {
    type: String,
    default: null
  },
  facebookId: {
    type: String,
    default: null
  }
});

// Agrega automáticamente: campo "password" (hasheado), y los métodos
// register(), authenticate(), serializeUser(), deserializeUser().
UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  errorMessages: {
    UserExistsError: 'Ya existe una cuenta registrada con ese email'
  }
});

// Busca un usuario ya vinculado a esta cuenta de Google; si no existe,
// intenta vincularlo por email, y si tampoco, crea uno nuevo.
UserSchema.statics.findOneOrCreateByGoogle = async function (profile) {
  const email = profile.emails && profile.emails[0] && profile.emails[0].value;

  let user = await this.findOne({ googleId: profile.id });
  if (user) return user;

  if (email) {
    user = await this.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      user.verificado = true;
      await user.save();
      return user;
    }
  }

  user = new this({
    email: email || `${profile.id}@google.local`,
    googleId: profile.id,
    verificado: true // Google ya verificó el email por nosotros.
  });
  await user.save();
  return user;
};

// Mismo patrón, pero para el perfil que devuelve la Graph API de Facebook.
UserSchema.statics.findOneOrCreateByFacebook = async function (fbProfile) {
  let user = await this.findOne({ facebookId: fbProfile.id });
  if (user) return user;

  const email = fbProfile.email;
  if (email) {
    user = await this.findOne({ email });
    if (user) {
      user.facebookId = fbProfile.id;
      user.verificado = true;
      await user.save();
      return user;
    }
  }

  user = new this({
    email: email || `${fbProfile.id}@facebook.local`,
    facebookId: fbProfile.id,
    verificado: true
  });
  await user.save();
  return user;
};

module.exports = mongoose.model('User', UserSchema);
