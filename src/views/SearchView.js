import { searchArticles } from '../services/searchService.js';
import { getSavedArticles, saveArticle, unsaveArticle } from '../services/storageService.js';
import { ArticleCard } from '../components/ArticleCard.js';
import { BottomTabBar } from '../components/BottomTabBar.js';
import { icons } from '../components/icons.js';
import { escapeHtml, on } from '../utils/domUtils.js';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'news', label: 'Noticias' },
  { id: 'paper', label: 'Papers' }
];

export async function renderSearch(root, { navigate }) {
  let query = '';
  let activeFilter = 'all';
  let allResults = []; // último resultado crudo de searchArticles (todos los tipos)
  let lastSearchedQuery = null; // para no repetir la búsqueda en vivo si solo cambia el filtro
  let searchError = null;
  const savedIds = new Set((await getSavedArticles()).map((a) => a.id));
  let debounceTimer = null;

  function visibleResults() {
    return activeFilter === 'all' ? allResults : allResults.filter((a) => a.type === activeFilter);
  }

  function errorBannerHtml() {
    if (!searchError) return '';
    return `<div style="padding:12px 14px;border-radius:12px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;font-size:12.5px;margin-bottom:12px;">La búsqueda en vivo falló: ${escapeHtml(searchError)}</div>`;
  }

  function resultsHtml() {
    if (!query.trim()) {
      return `<div style="text-align:center;color:var(--sub);font-size:13.5px;padding:40px 0;">Buscá por palabra clave, más allá de tus temas elegidos.</div>`;
    }
    const results = visibleResults();
    if (results.length === 0) {
      return `${errorBannerHtml()}<div style="text-align:center;color:var(--sub);font-size:13.5px;padding:40px 0;">Sin resultados para "${escapeHtml(query)}".</div>`;
    }
    return `
      ${errorBannerHtml()}
      <div style="font-size:12px;color:var(--sub);margin-bottom:10px;">${results.length} resultado${results.length === 1 ? '' : 's'}</div>
      <div class="card-list">
        ${results.map((a) => ArticleCard(a, { saved: savedIds.has(a.id) })).join('')}
      </div>
    `;
  }

  function template() {
    return `
      <div class="page-header" style="padding-bottom:14px;">
        <div class="brand-title" style="margin-bottom:14px;">Buscar</div>
        <div class="search-bar">
          ${icons.search}
          <input id="search-input" type="text" placeholder="Inteligencia artificial, economía, tu equipo..." value="${escapeHtml(query)}" />
          ${
            query
              ? `<button id="clear-search" aria-label="Limpiar búsqueda" style="width:20px;height:20px;border-radius:999px;background:var(--sub);color:#fff;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&times;</button>`
              : ''
          }
        </div>
      </div>
      <div style="padding:0 22px 16px;display:flex;gap:8px;">
        ${FILTERS.map(
          (f) => `<button class="filter-chip ${activeFilter === f.id ? 'active' : ''}" data-filter="${f.id}">${f.label}</button>`
        ).join('')}
      </div>
      <div style="padding:0 22px;">${resultsHtml()}</div>
      ${BottomTabBar('search')}
    `;
  }

  function paint({ keepFocus = false } = {}) {
    root.innerHTML = template();
    if (keepFocus) {
      const input = root.querySelector('#search-input');
      input.focus();
      input.setSelectionRange(query.length, query.length);
    }
  }

  paint();

  async function runSearch() {
    const q = query.trim();
    if (!q || q === lastSearchedQuery) return;
    lastSearchedQuery = q;
    const outcome = await searchArticles(q);
    allResults = outcome.results;
    searchError = outcome.searchError;
    paint({ keepFocus: true });
  }

  on(root, '#search-input', 'input', (event, input) => {
    query = input.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 400);
  });

  on(root, '#clear-search', 'click', () => {
    query = '';
    allResults = [];
    lastSearchedQuery = null;
    paint();
  });

  on(root, '[data-filter]', 'click', (event, btn) => {
    activeFilter = btn.dataset.filter;
    paint();
  });

  on(root, '[data-open-article]', 'click', (event, cardEl) => {
    if (event.target.closest('[data-toggle-save]')) return;
    navigate(`/article/${encodeURIComponent(cardEl.dataset.openArticle)}`);
  });

  on(root, '[data-toggle-save]', 'click', async (event, btn) => {
    const id = btn.dataset.toggleSave;
    const article = allResults.find((a) => a.id === id);
    if (!article) return;
    if (savedIds.has(id)) {
      savedIds.delete(id);
      await unsaveArticle(id);
    } else {
      savedIds.add(id);
      await saveArticle(article);
    }
    paint({ keepFocus: document.activeElement?.id === 'search-input' });
  });

  on(root, '[data-navigate]', 'click', (event, btn) => navigate(`/${btn.dataset.navigate}`));
}
