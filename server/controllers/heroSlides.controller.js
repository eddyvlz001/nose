const prisma = require('../lib/prisma');

async function list(req, res) {
  const slides = await prisma.heroSlide.findMany({ orderBy: { position: 'asc' } });
  res.json(slides);
}

async function create(req, res) {
  const { imageUrl, line1Es, line1En, line2Es, line2En, subtitleEs, subtitleEn } = req.body || {};
  if (!imageUrl || !line1Es || !line1En) {
    return res.status(400).json({ error: 'imageUrl, line1Es y line1En son requeridos' });
  }

  const last = await prisma.heroSlide.findFirst({ orderBy: { position: 'desc' } });
  const position = last ? last.position + 1 : 0;

  const slide = await prisma.heroSlide.create({
    data: {
      imageUrl,
      line1Es, line1En,
      line2Es: line2Es || '', line2En: line2En || '',
      subtitleEs: subtitleEs || '', subtitleEn: subtitleEn || '',
      position
    }
  });
  res.status(201).json(slide);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { imageUrl, line1Es, line1En, line2Es, line2En, subtitleEs, subtitleEn, position } = req.body || {};

  const exists = await prisma.heroSlide.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Slide no encontrado' });

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(line1Es !== undefined && { line1Es }),
      ...(line1En !== undefined && { line1En }),
      ...(line2Es !== undefined && { line2Es }),
      ...(line2En !== undefined && { line2En }),
      ...(subtitleEs !== undefined && { subtitleEs }),
      ...(subtitleEn !== undefined && { subtitleEn }),
      ...(position !== undefined && { position })
    }
  });
  res.json(slide);
}

async function remove(req, res) {
  const id = Number(req.params.id);

  const exists = await prisma.heroSlide.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Slide no encontrado' });

  await prisma.heroSlide.delete({ where: { id } });
  res.status(204).end();
}

module.exports = { list, create, update, remove };
