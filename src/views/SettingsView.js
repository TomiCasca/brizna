import { CATEGORIES } from '../config/categories.js';
import { getInterests, setInterests, getTheme, setTheme } from '../services/storageService.js';
import { BottomTabBar } from '../components/BottomTabBar.js';
import { icons } from '../components/icons.js';
import { on } from '../utils/domUtils.js';

export async function renderSettings(root, { navigate }) {
  const selected = new Set(getInterests() ?? []);
  let theme = getTheme();

  function template() {
    return `
      <div class="page-header">
        <div class="brand-title">Ajustes</div>
      </div>
      <div style="padding:0 22px 24px;display:flex;flex-direction:column;gap:28px;">

        <div>
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Tus temas</div>
          <div style="font-size:12.5px;color:var(--sub);margin-bottom:14px;">Tocá para agregar o quitar temas de tu feed diario.</div>
          <div class="chip-group">
            ${CATEGORIES.map(
              (c) =>
                `<button class="chip ${selected.has(c.id) ? 'selected' : ''}" data-category="${c.id}">${c.label}</button>`
            ).join('')}
          </div>
        </div>

        <div>
          <div style="font-size:14px;font-weight:700;margin-bottom:14px;">Apariencia</div>
          <div class="theme-switch">
            <button class="theme-switch-option ${theme === 'light' ? 'active' : ''}" data-theme="light">${icons.sun}<span>Claro</span></button>
            <button class="theme-switch-option ${theme === 'dark' ? 'active' : ''}" data-theme="dark">${icons.moon}<span>Oscuro</span></button>
          </div>
        </div>

        <div style="text-align:center;font-size:11.5px;color:var(--sub);">Brizna · v0.1 · datos guardados solo en este dispositivo</div>
      </div>
      ${BottomTabBar('settings')}
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
    setInterests([...selected]);
    paint();
  });

  on(root, '[data-theme]', 'click', (event, btn) => {
    theme = btn.dataset.theme;
    setTheme(theme);
    document.documentElement.dataset.theme = theme;
    paint();
  });

  on(root, '[data-navigate]', 'click', (event, btn) => navigate(`/${btn.dataset.navigate}`));
}
