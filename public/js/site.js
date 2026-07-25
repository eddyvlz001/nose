function g(id){return document.getElementById(id)}
function pick(obj, base){ return obj[base + (getLang() === 'en' ? 'En' : 'Es')]; }

let SETTINGS = {};
let SLIDES = [];
let SERVICES = [];
let PROJECTS = [];
let REVIEWS = [];

async function fetchJSON(url){
  const r = await fetch(url);
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

  const wa = 'https://wa.me/' + s.whatsapp + '?text=' + encodeURIComponent(t('wa.message'));
  g('waBtn').href = wa; g('ft-wa').href = wa;

  const social = { fb: s.fbUrl, ig: s.igUrl, yt: s.ytUrl };
  Object.keys(social).forEach(k => {
    const u = social[k] || '#';
    const tb = g('tb-' + k), ft = g('ft-' + k);
    if (tb) tb.href = u;
    if (ft) ft.href = u;
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
    effect: 'creative',
    creativeEffect: {
      prev: { shadow: true, translate: [0, 0, -600], opacity: 0 },
      next: { translate: ['100%', 0, 0] }
    },
    autoplay: { delay: 5500, disableOnInteraction: false },
    speed: 1100,
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
  const all = [...SERVICES, ...SERVICES];
  all.forEach((s, i) => {
    const title = pick(s, 'title'), desc = pick(s, 'description');
    const c = document.createElement('div'); c.className = 'sc';
    c.innerHTML = `<img src="${s.imageUrl}" alt="${title}" loading="lazy"><div class="sc-ov"></div><div class="sc-num">${String((i % SERVICES.length) + 1).padStart(2, '0')}</div><div class="sc-more"><i class="fas fa-plus"></i></div><div class="sc-body"><div class="sc-icon"><i class="${s.icon}"></i></div><div class="sc-title">${title}</div><p class="sc-desc">${desc}</p></div><div class="sc-line"></div>`;
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

function renderGallery(){
  const all = filteredProjects();
  CURRENT_GALLERY_ITEMS = all.slice(0, galleryVisible);
  const grid = g('galGrid'); grid.innerHTML = '';
  CURRENT_GALLERY_ITEMS.forEach((item, i) => {
    const title = pick(item, 'title'), cat = pick(item, 'category');
    const div = document.createElement('div');
    div.className = 'gi ' + (item.cls || '');
    div.innerHTML = `<img src="${item.imageUrl}" alt="${title}" loading="lazy"><div class="gi-ov"><div class="gi-cat">${cat}</div><div class="gi-t">${title}</div></div><div class="gi-plus"><i class="fas fa-expand"></i></div>`;
    div.addEventListener('click', () => openLb(i));
    grid.appendChild(div);
  });
  const moreBtn = g('galMoreBtn');
  if (moreBtn) moreBtn.style.display = all.length > galleryVisible ? 'inline-flex' : 'none';
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
    s.innerHTML = `<div class="rc"><div class="gg"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><div class="rc-stars">${'<i class="fas fa-star"></i>'.repeat(r.stars)}</div><p class="rc-txt">"${text}"</p><div class="reviewer"><div class="rv-av">${r.name.charAt(0)}</div><div><div class="rv-n">${r.name}</div><div class="rv-l">${label}</div></div></div></div>`;
    c.appendChild(s);
  });
  if (window._rs) window._rs.destroy(true, true);
  window._rs = new Swiper('.swiper-rev', { slidesPerView: 1, spaceBetween: 22, loop: REVIEWS.length > 2, autoplay: { delay: 4500, disableOnInteraction: false }, pagination: { el: '.swiper-rev .swiper-pagination', clickable: true }, breakpoints: { 700: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } } });
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
        let cur = 0; const step = tgt / 60;
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

/* CURSOR */
function initCursor(){
  const c = g('cur'), c2 = g('cur2');
  document.addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; setTimeout(() => { c2.style.left = e.clientX + 'px'; c2.style.top = e.clientY + 'px'; }, 60); });
  document.querySelectorAll('a,button,.sc,.gi').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('on-link'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('on-link'));
  });
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

/* INIT */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAll();
  applyLanguageDependent();
  initReveal();
  initCounters();
  initNav();
  initCursor();
  initLb();
  initSvcModal();
  initGalFilter();
  initScroll();
  initLangSwitcher();
  initContactForm();
  setTimeout(() => g('loader').classList.add('done'), 1600);
});
