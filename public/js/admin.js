function g(id){ return document.getElementById(id) }
function gv(id){ const e = g(id); return e ? e.value.trim() : '' }
function sv(id, v){ const e = g(id); if (e) e.value = v ?? '' }
function esc(str){ return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* AUTH */
function getToken(){ return sessionStorage.getItem('mrl_token') }
function isAuth(){ return !!getToken() }
function authHeaders(json){
  const h = { Authorization: 'Bearer ' + getToken() };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}
async function login(email, password){
  try {
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data.error || `Error del servidor (${r.status})` };
    sessionStorage.setItem('mrl_token', data.token);
    return { ok: true };
  } catch (e) { return { ok: false, error: 'No se pudo conectar con el servidor' }; }
}
function logout(){ sessionStorage.removeItem('mrl_token'); location.reload(); }

let toastTimer; function showToast(){ const t = g('toast'); t.style.display = 'flex'; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.style.display = 'none', 2800); if (typeof renderOverview === 'function') renderOverview(); }

function emptyState(icon, msg){
  return `<div class="empty-state"><i class="fas ${icon}"></i>${msg}</div>`;
}

/* COMPRESIÓN Y SUBIDA DE IMÁGENES */
let IMGS = {};
const IMG_MAX_BYTES = 300 * 1024; // objetivo: que cada imagen pese como máximo ~300KB

function encodeCanvas(cv, quality){
  let out = cv.toDataURL('image/webp', quality);
  if (!out || out.length < 50) out = cv.toDataURL('image/jpeg', quality);
  return out;
}
function dataUrlBytes(dataUrl){ return dataUrl.length * 0.75; }

// Comprime probando calidades cada vez más bajas y, si aun así pesa demasiado,
// reduce el ancho y vuelve a intentar — hasta caber en IMG_MAX_BYTES o llegar
// a un ancho mínimo razonable.
let heicConverterPromise;
function loadHeicConverter(){
  if (typeof window.heic2any === 'function') return Promise.resolve(window.heic2any);
  if (!heicConverterPromise) heicConverterPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/vendor/heic2any-0.0.4.min.js';
    script.onload = () => {
      if (typeof window.heic2any === 'function') resolve(window.heic2any);
      else { script.remove(); heicConverterPromise = null; reject(new Error('No se pudo cargar el conversor HEIC.')); }
    };
    script.onerror = () => { script.remove(); heicConverterPromise = null; reject(new Error('No se pudo cargar el conversor HEIC. Revisa la conexión e intenta otra vez.')); };
    document.head.append(script);
  });
  return heicConverterPromise;
}
async function compress(file, maxWidth){
  if (/\.(heic|heif)$/i.test(file.name || '') || /^image\/hei[cf](?:-sequence)?$/i.test(file.type || '')) {
    const converter = await loadHeicConverter();
    try {
      const converted = await converter({blob:file, toType:'image/jpeg', quality:0.9});
      file = Array.isArray(converted) ? converted[0] : converted;
      if (!file) throw new Error('Empty image');
    } catch (_) { throw new Error('No se pudo convertir esta foto HEIC. Prueba exportarla como JPG desde Fotos.'); }
  }
  return new Promise(res => {
    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = () => {
        let width = maxWidth;
        let best = null;
        while (width >= 480) {
          let w = img.width, h = img.height;
          if (w > width) { h = Math.round(h * width / w); w = width; }
          const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);
          for (let q = 0.75; q >= 0.35; q -= 0.1) {
            const candidate = encodeCanvas(cv, q);
            best = candidate;
            if (dataUrlBytes(candidate) <= IMG_MAX_BYTES) { res(best); return; }
          }
          width = Math.round(width * 0.8);
        }
        res(best);
      };
      img.onerror = () => res(null); img.src = ev.target.result;
    };
    r.onerror = () => res(null); r.readAsDataURL(file);
  });
}
async function handleUpload(input, key, mw){
  const file = input.files[0]; if (!file) return;
  const btn = g('ubtn-' + key), meta = g('umeta-' + key), thumb = g('uthumb-' + key);
  if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  const orig = Math.round(file.size / 1024);
  if (btn) btn.disabled = true;
  if (meta) { meta.className = 'imeta'; meta.textContent = 'Preparando imagen…'; }
  let comp;
  try {
    comp = await compress(file, mw);
    if (!comp) throw new Error('No se pudo leer esta imagen. Prueba con otro archivo.');
  } catch (error) {
    if (meta) meta.textContent = error.message;
    if (btn) btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Subir';
    input.value = ''; return;
  } finally { if (btn) btn.disabled = false; }
  IMGS[key] = comp;
  if (thumb) { thumb.src = comp; thumb.classList.add('on'); }
  const sz = Math.round(dataUrlBytes(comp) / 1024);
  if (meta) { meta.textContent = `${orig}KB→${sz}KB ✓`; meta.className = 'imeta ok'; }
  if (btn) btn.innerHTML = '<i class="fas fa-check"></i> Cambiar';
  input.value = '';
}
function setThumb(key, src){ const t = g('uthumb-' + key); if (t && src) { t.src = src; t.classList.add('on'); } }
function imgField(key, mw){
  return `<div class="irow"><div class="ithumb-b"><i class="fas fa-image"></i><img class="ithumb" id="uthumb-${key}" src="" alt=""></div><div class="icol"><button class="iup" id="ubtn-${key}" type="button" onclick="g('ufile-${key}').click()"><i class="fas fa-cloud-upload-alt"></i> Subir</button><input type="file" id="ufile-${key}" accept="image/*,.heic,.heif" style="display:none" onchange="handleUpload(this,'${key}',${mw})"><span class="imeta" id="umeta-${key}"></span></div></div>`;
}

