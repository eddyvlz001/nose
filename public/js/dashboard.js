/* Dashboard presentation; content continues to use the existing API. */
function activatePanel(name) {
  const panel = g('p-' + name); if (!panel) return;
  document.querySelectorAll('.adm-tab').forEach(tab => {
    const active = tab.dataset.p === name;
    tab.classList.toggle('on', active);
    if (active) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
  });
  document.querySelectorAll('.adm-panel').forEach(p => p.classList.toggle('on', p === panel));
  g('settingsSaveBar').style.display = panel.classList.contains('settings-panel') ? 'flex' : 'none';
  g('adminNav').classList.remove('is-open'); g('menuToggle').setAttribute('aria-expanded', 'false');
  const heading = panel.querySelector('h1, .adm-panel-title');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function renderOverview() {
  const stats = [['hero','Portadas',SLIDES.length,'fa-panorama'],['servicios','Servicios',SERVICES.length,'fa-hammer'],['galeria','Proyectos',PROJECTS.length,'fa-images'],['resenas','Reseñas',REVIEWS.length,'fa-star']];
  g('overviewStats').innerHTML = stats.map(([key,label,count,icon]) => `<button class="stat-card" data-go="${key}"><span class="stat-top"><i class="fas ${icon}"></i><span>↗</span></span><strong>${count}</strong><span>${label}</span></button>`).join('');
  const container = g('recentProjects'); container.replaceChildren();
  if (!PROJECTS.length) { container.innerHTML = '<p class="preview-empty">Tu galería empieza aquí. Sube las fotos de tu primer proyecto.</p>'; return; }
  PROJECTS.slice(0,4).forEach(project => {
    const button = document.createElement('button'); button.className = 'project-preview'; button.dataset.go = 'galeria';
    const img = document.createElement('img'); img.src = project.imageUrl; img.alt = ''; img.loading = 'lazy';
    const title = document.createElement('strong'); title.textContent = project.titleEs || 'Proyecto sin título';
    const category = document.createElement('span'); category.textContent = project.categoryEs || 'Sin categoría';
    button.append(img,title,category); container.append(button);
  });
}

let fieldSequence = 0;
function enhanceEditors() {
  enhanceServiceIcons();
  document.querySelectorAll('#hero-f, #svc-f, #gal-f, #rev-f').forEach(container => {
    if (!container.querySelector('.editor-search')) {
      const label = document.createElement('label'); label.className = 'editor-search'; label.textContent = 'Buscar contenido';
      const input = document.createElement('input'); input.type = 'search'; input.placeholder = 'Escribe un título o nombre…';
      label.append(input); container.prepend(label);
      const empty = document.createElement('p'); empty.className = 'search-empty'; empty.hidden = true; empty.textContent = 'No hay coincidencias. Prueba con otro nombre.'; container.append(empty);
      input.addEventListener('input', () => {
        const query = input.value.toLocaleLowerCase().trim(); let matches = 0;
        container.querySelectorAll('details.content-editor:not(.new-editor)').forEach(editor => {
          editor.hidden = !editor.querySelector('summary').textContent.toLocaleLowerCase().includes(query);
          if (!editor.hidden) matches++;
        });
        empty.hidden = !query || matches > 0;
      });
    }
    container.querySelectorAll(':scope > .card').forEach(card => {
      const details = document.createElement('details'); details.className = 'content-editor';
      const isNew = card.classList.contains('new'); details.classList.toggle('new-editor', isNew);
      const summary = document.createElement('summary');
      const title = card.querySelector('.card-hdr strong, .card-new-hdr');
      const label = document.createElement('span'); label.textContent = title?.textContent.trim() || 'Proyecto sin título';
      const action = document.createElement('span'); action.className = 'editor-action'; action.textContent = isNew ? '＋ Agregar' : 'Editar';
      if (container.id === 'gal-f' && !isNew) {
        const id = Number(card.querySelector('[data-save-proj]')?.dataset.saveProj);
        const project = PROJECTS.find(item => item.id === id);
        if (project) {
          details.classList.add('gallery-editor');
          const image = document.createElement('img');
          image.className = 'gallery-editor-preview'; image.src = project.imageUrl;
          image.alt = project.titleEs || 'Foto del proyecto sin título'; image.loading = 'lazy';
          const info = document.createElement('span'); info.className = 'gallery-editor-info';
          label.textContent = project.titleEs || project.titleEn || 'Sin título';
          const description = document.createElement('span'); description.className = 'gallery-editor-description';
          description.textContent = project.descriptionEs || project.descriptionEn || 'Sin descripción';
          const pending = document.createElement('span'); pending.className = 'gallery-editor-status';
          const missing = [];
          if (!project.titleEs || !project.titleEn) missing.push('título');
          if (!project.descriptionEs || !project.descriptionEn) missing.push('descripción');
          pending.textContent = missing.length ? 'Por completar: ' + missing.join(' y ') + ' (ES / EN)' : 'Título y descripción en ambos idiomas';
          info.append(label, description, pending);
          summary.append(image, info, action);
        } else summary.append(label, action);
      } else summary.append(label, action);
      card.before(details); details.append(summary,card);
    });
  });
  document.querySelectorAll('.df').forEach((field,index) => {
    const label = field.querySelector('label'); const input = field.querySelector('input, textarea, select');
    if (label && input) { if (!input.id) input.id = 'admin-field-' + (++fieldSequence); label.htmlFor = input.id; }
  });
}

function initDashboardTools() {
  document.addEventListener('click', event => {
    const shortcut = event.target.closest('[data-go]');
    if (shortcut) activatePanel(shortcut.dataset.go);
  });
  g('menuToggle').addEventListener('click', () => {
    const open = g('adminNav').classList.toggle('is-open'); g('menuToggle').setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { g('adminNav').classList.remove('is-open'); g('menuToggle').setAttribute('aria-expanded','false'); } });
  document.querySelectorAll('.settings-panel').forEach(panel => panel.addEventListener('input', () => { g('saveHint').textContent = 'Tienes cambios de configuración sin guardar.'; }));
  const observer = new MutationObserver(() => enhanceEditors());
  ['hero-f','svc-f','gal-f','rev-f'].forEach(id => observer.observe(g(id), {childList:true}));
  activatePanel('inicio');
}
