(function(root){
  const catalog = {
    social: [
      ['facebook','Facebook','fab fa-facebook-f'], ['instagram','Instagram','fab fa-instagram'],
      ['youtube','YouTube','fab fa-youtube'], ['tiktok','TikTok','fab fa-tiktok'],
      ['whatsapp','WhatsApp','fab fa-whatsapp'], ['linkedin','LinkedIn','fab fa-linkedin-in'],
      ['pinterest','Pinterest','fab fa-pinterest-p'], ['x','X / Twitter','fab fa-x-twitter'],
      ['threads','Threads','fab fa-threads'], ['telegram','Telegram','fab fa-telegram'],
      ['yelp','Yelp','fab fa-yelp'], ['website','Sitio web','fas fa-globe']
    ],
    services: [
      ['hammer','Carpintería','fas fa-hammer'], ['tools','Herramientas','fas fa-tools'],
      ['ruler','Medidas','fas fa-ruler-combined'], ['home','Casa','fas fa-house'],
      ['kitchen','Cocina','fas fa-utensils'], ['door','Puertas','fas fa-door-open'],
      ['floor','Pisos','fas fa-layer-group'], ['stairs','Escaleras','fas fa-stairs'],
      ['paint','Pintura','fas fa-paint-roller'], ['couch','Muebles','fas fa-couch'],
      ['chair','Sillas','fas fa-chair'], ['tree','Madera','fas fa-tree'],
      ['building','Comercial','fas fa-building'], ['draft','Diseño','fas fa-drafting-compass'],
      ['screwdriver','Instalación','fas fa-screwdriver-wrench'], ['shelves','Almacenamiento','fas fa-boxes-stacked'],
      ['bath','Baños','fas fa-bath'], ['star','Calidad','fas fa-star']
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  else root.IconCatalog = catalog;
})(typeof window !== 'undefined' ? window : this);
