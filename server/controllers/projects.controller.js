const prisma = require('../lib/prisma');

async function list(req, res) {
  const projects = await prisma.project.findMany({ orderBy: { position: 'asc' } });
  res.json(projects);
}

// Solo la imagen es obligatoria: esto permite subir muchas fotos de una vez
// y llenar título/categoría/descripción después, desde la lista de abajo.
async function create(req, res) {
  const { titleEs, titleEn, categoryEs, categoryEn, descriptionEs, descriptionEn, imageUrl, cls } = req.body || {};
  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl es requerido' });
  }

  const last = await prisma.project.findFirst({ orderBy: { position: 'desc' } });
  const position = last ? last.position + 1 : 0;

  const project = await prisma.project.create({
    data: {
      titleEs: titleEs || '', titleEn: titleEn || '',
      categoryEs: categoryEs || '', categoryEn: categoryEn || '',
      descriptionEs: descriptionEs || '', descriptionEn: descriptionEn || '',
      imageUrl, cls: cls || '', position
    }
  });
  res.status(201).json(project);
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { titleEs, titleEn, categoryEs, categoryEn, descriptionEs, descriptionEn, imageUrl, cls, position } = req.body || {};

  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(titleEs !== undefined && { titleEs }),
      ...(titleEn !== undefined && { titleEn }),
      ...(categoryEs !== undefined && { categoryEs }),
      ...(categoryEn !== undefined && { categoryEn }),
      ...(descriptionEs !== undefined && { descriptionEs }),
      ...(descriptionEn !== undefined && { descriptionEn }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(cls !== undefined && { cls }),
      ...(position !== undefined && { position })
    }
  });
  res.json(project);
}

async function remove(req, res) {
  const id = Number(req.params.id);

  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ error: 'Proyecto no encontrado' });

  await prisma.project.delete({ where: { id } });
  res.status(204).end();
}

module.exports = { list, create, update, remove };
