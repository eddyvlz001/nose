const nodemailer = require('nodemailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getTransporter(){
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
}

async function send(req, res) {
  const { name, email, phone, message, honeypot } = req.body || {};

  // Campo trampa invisible: si un bot lo rellena, respondemos OK sin enviar nada.
  if (honeypot) return res.json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nombre, correo y mensaje son requeridos' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Correo inválido' });
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error('Formulario de contacto: faltan EMAIL_USER / EMAIL_PASS en .env');
    return res.status(500).json({ error: 'El envío de correo no está configurado en el servidor' });
  }

  const to = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  try {
    await transporter.sendMail({
      from: `"Sitio Web MRL Woodworking" <${process.env.EMAIL_USER}>`,
      to,
      replyTo: email,
      subject: `Nuevo mensaje de ${name} — MRL Woodworking`,
      text: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || '-'}\n\nMensaje:\n${message}`
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('Error enviando correo de contacto:', e.message);
    res.status(500).json({ error: 'No se pudo enviar el mensaje. Intenta de nuevo más tarde.' });
  }
}

module.exports = { send };
