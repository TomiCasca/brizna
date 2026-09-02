import { CATEGORIES } from '../config/categories.js';
import { getDailyArticles, groupByCategory } from '../services/newsService.js';
import { getInterests, getTheme, setTheme, getSavedArticles, saveArticle, unsaveArticle } from '../services/storageService.js';
import { ArticleCard } from '../components/ArticleCard.js';
import { BottomTabBar } from '../components/BottomTabBar.js';
import { icons } from '../components/icons.js';
import { on } from '../utils/domUtils.js';
import { formatTodayLong } from '../utils/dateUtils.js';

const PREVIEW_COUNT = 3;

function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export async function renderHome(root, { navigate }) {
  const interests = getInterests() ?? [];
  const [articles, savedArticles] = await Promise.all([getDailyArticles(), getSavedArticles()]);
  const savedIds = new Set(savedArticles.map((a) => a.id));
  const grouped = groupByCategory(articles, interests);
  const expanded = new Set();

  function sectionHtml(categoryId) {
    const all = grouped[categoryId] ?? [];
    if (all.length === 0) return '';

    const isExpanded = expanded.has(categoryId);
    const visible = isExpanded ? all : all.slice(0, PREVIEW_COUNT);

    return `
      <div class="category-section">
        <div class="category-title">${categoryLabel(categoryId)}</div>
        <div class="card-list">
          ${visible.map((article) => ArticleCard(article, { saved: savedIds.has(article.id) })).join('')}
        </div>
        ${
          all.length > PREVIEW_COUNT
            ? `<button class="see-more" data-toggle-expand="${categoryId}">
                <span>${isExpanded ? 'Ver menos' : `Ver más de ${categoryLabel(categoryId)}`}</span>
                ${icons.chevronRight}
              </button>`
            : ''
        }
      </div>
    `;
  }

  function template() {
    const theme = getTheme();
    return `
      <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <div class="brand">
            <span class="brand-mark" style="color:var(--accent);">${icons.logoMark}</span>
            <span class="brand-title">Brizna</span>
          </div>
          <div class="page-subtitle">${formatTodayLong()}</div>
        </div>
        <button class="icon-btn" id="theme-quick-toggle" aria-label="Cambiar tema">
          ${theme === 'dark' ? icons.sun : icons.moon}
        </button>
      </div>
      <div style="padding:0 22px;">
        ${
          interests.length === 0
            ? `<div style="text-align:center;color:var(--sub);font-size:13.5px;padding:40px 0;">Todavía no elegiste temas. Andá a Ajustes para sumar alguno.</div>`
            : interests.map(sectionHtml).join('')
        }
      </div>
      ${BottomTabBar('home')}
    `;
  }

  function paint() {
    root.innerHTML = template();
  }

  paint();

  on(root, '[data-toggle-expand]', 'click', (event, btn) => {
    const id = btn.dataset.toggleExpand;
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    paint();
  });

  on(root, '[data-open-article]', 'click', (event, cardEl) => {
    if (event.target.closest('[data-toggle-save]')) return;
    navigate(`/article/${encodeURIComponent(cardEl.dataset.openArticle)}`);
  });

  on(root, '[data-toggle-save]', 'click', async (event, btn) => {
    const id = btn.dataset.toggleSave;
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    if (savedIds.has(id)) {
      savedIds.delete(id);
      await unsaveArticle(id);
    } else {
      savedIds.add(id);
      await saveArticle(article);
    }
    paint();
  });

  on(root, '#theme-quick-toggle', 'click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    paint();
  });

  on(root, '[data-navigate]', 'click', (event, btn) => navigate(`/${btn.dataset.navigate}`));
}