/* SETTINGS (contacto, colores, logo, nosotros, social) */
let SETTINGS = {};
async function fetchSettings(){ const r = await fetch('/api/settings'); if (!r.ok) throw new Error('No se pudo cargar el contenido. Intenta nuevamente.'); SETTINGS = await r.json(); return SETTINGS; }
function populateSettingsForm(){
  const s = SETTINGS;
  sv('s-phone', s.phone); sv('s-email', s.email); sv('s-address', s.address);
  sv('s-hoursEs', s.hoursEs); sv('s-hoursEn', s.hoursEn);
  sv('s-whatsapp', s.whatsapp);
  sv('s-colorPrimary', s.colorPrimary); sv('s-colorSecondary', s.colorSecondary);
  sv('s-colorAccent', s.colorAccent); sv('s-colorDark', s.colorDark);
  sv('s-aboutYears', s.aboutYears);
  sv('s-aboutP1Es', s.aboutP1Es); sv('s-aboutP1En', s.aboutP1En);
  sv('s-aboutP2Es', s.aboutP2Es); sv('s-aboutP2En', s.aboutP2En);
  sv('s-statProjects', s.statProjects); sv('s-statSatisfaction', s.statSatisfaction); sv('s-statYears', s.statYears);
  buildSocialEditor();

  g('logo-f').innerHTML = imgField('logo', 500); setThumb('logo', s.logoUrl);
  g('aImg1-f').innerHTML = imgField('aI1', 900); setThumb('aI1', s.aboutImg1);
  g('aImg2-f').innerHTML = imgField('aI2', 600); setThumb('aI2', s.aboutImg2);
}
async function saveSettings(){
  let socialLinks;
  try { socialLinks = readSocialLinks(); } catch (error) { alert(error.message); return; }
  const payload = {
    phone: gv('s-phone'), email: gv('s-email'), address: gv('s-address'),
    hoursEs: gv('s-hoursEs'), hoursEn: gv('s-hoursEn'),
    whatsapp: gv('s-whatsapp'),
    colorPrimary: gv('s-colorPrimary'), colorSecondary: gv('s-colorSecondary'),
    colorAccent: gv('s-colorAccent'), colorDark: gv('s-colorDark'),
    aboutYears: parseInt(gv('s-aboutYears')) || 0,
    aboutP1Es: gv('s-aboutP1Es'), aboutP1En: gv('s-aboutP1En'),
    aboutP2Es: gv('s-aboutP2Es'), aboutP2En: gv('s-aboutP2En'),
    statProjects: parseInt(gv('s-statProjects')) || 0,
    statSatisfaction: parseInt(gv('s-statSatisfaction')) || 0,
    statYears: parseInt(gv('s-statYears')) || 0,
    socialLinks
  };
  if (IMGS['logo']) payload.logoUrl = IMGS['logo'];
  if (IMGS['aI1']) payload.aboutImg1 = IMGS['aI1'];
  if (IMGS['aI2']) payload.aboutImg2 = IMGS['aI2'];

  const btn = g('saveSettingsBtn'); btn.disabled = true;
  try {
    const r = await fetch('/api/settings', { method: 'PUT', headers: authHeaders(true), body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('No se pudo guardar la configuración');
    SETTINGS = await r.json();
    delete IMGS['logo']; delete IMGS['aI1']; delete IMGS['aI2'];
    g('saveHint').textContent = 'Configuración guardada y publicada.';
    showToast();
  } catch (e) { alert(e.message); }
  btn.disabled = false;
}

/* HERO SLIDES */
let SLIDES = [];
async function fetchSlides(){ const r = await fetch('/api/hero-slides'); if (!r.ok) throw new Error('No se pudo cargar el contenido. Intenta nuevamente.'); SLIDES = await r.json(); return SLIDES; }
function slideRowHtml(s){
  const key = 'slide' + s.id;
  return `<div class="card">
    <div class="card-hdr"><strong><span class="card-badge">${s.position + 1}</span>${(s.line1Es || 'Slide').replace(/</g, '&lt;')}</strong><button type="button" class="ddel" data-del-slide="${s.id}"><i class="fas fa-trash"></i> Eliminar</button></div>
    ${imgField(key, 1920)}
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Línea 1</label><input type="text" class="sl-l1-es" data-id="${s.id}" value="${esc(s.line1Es)}"></div>
      <div class="df"><label class="en">🇺🇸 Line 1</label><input type="text" class="sl-l1-en" data-id="${s.id}" value="${esc(s.line1En)}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Línea 2 (puede incluir HTML)</label><input type="text" class="sl-l2-es" data-id="${s.id}" value="${esc(s.line2Es)}"></div>
      <div class="df"><label class="en">🇺🇸 Line 2 (can include HTML)</label><input type="text" class="sl-l2-en" data-id="${s.id}" value="${esc(s.line2En)}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Subtítulo</label><textarea class="sl-sub-es" data-id="${s.id}" rows="2">${esc(s.subtitleEs)}</textarea></div>
      <div class="df"><label class="en">🇺🇸 Subtitle</label><textarea class="sl-sub-en" data-id="${s.id}" rows="2">${esc(s.subtitleEn)}</textarea></div>
    </div>
    <button type="button" class="dsave" data-save-slide="${s.id}"><i class="fas fa-save"></i>Guardar slide</button>
  </div>`;
}
function newSlideFormHtml(){
  return `<div class="card new">
    <div class="card-new-hdr"><i class="fas fa-circle-plus"></i>Agregar slide nuevo</div>
    ${imgField('slideNew', 1920)}
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Línea 1</label><input type="text" id="slNewL1Es" placeholder="Ej. Cocinas &amp;"></div>
      <div class="df"><label class="en">🇺🇸 Line 1</label><input type="text" id="slNewL1En" placeholder="E.g. Kitchens &amp;"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Línea 2</label><input type="text" id="slNewL2Es" placeholder="Ej. Gabinetes Premium"></div>
      <div class="df"><label class="en">🇺🇸 Line 2</label><input type="text" id="slNewL2En" placeholder="E.g. Premium Cabinets"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Subtítulo</label><textarea id="slNewSubEs" rows="2"></textarea></div>
      <div class="df"><label class="en">🇺🇸 Subtitle</label><textarea id="slNewSubEn" rows="2"></textarea></div>
    </div>
    <button type="button" class="dsave" id="slAddBtn"><i class="fas fa-plus"></i>Agregar slide</button>
  </div>`;
}
function buildHeroAdmin(){
  const hf = g('hero-f'); if (!hf) return;
  const list = SLIDES.length ? SLIDES.map(slideRowHtml).join('') : emptyState('fa-panorama', 'Aún no hay slides. Agrega el primero arriba.');
  hf.innerHTML = newSlideFormHtml() + list;
  SLIDES.forEach(s => setThumb('slide' + s.id, s.imageUrl));

  hf.querySelectorAll('[data-save-slide]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.saveSlide);
      const key = 'slide' + id;
      const line1Es = hf.querySelector(`.sl-l1-es[data-id="${id}"]`).value.trim();
      const line1En = hf.querySelector(`.sl-l1-en[data-id="${id}"]`).value.trim();
      const line2Es = hf.querySelector(`.sl-l2-es[data-id="${id}"]`).value.trim();
      const line2En = hf.querySelector(`.sl-l2-en[data-id="${id}"]`).value.trim();
      const subtitleEs = hf.querySelector(`.sl-sub-es[data-id="${id}"]`).value.trim();
      const subtitleEn = hf.querySelector(`.sl-sub-en[data-id="${id}"]`).value.trim();
      if (!line1Es || !line1En) { alert('La línea 1 es obligatoria en ambos idiomas'); return; }
      const payload = { line1Es, line1En, line2Es, line2En, subtitleEs, subtitleEn };
      if (IMGS[key]) payload.imageUrl = IMGS[key];
      btn.disabled = true;
      try {
        const r = await fetch('/api/hero-slides/' + id, { method: 'PUT', headers: authHeaders(true), body: JSON.stringify(payload) });
        if (!r.ok) throw new Error((await r.json()).error || 'Error al guardar');
        delete IMGS[key];
        await fetchSlides(); buildHeroAdmin(); showToast();
      } catch (e) { alert(e.message); }
      btn.disabled = false;
    });
  });

  hf.querySelectorAll('[data-del-slide]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.delSlide);
      if (!confirm('¿Eliminar este slide?')) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/hero-slides/' + id, { method: 'DELETE', headers: authHeaders(false) });
        if (!r.ok) throw new Error('Error al eliminar');
        await fetchSlides(); buildHeroAdmin(); showToast();
      } catch (e) { alert(e.message); btn.disabled = false; }
    });
  });

  const addBtn = g('slAddBtn');
  if (addBtn) addBtn.addEventListener('click', async () => {
    const line1Es = g('slNewL1Es').value.trim(), line1En = g('slNewL1En').value.trim();
    const line2Es = g('slNewL2Es').value.trim(), line2En = g('slNewL2En').value.trim();
    const subtitleEs = g('slNewSubEs').value.trim(), subtitleEn = g('slNewSubEn').value.trim();
    const imageUrl = IMGS['slideNew'];
    if (!line1Es || !line1En || !imageUrl) { alert('Línea 1 (en ambos idiomas) e imagen son obligatorias'); return; }
    addBtn.disabled = true;
    try {
      const r = await fetch('/api/hero-slides', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ line1Es, line1En, line2Es, line2En, subtitleEs, subtitleEn, imageUrl }) });
      if (!r.ok) throw new Error((await r.json()).error || 'Error al crear');
      delete IMGS['slideNew'];
      await fetchSlides(); buildHeroAdmin(); showToast();
    } catch (e) { alert(e.message); }
    addBtn.disabled = false;
  });
}

