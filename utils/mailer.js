const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"Ecommerce Lencería" <${process.env.MAIL_USER}>`,
    to,
    subject: '🎉 Bienvenida a nuestra tienda de lencería',
    html: `
      <h2>Hola ${name}!</h2>
      <p>Gracias por registrarte en nuestra tienda de lencería. 💕</p>
      <p>Esperamos que encuentres lo que buscás 😉</p>
      <p><strong>Equipo Ecommerce Lencería</strong></p>
    `
  });
};

const sendVerificationEmail = async (to, name, code) => {
  await transporter.sendMail({
    from: `"Ecommerce Lencería" <${process.env.MAIL_USER}>`,
    to,
    subject: '🔐 Verificá tu cuenta',
    html: `
      <h2>Hola ${name}!</h2>
      <p>Gracias por registrarte. Para activar tu cuenta, por favor ingresá este código:</p>
      <h3 style="color: #e91e63;">${code}</h3>
      <p>Si no fuiste vos, ignorá este correo.</p>
    `
  });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail
};