function g(id){return document.getElementById(id)}
function pick(obj, base){ return obj[base + (getLang() === 'en' ? 'En' : 'Es')]; }

let SETTINGS = {};
let SLIDES = [];
let SERVICES = [];
let PROJECTS = [];
let REVIEWS = [];

async function fetchJSON(url){
  const r = await fetch(url, {signal: AbortSignal.timeout(15000)});
  if (!r.ok) throw new Error("No se pudo cargar el contenido");
  return r.json();
}

async function loadAll(){
  [SETTINGS, SLIDES, SERVICES, PROJECTS, REVIEWS] = await Promise.all([
    fetchJSON('/api/settings'),
    fetchJSON('/api/hero-slides'),
    fetchJSON('/api/services'),
    fetchJSON('/api/projects'),
    fetchJSON('/api/reviews')
  ]);
}

/* TEXTO ESTÁTICO (menú, títulos, botones) */
function applyStaticI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
}

/* COLORES DE MARCA */
function applyColors(){
  const root = document.documentElement.style;
  if (SETTINGS.colorPrimary) root.setProperty('--blue', SETTINGS.colorPrimary);
  if (SETTINGS.colorSecondary) root.setProperty('--sky', SETTINGS.colorSecondary);
  if (SETTINGS.colorAccent) root.setProperty('--wood', SETTINGS.colorAccent);
  if (SETTINGS.colorDark) root.setProperty('--navy', SETTINGS.colorDark);
}

