const nodemailer = require('nodemailer');

let transporterPromise;

// Si defines EMAIL_HOST / EMAIL_USER / EMAIL_PASS como variables de
// entorno, usa un SMTP real. Si no, genera una cuenta de prueba de
// Ethereal automáticamente (no manda el correo a nadie de verdad,
// pero te da un link para "verlo" como si hubiera llegado a un inbox).
function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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

  const info = await transporter.sendMail({
    from: '"Proyecto Bicicletas" <no-reply@bicicletas.local>',
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