/* SERVICIOS */
let SERVICES = [];
async function fetchServices(){ const r = await fetch('/api/services'); if (!r.ok) throw new Error('No se pudo cargar el contenido. Intenta nuevamente.'); SERVICES = await r.json(); return SERVICES; }
function serviceRowHtml(s){
  const key = 'svc' + s.id;
  return `<div class="card">
    <div class="card-hdr"><strong><span class="card-badge">${s.position + 1}</span>${(s.titleEs || '').replace(/</g, '&lt;')}</strong><button type="button" class="ddel" data-del-svc="${s.id}"><i class="fas fa-trash"></i> Eliminar</button></div>
    ${imgField(key, 600)}
    <div class="df"><label>Ícono (Font Awesome, ej. fas fa-hammer)</label><input type="text" class="sv-icon" data-id="${s.id}" value="${s.icon || ''}"></div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Título</label><input type="text" class="sv-title-es" data-id="${s.id}" value="${esc(s.titleEs)}"></div>
      <div class="df"><label class="en">🇺🇸 Title</label><input type="text" class="sv-title-en" data-id="${s.id}" value="${esc(s.titleEn)}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Descripción corta (tarjeta)</label><textarea class="sv-desc-es" data-id="${s.id}" rows="2">${esc(s.descriptionEs)}</textarea></div>
      <div class="df"><label class="en">🇺🇸 Short description (card)</label><textarea class="sv-desc-en" data-id="${s.id}" rows="2">${esc(s.descriptionEn)}</textarea></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Descripción detallada (modal)</label><textarea class="sv-detail-es" data-id="${s.id}" rows="4">${esc(s.detailEs)}</textarea></div>
      <div class="df"><label class="en">🇺🇸 Detailed description (modal)</label><textarea class="sv-detail-en" data-id="${s.id}" rows="4">${esc(s.detailEn)}</textarea></div>
    </div>
    <button type="button" class="dsave" data-save-svc="${s.id}"><i class="fas fa-save"></i>Guardar servicio</button>
  </div>`;
}
function newServiceFormHtml(){
  return `<div class="card new">
    <div class="card-new-hdr"><i class="fas fa-circle-plus"></i>Agregar servicio nuevo</div>
    ${imgField('svcNew', 600)}
    <div class="df"><label>Ícono (Font Awesome, ej. fas fa-hammer)</label><input type="text" id="svNewIcon" placeholder="fas fa-hammer"></div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Título</label><input type="text" id="svNewTitleEs" placeholder="Ej. Pisos de Madera"></div>
      <div class="df"><label class="en">🇺🇸 Title</label><input type="text" id="svNewTitleEn" placeholder="E.g. Wood Flooring"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Descripción corta</label><textarea id="svNewDescEs" rows="2"></textarea></div>
      <div class="df"><label class="en">🇺🇸 Short description</label><textarea id="svNewDescEn" rows="2"></textarea></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Descripción detallada</label><textarea id="svNewDetailEs" rows="4"></textarea></div>
      <div class="df"><label class="en">🇺🇸 Detailed description</label><textarea id="svNewDetailEn" rows="4"></textarea></div>
    </div>
    <button type="button" class="dsave" id="svAddBtn"><i class="fas fa-plus"></i>Agregar servicio</button>
  </div>`;
}
function buildServicesAdmin(){
  const sf = g('svc-f'); if (!sf) return;
  const list = SERVICES.length ? SERVICES.map(serviceRowHtml).join('') : emptyState('fa-hammer', 'Aún no hay servicios. Agrega el primero arriba.');
  sf.innerHTML = newServiceFormHtml() + list;
  SERVICES.forEach(s => setThumb('svc' + s.id, s.imageUrl));

  sf.querySelectorAll('[data-save-svc]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.saveSvc);
      const key = 'svc' + id;
      const icon = sf.querySelector(`.sv-icon[data-id="${id}"]`).value.trim();
      const titleEs = sf.querySelector(`.sv-title-es[data-id="${id}"]`).value.trim();
      const titleEn = sf.querySelector(`.sv-title-en[data-id="${id}"]`).value.trim();
      const descriptionEs = sf.querySelector(`.sv-desc-es[data-id="${id}"]`).value.trim();
      const descriptionEn = sf.querySelector(`.sv-desc-en[data-id="${id}"]`).value.trim();
      const detailEs = sf.querySelector(`.sv-detail-es[data-id="${id}"]`).value.trim();
      const detailEn = sf.querySelector(`.sv-detail-en[data-id="${id}"]`).value.trim();
      if (!titleEs || !titleEn) { alert('El título es obligatorio en ambos idiomas'); return; }
      const payload = { icon, titleEs, titleEn, descriptionEs, descriptionEn, detailEs, detailEn };
      if (IMGS[key]) payload.imageUrl = IMGS[key];
      btn.disabled = true;
      try {
        const r = await fetch('/api/services/' + id, { method: 'PUT', headers: authHeaders(true), body: JSON.stringify(payload) });
        if (!r.ok) throw new Error((await r.json()).error || 'Error al guardar');
        delete IMGS[key];
        await fetchServices(); buildServicesAdmin(); showToast();
      } catch (e) { alert(e.message); }
      btn.disabled = false;
    });
  });

  sf.querySelectorAll('[data-del-svc]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.delSvc);
      if (!confirm('¿Eliminar este servicio?')) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/services/' + id, { method: 'DELETE', headers: authHeaders(false) });
        if (!r.ok) throw new Error('Error al eliminar');
        await fetchServices(); buildServicesAdmin(); showToast();
      } catch (e) { alert(e.message); btn.disabled = false; }
    });
  });

  const addBtn = g('svAddBtn');
  if (addBtn) addBtn.addEventListener('click', async () => {
    const icon = g('svNewIcon').value.trim() || 'fas fa-hammer';
    const titleEs = g('svNewTitleEs').value.trim(), titleEn = g('svNewTitleEn').value.trim();
    const descriptionEs = g('svNewDescEs').value.trim(), descriptionEn = g('svNewDescEn').value.trim();
    const detailEs = g('svNewDetailEs').value.trim(), detailEn = g('svNewDetailEn').value.trim();
    const imageUrl = IMGS['svcNew'];
    if (!titleEs || !titleEn || !imageUrl) { alert('Título (en ambos idiomas) e imagen son obligatorios'); return; }
    addBtn.disabled = true;
    try {
      const r = await fetch('/api/services', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ icon, titleEs, titleEn, descriptionEs, descriptionEn, detailEs, detailEn, imageUrl }) });
      if (!r.ok) throw new Error((await r.json()).error || 'Error al crear');
      delete IMGS['svcNew'];
      await fetchServices(); buildServicesAdmin(); showToast();
    } catch (e) { alert(e.message); }
    addBtn.disabled = false;
  });
}

