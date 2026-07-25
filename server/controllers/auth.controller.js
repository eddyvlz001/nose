const { signToken } = require('../lib/auth');

function login(req, res) {
  const { email, password } = req.body || {};

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = signToken({ email });
    return res.json({ token, email });
  }

  return res.status(401).json({ error: 'Credenciales incorrectas' });
}

module.exports = { login };
