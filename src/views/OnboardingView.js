import { CATEGORIES } from '../config/categories.js';
import { setInterests } from '../services/storageService.js';
import { icons } from '../components/icons.js';
import { on } from '../utils/domUtils.js';

export async function renderOnboarding(root, { navigate }) {
  const selected = new Set();

  function continueLabel() {
    if (selected.size === 0) return 'Continuar';
    const noun = selected.size === 1 ? 'seleccionado' : 'seleccionados';
    return `Continuar (${selected.size} ${noun})`;
  }

  function template() {
    return `
      <div class="page-header">
        <div class="icon-btn" style="background:var(--accent);color:#fff;border:none;margin-bottom:14px;">${icons.logoMark}</div>
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;">¿Qué te interesa leer?</div>
        <div style="font-size:14px;color:var(--sub);line-height:1.5;margin-top:6px;">
          Elegí tus temas. Todos los días vas a encontrar novedades sobre ellos, sin tener que buscarlas.
        </div>
      </div>
      <div style="padding:0 22px;">
        <div class="chip-group">
          ${CATEGORIES.map(
            (c) =>
              `<button class="chip ${selected.has(c.id) ? 'selected' : ''}" data-category="${c.id}">${c.label}</button>`
          ).join('')}
        </div>
      </div>
      <div style="position:fixed;left:0;right:0;bottom:0;max-width:480px;margin:0 auto;padding:16px 22px 28px;border-top:1px solid var(--border);background:var(--bg);">
        <button class="btn-primary" id="continue-btn" ${selected.size === 0 ? 'disabled' : ''}>${continueLabel()}</button>
      </div>
    `;
  }

  function paint() {
    root.innerHTML = template();
  }

  paint();

  on(root, '[data-category]', 'click', (event, chipEl) => {
    const id = chipEl.dataset.category;
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    paint();
  });

  on(root, '#continue-btn', 'click', () => {
    if (selected.size === 0) return;
    setInterests([...selected]);
    navigate('/home');
  });
}
