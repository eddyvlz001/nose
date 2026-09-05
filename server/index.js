require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const projectsRoutes = require('./routes/projects.routes');
const settingsRoutes = require('./routes/settings.routes');
const heroSlidesRoutes = require('./routes/heroSlides.routes');
const servicesRoutes = require('./routes/services.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const contactRoutes = require('./routes/contact.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/api', require('./middleware/compressJson'));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/contact', contactRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.use(express.static(path.join(__dirname, '..', 'public')));

// En Vercel, este archivo se importa como función serverless (no debe
// escuchar un puerto). Solo arranca un servidor real cuando se ejecuta
// directamente, ej. `node server/index.js` o `npm run dev` en local.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`MRL Woodworking corriendo en http://localhost:${PORT}`));
}

module.exports = app;
