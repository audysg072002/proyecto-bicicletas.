const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const passport = require('../config/passport');
const User = require('../models/user');
const Token = require('../models/token');
const { sendMail } = require('../config/mailer');

function baseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

// --- LOGIN ---

router.get('/login', function (req, res) {
  res.render('auth/login', {
    title: 'Iniciar sesión',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/mapa',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// --- REGISTRO ---

router.get('/register', function (req, res) {
  res.render('auth/register', {
    title: 'Crear cuenta',
    error: req.flash('error')
  });
});

router.post('/register', async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const nuevoUsuario = new User({ email });
    await User.register(nuevoUsuario, password);

    // Genera un token de verificación y lo guarda asociado al usuario.
    const token = crypto.randomBytes(20).toString('hex');
    await Token.create({ _userId: nuevoUsuario._id, token });

    const verifyUrl = `${baseUrl(req)}/verify/${token}`;
    await sendMail({
      to: nuevoUsuario.email,
      subject: 'Bienvenido a Proyecto Bicicletas — verifica tu cuenta',
      html: `
        <h2>¡Bienvenido, ${nuevoUsuario.email}!</h2>
        <p>Gracias por registrarte. Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      `
    });

    req.flash('success', 'Cuenta creada. Revisa tu correo (o la consola del servidor) para verificarla.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/register');
  }
});

// --- VERIFICACIÓN DE CUENTA ---

router.get('/verify/:token', async function (req, res) {
  try {
    const tokenDoc = await Token.findOne({ token: req.params.token });
    if (!tokenDoc) {
      req.flash('error', 'El link de verificación no es válido o ya expiró.');
      return res.redirect('/login');
    }

    await User.findByIdAndUpdate(tokenDoc._userId, { verificado: true });
    await Token.deleteOne({ _id: tokenDoc._id });

    req.flash('success', 'Cuenta verificada correctamente. Ya puedes iniciar sesión.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Ocurrió un error verificando la cuenta.');
    res.redirect('/login');
  }
});

// --- RECUPERAR CONTRASEÑA ---

router.get('/forgot-password', function (req, res) {
  res.render('auth/forgot-password', {
    title: 'Recuperar contraseña',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

router.post('/forgot-password', async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // No revelamos si el email existe o no, por seguridad.
    if (user) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetTokenExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetUrl = `${baseUrl(req)}/reset-password/${resetToken}`;
      await sendMail({
        to: user.email,
        subject: 'Recupera tu contraseña — Proyecto Bicicletas',
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Haz clic en el siguiente enlace para elegir una contraseña nueva (válido 1 hora):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        `
      });
    }

    req.flash('success', 'Si ese correo existe, te enviamos un link para recuperar tu contraseña.');
    res.redirect('/forgot-password');
  } catch (err) {
    req.flash('error', 'Ocurrió un error. Intenta de nuevo.');
    res.redirect('/forgot-password');
  }
});

router.get('/reset-password/:token', async function (req, res) {
  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'El link para recuperar tu contraseña no es válido o ya expiró.');
    return res.redirect('/forgot-password');
  }

  res.render('auth/reset-password', {
    title: 'Elegir nueva contraseña',
    token: req.params.token,
    error: req.flash('error')
  });
});

router.post('/reset-password/:token', async function (req, res) {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash('error', 'El link para recuperar tu contraseña no es válido o ya expiró.');
      return res.redirect('/forgot-password');
    }

    await user.setPassword(req.body.password);
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    req.flash('success', 'Contraseña actualizada. Ya puedes iniciar sesión.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Ocurrió un error actualizando la contraseña.');
    res.redirect('/forgot-password');
  }
});

module.exports = router;
