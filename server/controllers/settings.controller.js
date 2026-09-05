const prisma = require('../lib/prisma');
const { social } = require('../../public/js/icon-catalog');

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
  if (req.body.socialLinks !== undefined) {
    const links = req.body.socialLinks;
    if (!Array.isArray(links) || links.length > 30 || links.some(link => {
      if (!link || !social.some(entry => entry[0] === link.network) || typeof link.url !== 'string' || link.url.length > 2048) return true;
      try { return !/^https?:$/.test(new URL(link.url).protocol); } catch (_) { return true; }
    })) return res.status(400).json({error:'Revisa las redes sociales y sus enlaces (http o https).'});
    data.socialLinks = links.map(({network,url}) => ({network,url}));
    // Keep the current published version compatible until the next deployment.
    for (const [network,field] of [['facebook','fbUrl'],['instagram','igUrl'],['youtube','ytUrl']]) {
      data[field] = links.find(link => link.network === network)?.url || '#';
    }
  }
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