/* GALERÍA (PROYECTOS) */
let PROJECTS = [];
async function fetchProjects(){ const r = await fetch('/api/projects'); if (!r.ok) throw new Error('No se pudo cargar el contenido. Intenta nuevamente.'); PROJECTS = await r.json(); return PROJECTS; }
function projectRowHtml(p){
  const key = 'proj' + p.id;
  return `<div class="card">
    <div class="card-hdr"><strong><span class="card-badge">${p.position + 1}</span>${(p.titleEs || '').replace(/</g, '&lt;')}</strong><button type="button" class="ddel" data-del-proj="${p.id}"><i class="fas fa-trash"></i> Eliminar</button></div>
    ${imgField(key, 900)}
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Título</label><input type="text" class="pj-title-es" data-id="${p.id}" value="${esc(p.titleEs)}"></div>
      <div class="df"><label class="en">🇺🇸 Title</label><input type="text" class="pj-title-en" data-id="${p.id}" value="${esc(p.titleEn)}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Categoría</label><input type="text" class="pj-cat-es" data-id="${p.id}" value="${esc(p.categoryEs)}"></div>
      <div class="df"><label class="en">🇺🇸 Category</label><input type="text" class="pj-cat-en" data-id="${p.id}" value="${esc(p.categoryEn)}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Descripción (opcional)</label><textarea class="pj-desc-es" data-id="${p.id}" rows="2">${esc(p.descriptionEs)}</textarea></div>
      <div class="df"><label class="en">🇺🇸 Description (optional)</label><textarea class="pj-desc-en" data-id="${p.id}" rows="2">${esc(p.descriptionEn)}</textarea></div>
    </div>
    <div class="df" style="max-width:220px"><label>Tamaño en galería</label>
      <select class="pj-cls" data-id="${p.id}">
        <option value="" ${!p.cls ? 'selected' : ''}>Normal</option>
        <option value="tall" ${p.cls === 'tall' ? 'selected' : ''}>Alto</option>
        <option value="wide" ${p.cls === 'wide' ? 'selected' : ''}>Ancho</option>
      </select>
    </div>
    <button type="button" class="dsave" data-save-proj="${p.id}"><i class="fas fa-save"></i>Guardar proyecto</button>
  </div>`;
}
function bulkUploadFormHtml(){
  return `<div class="card new">
    <div class="card-new-hdr"><i class="fas fa-circle-plus"></i>Agregar fotos a la galería</div>
    <p style="font-size:12.5px;color:var(--slate);margin:-6px 0 14px">JPG, PNG, WebP y HEIC/HEIF de iPhone. Selecciona una o varias fotos a la vez — se suben y comprimen automáticamente. Luego edita el título, categoría y descripción de cada una en las tarjetas de abajo.</p>
    <button type="button" class="iup" id="pjBulkBtn" onclick="g('pjBulkFile').click()"><i class="fas fa-cloud-upload-alt"></i> Seleccionar fotos</button>
    <input type="file" id="pjBulkFile" accept="image/*,.heic,.heif" multiple style="display:none">
    <div id="pjBulkProgress" style="margin-top:12px;font-size:12.5px;color:var(--slate)"></div>
  </div>`;
}
function buildGalleryAdmin(){
  const gf = g('gal-f'); if (!gf) return;
  const list = PROJECTS.length ? PROJECTS.map(projectRowHtml).join('') : emptyState('fa-images', 'Aún no hay proyectos. Sube tus primeras fotos arriba.');
  gf.innerHTML = bulkUploadFormHtml() + list;
  PROJECTS.forEach(p => setThumb('proj' + p.id, p.imageUrl));

  gf.querySelectorAll('[data-save-proj]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.saveProj);
      const key = 'proj' + id;
      const titleEs = gf.querySelector(`.pj-title-es[data-id="${id}"]`).value.trim();
      const titleEn = gf.querySelector(`.pj-title-en[data-id="${id}"]`).value.trim();
      const categoryEs = gf.querySelector(`.pj-cat-es[data-id="${id}"]`).value.trim();
      const categoryEn = gf.querySelector(`.pj-cat-en[data-id="${id}"]`).value.trim();
      const descriptionEs = gf.querySelector(`.pj-desc-es[data-id="${id}"]`).value.trim();
      const descriptionEn = gf.querySelector(`.pj-desc-en[data-id="${id}"]`).value.trim();
      const cls = gf.querySelector(`.pj-cls[data-id="${id}"]`).value;
      const payload = { titleEs, titleEn, categoryEs, categoryEn, descriptionEs, descriptionEn, cls };
      if (IMGS[key]) payload.imageUrl = IMGS[key];
      btn.disabled = true;
      try {
        const r = await fetch('/api/projects/' + id, { method: 'PUT', headers: authHeaders(true), body: JSON.stringify(payload) });
        if (!r.ok) throw new Error((await r.json()).error || 'Error al guardar');
        delete IMGS[key];
        await fetchProjects(); buildGalleryAdmin(); showToast();
      } catch (e) { alert(e.message); }
      btn.disabled = false;
    });
  });

  gf.querySelectorAll('[data-del-proj]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.delProj);
      if (!confirm('¿Eliminar este proyecto? Esta acción no se puede deshacer.')) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/projects/' + id, { method: 'DELETE', headers: authHeaders(false) });
        if (!r.ok) throw new Error('Error al eliminar');
        await fetchProjects(); buildGalleryAdmin(); showToast();
      } catch (e) { alert(e.message); btn.disabled = false; }
    });
  });

  const bulkInput = g('pjBulkFile');
  if (bulkInput) bulkInput.addEventListener('change', async () => {
    const files = Array.from(bulkInput.files || []);
    if (!files.length) return;
    const progress = g('pjBulkProgress');
    const bulkBtn = g('pjBulkBtn');
    bulkBtn.disabled = true;
    let done = 0, uploaded = 0;
    const failed = [];
    for (const file of files) {
      progress.textContent = `Preparando y subiendo ${done + 1} de ${files.length}: ${file.name}`;
      try {
        const imageUrl = await compress(file, 900);
        if (!imageUrl) throw new Error('No se pudo leer la imagen');
        const response = await fetch('/api/projects', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ imageUrl }) });
        if (!response.ok) throw new Error('No se pudo guardar la foto');
        uploaded++;
      } catch (error) { failed.push(file.name + ': ' + error.message); }
      done++;
    }
    try {
      await fetchProjects(); buildGalleryAdmin();
      g('pjBulkProgress').textContent = `${uploaded} de ${files.length} fotos subidas.` + (failed.length ? ' No se subieron: ' + failed.join('; ') : '');
      if (uploaded && !failed.length) showToast();
    } catch (_) { progress.textContent = `${uploaded} fotos guardadas. No se pudo actualizar la lista; recarga el panel para verlas.`; }
    finally { bulkBtn.disabled = false; bulkInput.value = ''; }
  });
}

