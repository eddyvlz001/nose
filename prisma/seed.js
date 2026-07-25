require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const projects = [
  { url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=900&auto=format&fit=crop', catEs: 'Closets', catEn: 'Closets', titleEs: 'Closet Moderno', titleEn: 'Modern Closet', cls: 'tall' },
  { url: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=900&auto=format&fit=crop', catEs: 'Cocinas', catEn: 'Kitchens', titleEs: 'Cocina Integral', titleEn: 'Full Kitchen', cls: '' },
  { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop', catEs: 'Closets', catEn: 'Closets', titleEs: 'Walk-in Closet', titleEn: 'Walk-in Closet', cls: '' },
  { url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=900&auto=format&fit=crop', catEs: 'Escaleras', catEn: 'Stairs', titleEs: 'Escalera de Madera', titleEn: 'Wood Staircase', cls: 'wide' },
  { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop', catEs: 'Decks', catEn: 'Decks', titleEs: 'Deck Exterior', titleEn: 'Outdoor Deck', cls: '' },
  { url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&auto=format&fit=crop', catEs: 'Cocinas', catEn: 'Kitchens', titleEs: 'Gabinetes Premium', titleEn: 'Premium Cabinets', cls: '' },
  { url: 'https://images.unsplash.com/photo-1601760562234-9814eea6db90?w=900&auto=format&fit=crop', catEs: 'Decks', catEn: 'Decks', titleEs: 'Terraza Premium', titleEn: 'Premium Terrace', cls: 'tall' },
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop', catEs: 'Escaleras', catEn: 'Stairs', titleEs: 'Escalera Flotante', titleEn: 'Floating Staircase', cls: 'wide' }
];

const heroSlides = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1920&auto=format&fit=crop',
    line1Es: 'Carpintería de', line2Es: "<span class='hl' data-t='Calidad'>Calidad</span>",
    subtitleEs: 'Transformamos madera y diseño en espacios extraordinarios. Proyectos comerciales y residenciales a medida en el sur de Florida.',
    line1En: 'Fine', line2En: "<span class='hl' data-t='Craftsmanship'>Craftsmanship</span>",
    subtitleEn: 'We turn wood and design into extraordinary spaces. Custom commercial and residential projects across South Florida.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=1920&auto=format&fit=crop',
    line1Es: 'Cocinas &amp;', line2Es: "<span class='hl' data-t='Gabinetes'>Gabinetes</span> Premium",
    subtitleEs: 'Diseños funcionales con materiales de primera. Cada gabinete es una obra de arte creada por nuestros artesanos.',
    line1En: 'Kitchens &amp;', line2En: "Premium <span class='hl' data-t='Cabinets'>Cabinets</span>",
    subtitleEn: 'Functional designs with top-quality materials. Every cabinet is a work of art crafted by our artisans.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&auto=format&fit=crop',
    line1Es: 'Decks &amp;', line2Es: "<span class='hl' data-t='Exteriores'>Exteriores</span> Únicos",
    subtitleEs: 'Construimos espacios al aire libre que duran generaciones. Madera tratada y diseño personalizado garantizados.',
    line1En: 'Decks &amp;', line2En: "Unique <span class='hl' data-t='Outdoors'>Outdoor Spaces</span>",
    subtitleEn: 'We build outdoor spaces that last generations. Treated wood and custom design, guaranteed.'
  }
];

const services = [
  {
    icon: 'fas fa-layer-group', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop',
    titleEs: 'Madera & Melamina', descriptionEs: 'Trabajos en madera sólida y melamina con acabados de primera calidad.',
    detailEs: 'Fabricamos muebles y estructuras en madera sólida y melamina de alta densidad, con más de 15 años de experiencia seleccionando materiales que resisten la humedad y el uso diario. Cada corte se hace a medida, con cantos sellados y herrajes de calidad comercial, garantizando piezas duraderas tanto para proyectos residenciales como comerciales.',
    titleEn: 'Wood & Melamine', descriptionEn: 'Solid wood and melamine work with top-quality finishes.',
    detailEn: 'We build furniture and structures in solid wood and high-density melamine, with over 15 years of experience choosing materials that hold up to humidity and daily use. Every cut is made to measure, with sealed edges and commercial-grade hardware, guaranteeing durable pieces for both residential and commercial projects.'
  },
  {
    icon: 'fas fa-door-closed', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
    titleEs: 'Closets Custom', descriptionEs: 'Closets personalizados que maximizan espacio y reflejan tu estilo único.',
    detailEs: 'Diseñamos e instalamos closets a la medida exacta de tu espacio: walk-in closets, closets empotrados y sistemas modulares con organizadores, cajones con cierre suave y buena distribución de zapateras y colgadores. Antes de fabricar, tomamos medidas en sitio y te mostramos un diseño para aprobar acabados y colores.',
    titleEn: 'Custom Closets', descriptionEn: 'Custom closets that maximize space and reflect your unique style.',
    detailEn: 'We design and install closets built to the exact measurements of your space: walk-in closets, built-in closets, and modular systems with organizers, soft-close drawers, and a smart layout for shoe racks and hanging rods. Before building, we take on-site measurements and show you a design to approve finishes and colors.'
  },
  {
    icon: 'fas fa-utensils', imageUrl: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=600&auto=format&fit=crop',
    titleEs: 'Gabinetes de Cocina', descriptionEs: 'Gabinetes para cocina, baño y lavandería con diseños modernos y funcionales.',
    detailEs: 'Construimos gabinetes de cocina, baño y lavandería con módulos superiores e inferiores a medida, tope para encimera, y opciones de acabado en laca, melamina o madera natural. Optimizamos cada centímetro de tu cocina para almacenamiento, con bisagras y correderas de alta durabilidad.',
    titleEn: 'Kitchen Cabinets', descriptionEn: 'Cabinets for kitchen, bathroom and laundry with modern, functional designs.',
    detailEn: 'We build kitchen, bathroom and laundry cabinets with custom upper and lower modules, countertop support, and finish options in lacquer, melamine or natural wood. We optimize every inch of your kitchen for storage, with long-lasting hinges and drawer slides.'
  },
  {
    icon: 'fas fa-stairs', imageUrl: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&auto=format&fit=crop',
    titleEs: 'Escaleras & Barandas', descriptionEs: 'Fabricación e instalación de escaleras y barandas en madera y metal.',
    detailEs: 'Fabricamos escaleras rectas, en L o flotantes, combinando madera con estructuras de metal cuando el diseño lo requiere. Las barandas se hacen a medida en madera torneada o cable de acero, cumpliendo con las alturas de seguridad y complementando el estilo del resto de la casa.',
    titleEn: 'Stairs & Railings', descriptionEn: 'Manufacturing and installation of wood and metal stairs and railings.',
    detailEn: 'We build straight, L-shaped or floating staircases, combining wood with metal structures when the design calls for it. Railings are custom-made in turned wood or steel cable, meeting safety height codes and matching the style of the rest of the house.'
  },
  {
    icon: 'fas fa-door-open', imageUrl: 'https://images.unsplash.com/photo-1601760562234-9814eea6db90?w=600&auto=format&fit=crop',
    titleEs: 'Puertas & Accesos', descriptionEs: 'Puertas de entrada, interiores y sistemas de acceso personalizados.',
    detailEs: 'Instalamos puertas de entrada, interiores y closets — incluyendo puertas de paño macizo, corredizas y plegables — ajustadas al marco existente o construidas a medida. Trabajamos con maderas tratadas para exteriores y opciones con cristal o paneles decorativos.',
    titleEn: 'Doors & Entryways', descriptionEn: 'Entry doors, interior doors and custom access systems.',
    detailEn: 'We install entry, interior and closet doors — including solid-panel, sliding and folding doors — fitted to the existing frame or custom built. We work with treated woods for exteriors and options with glass or decorative panels.'
  },
  {
    icon: 'fas fa-grip-lines', imageUrl: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&auto=format&fit=crop',
    titleEs: 'Molduras & Pisos', descriptionEs: 'Instalación de pisos de madera, laminados y molduras decorativas de lujo.',
    detailEs: 'Instalamos pisos de madera sólida, ingeniería y laminados, junto con molduras de corona, rodapiés y detalles decorativos que le dan un acabado fino a cada ambiente. Nivelamos la superficie antes de instalar para asegurar un resultado parejo y sin ruidos.',
    titleEn: 'Flooring & Trim', descriptionEn: 'Installation of wood, engineered and laminate flooring and decorative luxury trim.',
    detailEn: 'We install solid wood, engineered and laminate flooring, along with crown molding, baseboards and decorative details that give every room a fine finish. We level the surface before installing to ensure an even, noise-free result.'
  },
  {
    icon: 'fas fa-hammer', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop',
    titleEs: 'Construcción de Decks', descriptionEs: 'Decks y terrazas en madera tratada para exteriores de larga duración.',
    detailEs: 'Diseñamos y construimos decks y terrazas exteriores con madera tratada a presión o composite, con estructura elevada sobre bases de concreto cuando el terreno lo requiere. Incluimos barandas, escalones e iluminación empotrada opcional para extender tus espacios al aire libre.',
    titleEn: 'Deck Construction', descriptionEn: 'Long-lasting outdoor decks and terraces in treated wood.',
    detailEn: 'We design and build outdoor decks and terraces in pressure-treated or composite wood, with an elevated structure over concrete footings when the terrain requires it. We include railings, steps and optional recessed lighting to extend your outdoor living space.'
  },
  {
    icon: 'fas fa-paint-roller', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop',
    titleEs: 'Lacado & Tintura', descriptionEs: 'Servicio profesional de lacado, tintura y acabados para gabinetes y muebles.',
    detailEs: 'Renovamos gabinetes y muebles existentes con lijado, tintura y lacado profesional en cabina, logrando un acabado uniforme resistente a manchas y humedad. También aplicamos tintes de color a medida para igualar o cambiar el tono de la madera.',
    titleEn: 'Staining & Finishing', descriptionEn: 'Professional lacquering, staining and finishing service for cabinets and furniture.',
    detailEn: 'We refresh existing cabinets and furniture with sanding, staining and professional booth lacquering, achieving a uniform finish resistant to stains and humidity. We also apply custom color stains to match or change the tone of the wood.'
  },
  {
    icon: 'fas fa-house-crack', imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop',
    titleEs: 'Demolición', descriptionEs: 'Servicio de demolición residencial y comercial con equipo especializado.',
    detailEs: 'Realizamos demolición selectiva de gabinetes, closets, pisos y estructuras de madera antes de una remodelación, con retiro de escombros incluido. Coordinamos el trabajo para dejar el espacio listo para la nueva instalación sin demoras entre etapas.',
    titleEn: 'Demolition', descriptionEn: 'Residential and commercial demolition service with specialized crews.',
    detailEn: 'We perform selective demolition of cabinets, closets, floors and wood structures ahead of a remodel, with debris removal included. We coordinate the work so the space is ready for the new installation with no delay between stages.'
  }
];

const reviews = [
  { name: 'Carlos M.', stars: 5, textEs: 'Excelente trabajo, construyeron los closets de mis dos habitaciones y quedaron perfectos. Muy profesionales y puntuales.', labelEs: 'Cliente Verificado', textEn: 'Excellent work, they built the closets in both of my bedrooms and they turned out perfect. Very professional and punctual.', labelEn: 'Verified Customer' },
  { name: 'Ana García', stars: 5, textEs: 'MRL renovó toda mi cocina. El resultado fue increíble, superaron mis expectativas en calidad y tiempo de entrega.', labelEs: 'Google Review', textEn: 'MRL renovated my entire kitchen. The result was incredible, they exceeded my expectations in quality and delivery time.', labelEn: 'Google Review' },
  { name: 'Roberto P.', stars: 5, textEs: 'Construyeron un deck en mi patio trasero que es simplemente hermoso. Materiales de alta calidad y acabados impecables.', labelEs: 'Cliente Verificado', textEn: 'They built a deck in my backyard that is simply beautiful. High-quality materials and flawless finishes.', labelEn: 'Verified Customer' },
  { name: 'María L.', stars: 5, textEs: 'Las escaleras que fabricaron para mi casa son una obra de arte. Muy detallistas y profesionales en todo momento.', labelEs: 'Google Review', textEn: 'The staircase they built for my house is a work of art. Very detail-oriented and professional throughout.', labelEn: 'Google Review' },
  { name: 'José R.', stars: 5, textEs: 'Muy satisfecho con los gabinetes de baño. Buena comunicación y excelente calidad durante todo el proceso.', labelEs: 'Cliente Verificado', textEn: 'Very satisfied with the bathroom cabinets. Great communication and excellent quality throughout the whole process.', labelEn: 'Verified Customer' }
];

async function main() {
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      await prisma.project.create({
        data: { titleEs: p.titleEs, titleEn: p.titleEn, categoryEs: p.catEs, categoryEn: p.catEn, imageUrl: p.url, cls: p.cls, position: i }
      });
    }
    console.log(`Se sembraron ${projects.length} proyectos.`);
  } else {
    console.log(`La base ya tiene ${projectCount} proyecto(s), no se sembró nada.`);
  }

  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    for (let i = 0; i < heroSlides.length; i++) {
      await prisma.heroSlide.create({ data: { ...heroSlides[i], position: i } });
    }
    console.log(`Se sembraron ${heroSlides.length} slides de hero.`);
  }

  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    for (let i = 0; i < services.length; i++) {
      await prisma.service.create({ data: { ...services[i], position: i } });
    }
    console.log(`Se sembraron ${services.length} servicios.`);
  }

  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    for (let i = 0; i < reviews.length; i++) {
      await prisma.review.create({ data: { ...reviews[i], position: i } });
    }
    console.log(`Se sembraron ${reviews.length} reseñas.`);
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      aboutImg1: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=900&auto=format&fit=crop',
      aboutImg2: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop',
      aboutP1Es: 'En MRL Woodworking Inc. combinamos técnicas de carpintería tradicional con tecnología moderna para entregar proyectos que superan las expectativas. Especializados en proyectos comerciales y residenciales.',
      aboutP2Es: 'Nuestro equipo de artesanos calificados trabaja con los mejores materiales, garantizando durabilidad, estética y funcionalidad en cada proyecto.',
      aboutP1En: 'At MRL Woodworking Inc. we combine traditional carpentry techniques with modern technology to deliver projects that exceed expectations. Specialized in commercial and residential projects.',
      aboutP2En: 'Our team of skilled craftsmen works with the finest materials, guaranteeing durability, aesthetics and functionality in every project.',
      mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114956.89839674267!2d-80.29932748339844!3d25.78234700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b0a20ec8c111%3A0xff96f271ddad4f65!2sMiami%2C+FL!5e0!3m2!1sen!2sus!4v1'
    }
  });
  console.log('Settings listos.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