/* CONTACTO, LOGO, SOCIAL, NOSOTROS */
function applyGeneral(){
  const s = SETTINGS;
  g('tb-ph-v').textContent = s.phone; g('tb-em-v').textContent = s.email;
  g('tb-ad-v').textContent = (s.address || '').split(',').slice(-2).join(',').trim();
  g('cPh').textContent = s.phone; g('cEm').textContent = s.email; g('cAd').textContent = s.address;
  g('cHr').innerHTML = (pick(s, 'hours') || '').replace(/\n/g, '<br>');
  g('ft-ph-v2').textContent = s.phone; g('ft-em-v2').textContent = s.email; g('ft-ad-v2').textContent = s.address;
  if (s.address) g('mapFr').src = 'https://www.google.com/maps?q=' + encodeURIComponent(s.address) + '&output=embed';

  g('ft-wa').href = 'https://wa.me/' + (s.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(t('wa.message'));

  const socialLinks = Array.isArray(s.socialLinks) ? s.socialLinks : [
    {network:'facebook',url:s.fbUrl}, {network:'instagram',url:s.igUrl}, {network:'youtube',url:s.ytUrl}
  ];
  document.querySelectorAll('.tb-soc, .ft-soc, .side-soc').forEach(container => {
    const whatsapp = container.querySelector('#ft-wa');
    Array.from(container.children).forEach(child => { if (child !== whatsapp) child.remove(); });
    socialLinks.forEach(link => {
      const entry = IconCatalog.social.find(item => item[0] === link.network);
      if (!entry) return;
      try { if (!/^https?:$/.test(new URL(link.url).protocol)) return; } catch (_) { return; }
      const anchor = document.createElement('a'); anchor.href = link.url; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
      anchor.title = entry[1]; anchor.setAttribute('aria-label', entry[1]);
      const icon = document.createElement('i'); icon.className = entry[2]; icon.setAttribute('aria-hidden','true'); anchor.append(icon);
      container.insertBefore(anchor, whatsapp);
    });
  });

  const logoImg = g('navLogoImg');
  if (s.logoUrl) {
    logoImg.src = s.logoUrl;
    logoImg.style.display = 'block';
    g('navLogoFb').style.display = 'none';
  } else {
    logoImg.style.display = 'none';
    g('navLogoFb').style.display = 'flex';
  }

  if (s.aboutImg1) g('aImg1').src = s.aboutImg1;
  if (s.aboutImg2) g('aImg2').src = s.aboutImg2;
  g('aYears').textContent = s.aboutYears;
  g('aP1').textContent = pick(s, 'aboutP1');
  g('aP2').textContent = pick(s, 'aboutP2');

  const stats = document.querySelectorAll('.ab-stats .cu');
  if (stats[0]) stats[0].dataset.t = s.statProjects;
  if (stats[1]) stats[1].dataset.t = s.statSatisfaction;
  if (stats[2]) stats[2].dataset.t = s.statYears;
}

/* HERO */
function renderHero(){
  const c = g('heroSlides'); c.innerHTML = '';
  SLIDES.forEach(s => {
    const d = document.createElement('div'); d.className = 'swiper-slide';
    d.innerHTML = `<div class="s-bg" style="background-image:url('${s.imageUrl}')"></div><div class="s-ov"></div><div class="s-ct"><div class="s-txt"><div class="s-badge">MRL Woodworking Inc.</div><div class="s-l1">${pick(s, 'line1')}</div><div class="s-l2">${pick(s, 'line2')}</div><p class="s-sub">${pick(s, 'subtitle')}</p><div class="s-btns"><a href="#services" class="btn-p"><i class="fas fa-tools"></i> ${t('hero.verServicios')}</a><a href="#location" class="btn-o"><i class="fas fa-phone"></i> ${t('nav.cta')}</a></div></div></div>`;
    c.appendChild(d);
  });
  if (window._hs) { window._hs.destroy(true, true); window._hs = null; }
  window._hs = new Swiper('.swiper-hero', {
    loop: SLIDES.length > 1,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: galleryMotion.matches ? false : { delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: true },
    speed: galleryMotion.matches ? 0 : 1100,
    pagination: { el: '.swiper-hero .swiper-pagination', clickable: true },
    on: {
      autoplayTimeLeft(_, __, p) {
        const f = g('hpf');
        if (f) f.style.width = ((1 - p) * 100) + '%';
      }
    }
  });
}

/* SERVICIOS */
function renderServices(){
  const trk = g('svcTrack'); trk.innerHTML = '';
  const all = window.matchMedia('(max-width: 650px)').matches ? SERVICES : [...SERVICES, ...SERVICES];
  all.forEach((s, i) => {
    const title = pick(s, 'title'), desc = pick(s, 'description');
    const c = document.createElement('div'); c.className = 'sc';
    c.innerHTML = `<img src="${s.imageUrl}" alt="${title}" loading="lazy" decoding="async"><div class="sc-ov"></div><div class="sc-num">${String((i % SERVICES.length) + 1).padStart(2, '0')}</div><div class="sc-more"><i class="fas fa-plus"></i></div><div class="sc-body"><div class="sc-icon"><i class="${s.icon}"></i></div><div class="sc-title">${title}</div><p class="sc-desc">${desc}</p></div><div class="sc-line"></div>`;
    c.addEventListener('click', () => openSvcModal(s));
    trk.appendChild(c);
  });
}

function openSvcModal(svc){
  const detail = pick(svc, 'detail');
  g('svmImg').src = svc.imageUrl;
  g('svmIcon').innerHTML = `<i class="${svc.icon}"></i>`;
  g('svmTitle').textContent = pick(svc, 'title');
  g('svmDetail').textContent = (detail && detail.trim()) ? detail : pick(svc, 'description');
  g('svcModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSvcModal(){ g('svcModal').classList.remove('open'); document.body.style.overflow = ''; }
function initSvcModal(){
  g('svmX').addEventListener('click', closeSvcModal);
  g('svcModal').addEventListener('click', e => { if (e.target === g('svcModal')) closeSvcModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSvcModal(); });
}

/* WIDGET DE WHATSAPP (chat con asesor antes de abrir wa.me) */
function initWaWidget(){
  const btn = g('waBtn'), panel = g('waPanel'), closeBtn = g('waPanelX'), sendBtn = g('waSendBtn'), input = g('waMsgInput');
  btn.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));
  document.addEventListener('click', e => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
  function send(){
    const msg = input.value.trim() || t('wa.message');
    const waNumber = (SETTINGS.whatsapp || '').replace(/\D/g, '');
    window.open('https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg), '_blank');
    panel.classList.remove('open');
    input.value = '';
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
}

/* GALERÍA + LIGHTBOX */
let LB_IDX = 0;
let CURRENT_GALLERY_ITEMS = [];
const GALLERY_PAGE_SIZE = 8;
let galleryFilter = '*';
let galleryVisible = GALLERY_PAGE_SIZE;

function openLb(idx){
  LB_IDX = idx;
  showLb();
  g('lb').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function showLb(){
  const item = CURRENT_GALLERY_ITEMS[LB_IDX];
  const img = g('lb-img');
  img.style.animation = 'none';
  img.getBoundingClientRect();
  img.src = item.imageUrl;
  img.style.animation = '';
  g('lbCat').textContent = pick(item, 'category');
  g('lbTtl').textContent = pick(item, 'title');
  g('lbCnt').textContent = `${String(LB_IDX + 1).padStart(2, '0')} / ${String(CURRENT_GALLERY_ITEMS.length).padStart(2, '0')}`;
  const desc = pick(item, 'description');
  const descEl = g('lbDesc');
  descEl.textContent = desc || '';
  descEl.classList.toggle('on', !!(desc && desc.trim()));
}
function closeLb(){ g('lb').classList.remove('open'); document.body.style.overflow = ''; }
function lbNext(){ LB_IDX = (LB_IDX + 1) % CURRENT_GALLERY_ITEMS.length; showLb(); }
function lbPrev(){ LB_IDX = (LB_IDX - 1 + CURRENT_GALLERY_ITEMS.length) % CURRENT_GALLERY_ITEMS.length; showLb(); }

function filteredProjects(){
  if (galleryFilter === '*') return PROJECTS;
  return PROJECTS.filter(p => pick(p, 'category') === galleryFilter);
}

let galleryTimer, galleryPaused = false;
const galleryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let mosaicCursor = 0;
function rotateMosaic() {
  const cards = Array.from(g('galGrid').querySelectorAll('.gi'));
  if (cards.length < 2) return;
  const first = cards[mosaicCursor++ % cards.length];
  const firstImage = first.querySelector('img');
  if (!firstImage?.naturalWidth || first.dataset.changing) return;
  const ratio = firstImage.naturalWidth / firstImage.naturalHeight;
  const second = cards.find(card => {
    const image = card.querySelector('img');
    return card !== first && !card.dataset.changing && image?.naturalWidth && Math.abs(image.naturalWidth / image.naturalHeight - ratio) < 0.08;
  });
  if (!second) return;
  const a = Number(first.dataset.index), b = Number(second.dataset.index);
  replaceMosaicPhoto(first, b); replaceMosaicPhoto(second, a);
}
function replaceMosaicPhoto(card, index) {
  const item = CURRENT_GALLERY_ITEMS[index];
  const image = new Image();
  image.alt = pick(item, 'title') || (getLang() === 'en' ? 'Project' : 'Proyecto');
  card.dataset.changing = 'true';
  image.onload = () => {
    if (!card.isConnected) return;
    const previous = card.querySelector('img');
    previous.classList.add('mosaic-outgoing');
    image.className = 'mosaic-incoming'; card.insertBefore(image, previous);
    card.dataset.index = String(index);
    card.setAttribute('aria-label',(getLang() === 'en' ? 'View: ' : 'Ver: ') + image.alt);
    card.querySelector('.gi-cat').textContent = pick(item, 'category') || '';
    card.querySelector('.gi-t').textContent = image.alt;
    setTimeout(()=>{previous.remove(); image.className = ''; delete card.dataset.changing;}, 1400);
  };
  image.onerror = () => { delete card.dataset.changing; };
  image.src = item.imageUrl;
}
function updateGalleryPlayback() {
  const button = g('galleryPlay'); if (!button) return;
  const paused = galleryPaused || galleryMotion.matches;
  button.textContent = getLang() === 'en' ? (paused ? 'Rotation paused' : 'Pause rotation') : (paused ? 'Rotación pausada' : 'Pausar rotación');
  button.setAttribute('aria-pressed', String(paused));
  button.disabled = galleryMotion.matches || CURRENT_GALLERY_ITEMS.length < 2;
}
function renderGallery(){
  CURRENT_GALLERY_ITEMS = filteredProjects();
  const grid = g('galGrid'); grid.replaceChildren(); grid.scrollLeft = 0;
  CURRENT_GALLERY_ITEMS.slice(0, galleryVisible).forEach((item, i) => {
    const title = pick(item, 'title') || (getLang() === 'en' ? 'Project' : 'Proyecto');
    const card = document.createElement('button'); card.type = 'button'; card.className = 'gi'; card.style.setProperty('--photo-order', Math.min(i, 7));
    card.setAttribute('aria-label', (getLang() === 'en' ? 'View: ' : 'Ver: ') + title);
    const image = document.createElement('img'); image.decoding = 'async'; image.src = item.imageUrl; image.alt = title; image.loading = i < 3 ? 'eager' : 'lazy';
    const overlay = document.createElement('span'); overlay.className = 'gi-ov';
    const category = document.createElement('span'); category.className = 'gi-cat'; category.textContent = pick(item, 'category') || '';
    const heading = document.createElement('span'); heading.className = 'gi-t'; heading.textContent = title;
    overlay.append(category,heading); card.append(image,overlay);
    card.dataset.index = String(i); card.addEventListener('click',()=>openLb(Number(card.dataset.index))); grid.append(card);
  });
  if (!CURRENT_GALLERY_ITEMS.length) { const empty = document.createElement('p'); empty.textContent = getLang() === 'en' ? 'No projects in this category yet.' : 'Todavía no hay proyectos en esta categoría.'; grid.append(empty); }
  g('galMoreBtn').style.display = CURRENT_GALLERY_ITEMS.length > galleryVisible ? 'inline-flex' : 'none';
  updateGalleryPlayback();
}

function renderGalleryFilters(){
  const cont = g('galFilters'); cont.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'gf' + (galleryFilter === '*' ? ' on' : ''); allBtn.dataset.f = '*'; allBtn.textContent = t('gallery.filterAll');
  cont.appendChild(allBtn);
  const cats = [...new Set(PROJECTS.map(p => pick(p, 'category')).filter(Boolean))];
  cats.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'gf' + (galleryFilter === cat ? ' on' : ''); b.dataset.f = cat; b.textContent = cat;
    cont.appendChild(b);
  });
}

/* RESEÑAS */
function renderReviews(){
  const c = g('revSlides'); c.innerHTML = '';
  REVIEWS.forEach(r => {
    const text = pick(r, 'text'), label = pick(r, 'label');
    const s = document.createElement('div'); s.className = 'swiper-slide';
    s.innerHTML = `<div class="rc"><div class="review-quote" aria-hidden="true">“</div><div class="rc-stars">${'<i class="fas fa-star"></i>'.repeat(r.stars)}</div><p class="rc-txt">"${text}"</p><div class="reviewer"><div class="rv-av">${r.name.charAt(0)}</div><div><div class="rv-n">${r.name}</div><div class="rv-l">${label}</div></div></div></div>`;
    c.appendChild(s);
  });
  if (window._rs) window._rs.destroy(true, true);
  window._rs = new Swiper('.swiper-rev', { slidesPerView: 1, spaceBetween: 22, loop: REVIEWS.length > 2, autoplay: galleryMotion.matches ? false : { delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }, pagination: { el: '.swiper-rev .swiper-pagination', clickable: true }, breakpoints: { 700: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } } });
}

function renderCBand(){
  const tags = SERVICES.map(s => pick(s, 'title'));
  const all = [...tags, ...tags, ...tags, ...tags];
  const el = g('cBand'); el.innerHTML = '';
  all.forEach(tag => { const s = document.createElement('span'); s.className = 'ctag'; s.innerHTML = `<i class="fas fa-circle-dot"></i>${tag}`; el.appendChild(s); });
}

/* SCROLL REVEALS */
function initReveal(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.rv').forEach(el => obs.observe(el));
}

/* COUNTERS */
function initCounters(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = '1';
        const tgt = parseInt(e.target.dataset.t) || 0;
        if (galleryMotion.matches) { e.target.textContent = tgt; return; }
        let cur = 0; const step = tgt / 40;
        const iv = setInterval(() => { cur += step; if (cur >= tgt) { cur = tgt; clearInterval(iv); } e.target.textContent = Math.floor(cur); }, 25);
      }
    });
  }, { threshold: .5 });
  document.querySelectorAll('.cu').forEach(el => obs.observe(el));
}