/* RESEÑAS */
let REVIEWS = [];
async function fetchReviews(){ const r = await fetch('/api/reviews'); if (!r.ok) throw new Error('No se pudo cargar el contenido. Intenta nuevamente.'); REVIEWS = await r.json(); return REVIEWS; }
function reviewRowHtml(rv){
  return `<div class="card">
    <div class="card-hdr"><strong><span class="card-badge">${rv.position + 1}</span>${(rv.name || '').replace(/</g, '&lt;')}</strong><button type="button" class="ddel" data-del-rev="${rv.id}"><i class="fas fa-trash"></i> Eliminar</button></div>
    <div class="grid2">
      <div class="df"><label>Nombre</label><input type="text" class="rv-name" data-id="${rv.id}" value="${esc(rv.name)}"></div>
      <div class="df"><label>Estrellas (1-5)</label><input type="number" min="1" max="5" class="rv-stars" data-id="${rv.id}" value="${rv.stars}"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Texto</label><textarea class="rv-text-es" data-id="${rv.id}" rows="3">${esc(rv.textEs)}</textarea></div>
      <div class="df"><label class="en">🇺🇸 Text</label><textarea class="rv-text-en" data-id="${rv.id}" rows="3">${esc(rv.textEn)}</textarea></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Etiqueta</label><input type="text" class="rv-label-es" data-id="${rv.id}" value="${esc(rv.labelEs)}"></div>
      <div class="df"><label class="en">🇺🇸 Label</label><input type="text" class="rv-label-en" data-id="${rv.id}" value="${esc(rv.labelEn)}"></div>
    </div>
    <button type="button" class="dsave" data-save-rev="${rv.id}"><i class="fas fa-save"></i>Guardar reseña</button>
  </div>`;
}
function newReviewFormHtml(){
  return `<div class="card new">
    <div class="card-new-hdr"><i class="fas fa-circle-plus"></i>Agregar reseña nueva</div>
    <div class="grid2">
      <div class="df"><label>Nombre</label><input type="text" id="rvNewName" placeholder="Ej. Juan Pérez"></div>
      <div class="df"><label>Estrellas (1-5)</label><input type="number" min="1" max="5" id="rvNewStars" value="5"></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Texto</label><textarea id="rvNewTextEs" rows="3" placeholder="Comentario del cliente"></textarea></div>
      <div class="df"><label class="en">🇺🇸 Text</label><textarea id="rvNewTextEn" rows="3" placeholder="Customer's comment"></textarea></div>
    </div>
    <div class="fp">
      <div class="df"><label class="es">🇪🇸 Etiqueta</label><input type="text" id="rvNewLabelEs" placeholder="Cliente Verificado"></div>
      <div class="df"><label class="en">🇺🇸 Label</label><input type="text" id="rvNewLabelEn" placeholder="Verified Customer"></div>
    </div>
    <button type="button" class="dsave" id="rvAddBtn"><i class="fas fa-plus"></i>Agregar reseña</button>
  </div>`;
}
function buildReviewsAdmin(){
  const rf = g('rev-f'); if (!rf) return;
  const list = REVIEWS.length ? REVIEWS.map(reviewRowHtml).join('') : emptyState('fa-star', 'Aún no hay reseñas. Agrega la primera arriba.');
  rf.innerHTML = newReviewFormHtml() + list;

  rf.querySelectorAll('[data-save-rev]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.saveRev);
      const name = rf.querySelector(`.rv-name[data-id="${id}"]`).value.trim();
      const stars = parseInt(rf.querySelector(`.rv-stars[data-id="${id}"]`).value) || 5;
      const textEs = rf.querySelector(`.rv-text-es[data-id="${id}"]`).value.trim();
      const textEn = rf.querySelector(`.rv-text-en[data-id="${id}"]`).value.trim();
      const labelEs = rf.querySelector(`.rv-label-es[data-id="${id}"]`).value.trim();
      const labelEn = rf.querySelector(`.rv-label-en[data-id="${id}"]`).value.trim();
      if (!name || !textEs || !textEn) { alert('Nombre y texto (en ambos idiomas) son obligatorios'); return; }
      btn.disabled = true;
      try {
        const r = await fetch('/api/reviews/' + id, { method: 'PUT', headers: authHeaders(true), body: JSON.stringify({ name, stars, textEs, textEn, labelEs, labelEn }) });
        if (!r.ok) throw new Error((await r.json()).error || 'Error al guardar');
        await fetchReviews(); buildReviewsAdmin(); showToast();
      } catch (e) { alert(e.message); }
      btn.disabled = false;
    });
  });

  rf.querySelectorAll('[data-del-rev]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.delRev);
      if (!confirm('¿Eliminar esta reseña?')) return;
      btn.disabled = true;
      try {
        const r = await fetch('/api/reviews/' + id, { method: 'DELETE', headers: authHeaders(false) });
        if (!r.ok) throw new Error('Error al eliminar');
        await fetchReviews(); buildReviewsAdmin(); showToast();
      } catch (e) { alert(e.message); btn.disabled = false; }
    });
  });

  const addBtn = g('rvAddBtn');
  if (addBtn) addBtn.addEventListener('click', async () => {
    const name = g('rvNewName').value.trim();
    const stars = parseInt(g('rvNewStars').value) || 5;
    const textEs = g('rvNewTextEs').value.trim(), textEn = g('rvNewTextEn').value.trim();
    const labelEs = g('rvNewLabelEs').value.trim() || 'Cliente Verificado';
    const labelEn = g('rvNewLabelEn').value.trim() || 'Verified Customer';
    if (!name || !textEs || !textEn) { alert('Nombre y texto (en ambos idiomas) son obligatorios'); return; }
    addBtn.disabled = true;
    try {
      const r = await fetch('/api/reviews', { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ name, stars, textEs, textEn, labelEs, labelEn }) });
      if (!r.ok) throw new Error((await r.json()).error || 'Error al crear');
      await fetchReviews(); buildReviewsAdmin(); showToast();
    } catch (e) { alert(e.message); }
    addBtn.disabled = false;
  });
}

