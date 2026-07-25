const { signToken } = require('../lib/auth');

function login(req, res) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('Login falló: faltan ADMIN_EMAIL / ADMIN_PASSWORD en las variables de entorno del servidor.');
    return res.status(500).json({ error: 'El servidor no tiene configuradas las credenciales de administrador (ADMIN_EMAIL / ADMIN_PASSWORD)' });
  }
  if (!process.env.JWT_SECRET) {
    console.error('Login falló: falta JWT_SECRET en las variables de entorno del servidor.');
    return res.status(500).json({ error: 'El servidor no tiene configurado JWT_SECRET' });
  }

  const { email, password } = req.body || {};

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  try {
    const token = signToken({ email });
    return res.json({ token, email });
  } catch (e) {
    console.error('Login falló al generar el token:', e.message);
    return res.status(500).json({ error: 'No se pudo generar la sesión (revisa JWT_SECRET)' });
  }
}

module.exports = { login };
