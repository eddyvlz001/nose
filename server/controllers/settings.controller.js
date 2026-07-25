const prisma = require('../lib/prisma');

const DEFAULTS = { id: 1 };

async function get(req, res) {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: DEFAULTS
  });
  res.json(settings);
}

const EDITABLE_FIELDS = [
  'phone', 'email', 'address', 'hoursEs', 'hoursEn', 'whatsapp', 'mapUrl',
  'fbUrl', 'igUrl', 'ytUrl', 'logoUrl',
  'colorPrimary', 'colorSecondary', 'colorAccent', 'colorDark',
  'aboutYears', 'aboutImg1', 'aboutImg2', 'aboutP1Es', 'aboutP1En', 'aboutP2Es', 'aboutP2En',
  'statProjects', 'statSatisfaction', 'statYears'
];

async function update(req, res) {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { ...DEFAULTS, ...data }
  });
  res.json(settings);
}

module.exports = { get, update };
