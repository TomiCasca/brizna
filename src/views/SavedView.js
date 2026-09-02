import { getSavedArticles, unsaveArticle } from '../services/storageService.js';
import { ArticleCard } from '../components/ArticleCard.js';
import { BottomTabBar } from '../components/BottomTabBar.js';
import { on } from '../utils/domUtils.js';

export async function renderSaved(root, { navigate }) {
  let saved = await getSavedArticles();
  saved.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  function template() {
    const noun = saved.length === 1 ? 'artículo guardado' : 'artículos guardados';
    return `
      <div class="page-header">
        <div class="brand-title">Guardadas</div>
        <div class="page-subtitle">${saved.length} ${noun}</div>
      </div>
      <div style="padding:0 22px;">
        ${
          saved.length === 0
            ? `<div style="text-align:center;color:var(--sub);font-size:13.5px;padding:40px 0;">Todavía no guardaste ningún artículo. Tocá el ícono de guardar en cualquier tarjeta.</div>`
            : `<div class="card-list">${saved.map((a) => ArticleCard(a, { saved: true })).join('')}</div>`
        }
      </div>
      ${BottomTabBar('saved')}
    `;
  }

  function paint() {
    root.innerHTML = template();
  }

  paint();

  on(root, '[data-open-article]', 'click', (event, cardEl) => {
    if (event.target.closest('[data-toggle-save]')) return;
    navigate(`/article/${cardEl.dataset.openArticle}`);
  });

  on(root, '[data-toggle-save]', 'click', async (event, btn) => {
    const id = btn.dataset.toggleSave;
    await unsaveArticle(id);
    saved = saved.filter((a) => a.id !== id);
    paint();
  });

  on(root, '[data-navigate]', 'click', (event, btn) => navigate(`/${btn.dataset.navigate}`));
}
