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

module.exports = mongoose.model('User', UserSchema);
