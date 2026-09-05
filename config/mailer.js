const nodemailer = require('nodemailer');

let transporterPromise;

// - En producción (NODE_ENV=production): usa un SMTP real, configurado
//   con EMAIL_HOST/EMAIL_USER/EMAIL_PASS. En esta entrega se usa Gmail
//   (smtp.gmail.com) con una "contraseña de aplicación", pero funciona
//   igual con cualquier otro SMTP (Brevo, SendGrid, etc.) solo cambiando
//   esas variables.
// - En cualquier otro caso (local, test): genera una cuenta de prueba de
//   Ethereal automáticamente — no manda el correo a nadie de verdad, pero
//   da un link para "verlo" como si hubiera llegado a un inbox.
function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
    );
  } else {
    transporterPromise = nodemailer.createTestAccount().then((testAccount) =>
      nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })
    );
  }

  return transporterPromise;
}

async function sendMail({ to, subject, html }) {
  const transporter = await getTransporter();

  // En producción, este remitente debe ser la misma cuenta que autenticas
  // en EMAIL_USER (Gmail exige que "from" y la cuenta que envía coincidan).
  // En local (Ethereal) no importa cuál sea.
  const from = process.env.EMAIL_FROM || '"Proyecto Bicicletas" <no-reply@bicicletas.local>';

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('\n📧 Correo enviado (vista previa Ethereal):');
    console.log(previewUrl, '\n');
  }

  return info;
}

module.exports = { sendMail };
