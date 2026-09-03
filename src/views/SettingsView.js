import { CATEGORIES } from '../config/categories.js';
import {
  getInterests,
  setInterests,
  getTheme,
  setTheme,
  getRss2JsonApiKey,
  setRss2JsonApiKey
} from '../services/storageService.js';
import { getDailyArticles } from '../services/newsService.js';
import { BottomTabBar } from '../components/BottomTabBar.js';
import { icons } from '../components/icons.js';
import { escapeHtml, on } from '../utils/domUtils.js';

export async function renderSettings(root, { navigate }) {
  const selected = new Set(getInterests() ?? []);
  let theme = getTheme();
  let rss2jsonKey = getRss2JsonApiKey();
  let refreshing = false;
  let refreshError = false;

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

        <div>
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Fuentes (opcional)</div>
          <div style="font-size:12.5px;color:var(--sub);margin-bottom:14px;line-height:1.5;">
            Brizna funciona sin esto. Es una API key gratuita (sin tarjeta) que te saca
            del pool anónimo compartido, para que traer tus fuentes y buscar en Google
            Noticias sea más confiable.
          </div>
          <div style="font-size:12px;color:var(--sub);margin-bottom:6px;">
            RSS2JSON (<a href="https://rss2json.com" target="_blank" rel="noopener noreferrer">rss2json.com</a>)
          </div>
          <input
            id="rss2json-key-input"
            type="text"
            placeholder="API key de RSS2JSON"
            value="${escapeHtml(rss2jsonKey)}"
            style="width:100%;padding:12px 14px;border-radius:12px;background:var(--card);border:1.5px solid var(--border);color:var(--text);font-size:13.5px;"
          />
        </div>

        <div>
          <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Contenido</div>
          <div style="font-size:12.5px;color:var(--sub);margin-bottom:14px;line-height:1.5;">
            Brizna busca novedades una vez por día. Si acabás de cambiar algo (temas, API keys)
            y querés verlo reflejado ya, usá este botón en vez de esperar al día siguiente.
          </div>
          <button id="refresh-btn" class="btn-primary" style="background:${refreshing ? 'var(--sub)' : 'var(--accent)'};" ${refreshing ? 'disabled' : ''}>
            ${refreshing ? 'Actualizando…' : 'Actualizar contenido ahora'}
          </button>
          ${
            refreshError
              ? '<div style="font-size:12px;color:#dc2626;margin-top:8px;text-align:center;">No se pudo actualizar. Revisá tu conexión e intentá de nuevo.</div>'
              : ''
          }
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

  on(root, '#rss2json-key-input', 'change', (event, input) => {
    rss2jsonKey = input.value.trim();
    setRss2JsonApiKey(rss2jsonKey);
  });

  on(root, '#refresh-btn', 'click', async () => {
    refreshing = true;
    refreshError = false;
    paint();
    try {
      await getDailyArticles({ force: true });
      navigate('/home');
    } catch {
      refreshing = false;
      refreshError = true;
      paint();
    }
  });

  on(root, '[data-navigate]', 'click', (event, btn) => navigate(`/${btn.dataset.navigate}`));
}