/* NAV */
function initNav(){
  window.addEventListener('scroll', () => g('nav').classList.toggle('scrolled', scrollY > 50));
  g('hbg').addEventListener('click', () => g('mm').classList.add('open'));
  g('mmx').addEventListener('click', () => g('mm').classList.remove('open'));
  document.querySelectorAll('.mml').forEach(a => a.addEventListener('click', () => g('mm').classList.remove('open')));
}

/* LIGHTBOX EVENTS */
function initLb(){
  g('lbX').addEventListener('click', closeLb);
  g('lbP').addEventListener('click', lbPrev);
  g('lbN').addEventListener('click', lbNext);
  g('lb').addEventListener('click', e => { if (e.target === g('lb')) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!g('lb').classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') lbNext();
    if (e.key === 'ArrowLeft') lbPrev();
  });
  let tx = 0;
  g('lb').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  g('lb').addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); } });
}

/* GALLERY FILTER + VER MÁS (delegados, sobreviven a los re-renders de idioma) */
function initGalFilter(){
  const grid = g('galGrid');
  g('galleryPlay').addEventListener('click',()=>{galleryPaused = !galleryPaused; updateGalleryPlayback();});
  galleryMotion.addEventListener('change',updateGalleryPlayback);
  let touching = false;
  grid.addEventListener('pointerdown',()=>{touching=true;});
  window.addEventListener('pointerup',()=>{touching=false;});
  window.addEventListener('pointercancel',()=>{touching=false;});
  clearInterval(galleryTimer);
  galleryTimer = setInterval(()=>{
    const bounds = grid.getBoundingClientRect();
    if (!galleryPaused && !galleryMotion.matches && !document.hidden && !touching && bounds.bottom > 0 && bounds.top < window.innerHeight && !grid.matches(':hover') && !g('gallery').contains(document.activeElement) && !g('lb').classList.contains('open')) rotateMosaic();
  }, 6500);
  g('galFilters').addEventListener('click', e => {
    const btn = e.target.closest('.gf'); if (!btn) return;
    galleryFilter = btn.dataset.f;
    galleryVisible = GALLERY_PAGE_SIZE;
    document.querySelectorAll('.gf').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    renderGallery();
  });
  g('galMoreBtn').addEventListener('click', () => {
    galleryVisible += GALLERY_PAGE_SIZE;
    renderGallery();
  });
}

