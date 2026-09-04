const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    // El token de verificación expira solo a las 12 horas de creado.
    expires: 43200
  }
});

module.exports = mongoose.model('Token', TokenSchema);
