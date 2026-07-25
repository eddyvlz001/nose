const prisma = require('../lib/prisma');

async function list(req, res) {
  const reviews = await prisma.review.findMany({ orderBy: { position: 'asc' } });
  res.json(reviews);
}

async function create(req, res) {
  const { name, stars, textEs, textEn, labelEs, labelEn } = req.body || {};
  if (!name || !textEs || !textEn) {
    return res.status(400).json({ error: 'name, textEs y textEn son requeridos' });
  }

  const last = await prisma.review.findFirst({ orderBy: { position: 'desc' } });
  const position = last ? last.position + 1 : 0;

  const review = await prisma.review.create({
    data: {
      name, stars: stars || 5,
      textEs, textEn,
      labelEs: labelEs || 'Cliente Verificado',
      labelEn: labelEn || 'Verified Customer',
      position
    }
  });
  res.status(201).json(review);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { name, stars, textEs, textEn, labelEs, labelEn, position } = req.body || {};

  const exists = await prisma.review.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Reseña no encontrada' });

  const review = await prisma.review.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(stars !== undefined && { stars }),
      ...(textEs !== undefined && { textEs }),
      ...(textEn !== undefined && { textEn }),
      ...(labelEs !== undefined && { labelEs }),
      ...(labelEn !== undefined && { labelEn }),
      ...(position !== undefined && { position })
    }
  });
  res.json(review);
}

async function remove(req, res) {
  const id = Number(req.params.id);

  const exists = await prisma.review.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Reseña no encontrada' });

  await prisma.review.delete({ where: { id } });
  res.status(204).end();
}

module.exports = { list, create, update, remove };
