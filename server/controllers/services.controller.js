const prisma = require('../lib/prisma');

async function list(req, res) {
  const services = await prisma.service.findMany({ orderBy: { position: 'asc' } });
  res.json(services);
}

async function create(req, res) {
  const { icon, imageUrl, titleEs, titleEn, descriptionEs, descriptionEn, detailEs, detailEn } = req.body || {};
  if (!imageUrl || !titleEs || !titleEn) {
    return res.status(400).json({ error: 'imageUrl, titleEs y titleEn son requeridos' });
  }

  const last = await prisma.service.findFirst({ orderBy: { position: 'desc' } });
  const position = last ? last.position + 1 : 0;

  const service = await prisma.service.create({
    data: {
      icon: icon || 'fas fa-hammer',
      imageUrl,
      titleEs, titleEn,
      descriptionEs: descriptionEs || '', descriptionEn: descriptionEn || '',
      detailEs: detailEs || '', detailEn: detailEn || '',
      position
    }
  });
  res.status(201).json(service);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { icon, imageUrl, titleEs, titleEn, descriptionEs, descriptionEn, detailEs, detailEn, position } = req.body || {};

  const exists = await prisma.service.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Servicio no encontrado' });

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(icon !== undefined && { icon }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(titleEs !== undefined && { titleEs }),
      ...(titleEn !== undefined && { titleEn }),
      ...(descriptionEs !== undefined && { descriptionEs }),
      ...(descriptionEn !== undefined && { descriptionEn }),
      ...(detailEs !== undefined && { detailEs }),
      ...(detailEn !== undefined && { detailEn }),
      ...(position !== undefined && { position })
    }
  });
  res.json(service);
}

async function remove(req, res) {
  const id = Number(req.params.id);

  const exists = await prisma.service.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Servicio no encontrado' });

  await prisma.service.delete({ where: { id } });
  res.status(204).end();
}

module.exports = { list, create, update, remove };