/* TABS */
function initTabs(){
  document.querySelectorAll('.adm-tab').forEach(tab => tab.addEventListener('click', () => activatePanel(tab.dataset.p)));
}

/* LOGIN / DASHBOARD SWITCH */
async function tryLogin(){
  const email = g('lEm').value.trim(), password = g('lPw').value, err = g('lErr'), btn = g('lBtn');
  btn.disabled = true;
  const result = await login(email, password);
  btn.disabled = false;
  if (result.ok) { showDashboard(); }
  else {
    err.textContent = result.error;
    err.style.display = 'block';
    g('lPw').value = '';
    setTimeout(() => err.style.display = 'none', 6000);
  }
}

let dashboardBound = false;
async function initDashboard(){
  if (!dashboardBound) {
    initTabs(); initDashboardTools();
    g('saveSettingsBtn').addEventListener('click', saveSettings);
    g('dLogout').addEventListener('click', logout);
    dashboardBound = true;
  }
  const status = g('loadStatus'); status.hidden = false; status.textContent = 'Cargando el contenido de tu sitio…';
  try {
    await Promise.all([fetchSettings(), fetchSlides(), fetchServices(), fetchProjects(), fetchReviews()]);
    populateSettingsForm(); buildHeroAdmin(); buildServicesAdmin(); buildGalleryAdmin(); buildReviewsAdmin();
    enhanceEditors(); renderOverview(); status.hidden = true;
  } catch (error) {
    status.textContent = error.message + ' ';
    const retry = document.createElement('button'); retry.textContent = 'Reintentar'; retry.className = 'text-button'; retry.onclick = initDashboard; status.append(retry);
  }
}

function showDashboard(){
  g('loginView').style.display = 'none';
  g('dashView').style.display = 'block';
  initDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
  if (isAuth()) { showDashboard(); }
  g('lBtn').addEventListener('click', tryLogin);
  g('lPw').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
});