/* FORMULARIO DE CONTACTO */
function initContactForm(){
  const form = g('contactForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = g('cfSubmit'), msg = g('cfMsg');
    const name = g('cfName').value.trim();
    const email = g('cfEmail').value.trim();
    const phone = g('cfPhone').value.trim();
    const message = g('cfMessage').value.trim();
    const honeypot = g('cfHp').value;

    msg.className = 'cform-msg';
    if (!name || !email || !message) {
      msg.textContent = t('contact.required');
      msg.className = 'cform-msg err';
      return;
    }

    btn.disabled = true;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t('contact.sending')}`;
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message, honeypot })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || t('contact.error'));
      msg.textContent = t('contact.success');
      msg.className = 'cform-msg ok';
      form.reset();
    } catch (err) {
      msg.textContent = err.message || t('contact.error');
      msg.className = 'cform-msg err';
    }
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  });
}

/* SMOOTH SCROLL */
function initScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); } });
  });
}

/* IDIOMA */
function applyLanguageDependent(){
  applyStaticI18n();
  applyColors();
  applyGeneral();
  renderHero();
  renderServices();
  galleryFilter = '*';
  galleryVisible = GALLERY_PAGE_SIZE;
  renderGalleryFilters();
  renderGallery();
  renderReviews();
  renderCBand();
  document.documentElement.lang = getLang() || 'es';
  const code = getLang() === 'en' ? 'ES' : 'EN';
  const tog = g('langTog'); if (tog) tog.textContent = code;
  const togM = g('langTogM'); if (togM) togM.textContent = code;
}
function selectLanguage(lang){
  setLang(lang);
  applyLanguageDependent();
  g('langGate').classList.add('hidden');
}
function initLangSwitcher(){
  g('lgEs').addEventListener('click', () => selectLanguage('es'));
  g('lgEn').addEventListener('click', () => selectLanguage('en'));
  g('langTog').addEventListener('click', () => selectLanguage(getLang() === 'en' ? 'es' : 'en'));
  g('langTogM').addEventListener('click', () => selectLanguage(getLang() === 'en' ? 'es' : 'en'));
}

/* Subtle desktop parallax, scheduled only when scrolling or resizing. */
function initParallax(){
  const hero = g('hero');
  if (!hero) return;
  const enabled = window.matchMedia('(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)');
  let frame = 0;
  function update(){
    frame = 0;
    hero.classList.toggle('has-parallax', enabled.matches);
    if (!enabled.matches) { hero.style.removeProperty('--parallax-y'); return; }
    const rect = hero.getBoundingClientRect();
    const offset = Math.max(0, Math.min(-rect.top, rect.height)) * 0.12;
    hero.style.setProperty('--parallax-y', offset.toFixed(2) + 'px');
  }
  function schedule(){ if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  enabled.addEventListener('change', schedule);
  update();
}

/* INIT */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadAll();
    applyLanguageDependent();
    initReveal();
    initCounters();
    initNav();
    initParallax();
    initLb();
    initSvcModal();
    initWaWidget();
    initGalFilter();
    initScroll();
    initLangSwitcher();
    initContactForm();
  } catch (error) {
    console.error('Site initialization failed:', error);
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    const message = document.createElement('div'); message.className = 'site-load-error'; message.setAttribute('role','alert');
    const english = document.documentElement.lang === 'en';
    message.textContent = english ? 'Some content could not be loaded. ' : 'No se pudo cargar parte del contenido. ';
    const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = english ? 'Try again' : 'Reintentar';
    retry.addEventListener('click', () => location.reload()); message.append(retry); document.body.append(message);
  } finally {
    g('loader')?.classList.add('done');
  }
});
