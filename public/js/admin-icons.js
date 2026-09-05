function makeIconPicker(input, entries, selectedByKey = false) {
  const picker = document.createElement('details'); picker.className = 'icon-picker';
  const summary = document.createElement('summary');
  const preview = document.createElement('i'); preview.setAttribute('aria-hidden','true');
  const caption = document.createElement('span'); summary.append(preview, caption);
  const grid = document.createElement('div'); grid.className = 'icon-options';
  const valueOf = entry => entry[selectedByKey ? 0 : 2];
  function refresh() {
    const match = entries.find(entry => valueOf(entry) === input.value);
    preview.className = match ? match[2] : input.value;
    caption.textContent = (match ? match[1] : 'Icono actual') + ' · Cambiar icono';
    grid.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === input.value)));
  }
  entries.forEach(entry => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.value = valueOf(entry);
    const icon = document.createElement('i'); icon.className = entry[2]; icon.setAttribute('aria-hidden','true');
    const name = document.createElement('span'); name.textContent = entry[1]; button.append(icon,name);
    button.addEventListener('click', () => { input.value = valueOf(entry); refresh(); picker.open = false; input.dispatchEvent(new Event('input', {bubbles:true})); summary.focus(); });
    grid.append(button);
  });
  picker.append(summary,grid); refresh(); return picker;
}
function enhanceServiceIcons() {
  document.querySelectorAll('.sv-icon, #svNewIcon').forEach(input => {
    if (input.dataset.iconReady) return;
    input.dataset.iconReady = 'true'; input.type = 'hidden';
    if (!input.value) input.value = 'fas fa-hammer';
    const label = input.closest('.df').querySelector('label'); if (label) label.textContent = 'Icono del servicio';
    input.after(makeIconPicker(input, IconCatalog.services));
  });
}
function addSocialRow(link = {network:'instagram',url:''}) {
  const row = document.createElement('div'); row.className = 'social-editor-row';
  const network = document.createElement('input'); network.type = 'hidden'; network.className = 'social-network'; network.value = link.network;
  const field = document.createElement('label'); field.className = 'social-url-label'; field.textContent = 'Enlace de tu perfil';
  const url = document.createElement('input'); url.type = 'url'; url.className = 'social-url'; url.placeholder = 'https://…'; url.value = link.url; field.append(url);
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'ddel'; remove.textContent = 'Quitar red';
  remove.addEventListener('click', () => { row.remove(); g('saveHint').textContent = 'Tienes cambios de configuración sin guardar.'; });
  row.append(network,makeIconPicker(network,IconCatalog.social,true),field,remove); g('socialRows').append(row);
}
function buildSocialEditor() {
  const links = Array.isArray(SETTINGS.socialLinks) ? SETTINGS.socialLinks : [
    {network:'facebook',url:SETTINGS.fbUrl}, {network:'instagram',url:SETTINGS.igUrl}, {network:'youtube',url:SETTINGS.ytUrl}
  ].filter(link => link.url && link.url !== '#');
  g('socialRows').replaceChildren(); links.forEach(addSocialRow);
  g('addSocialBtn').onclick = () => { addSocialRow(); g('saveHint').textContent = 'Tienes cambios de configuración sin guardar.'; };
}
function readSocialLinks() {
  return Array.from(g('socialRows').children).map(row => {
    const network = row.querySelector('.social-network').value;
    const url = row.querySelector('.social-url').value.trim();
    try { if (!/^https?:$/.test(new URL(url).protocol)) throw new Error(); }
    catch (_) { throw new Error('Completa el enlace de cada red con https:// o quita las filas vacías.'); }
    return {network,url};
  });
}
