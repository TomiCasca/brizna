import { findArticleById } from '../services/newsService.js';
import { isArticleSaved, saveArticle, unsaveArticle } from '../services/storageService.js';
import { getCategoryLabel } from '../config/categories.js';
import { icons } from '../components/icons.js';
import { escapeHtml, on } from '../utils/domUtils.js';
import { formatRelativeDate } from '../utils/dateUtils.js';

export async function renderArticleDetail(root, { navigate, params }) {
  const id = params[0];
  const article = id ? await findArticleById(id) : null;

  if (!article) {
    root.innerHTML = `
      <div style="padding:80px 22px;text-align:center;">
        <div style="font-size:14px;color:var(--sub);margin-bottom:16px;">No encontramos ese artículo.</div>
        <button class="btn-primary" id="back-home-btn" style="max-width:200px;margin:0 auto;">Volver al inicio</button>
      </div>
    `;
    on(root, '#back-home-btn', 'click', () => navigate('/home'));
    return;
  }

  let saved = await isArticleSaved(id);

  function template() {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:52px 20px 12px;">
        <button class="icon-btn" id="back-btn" aria-label="Volver">${icons.back}</button>
        <button class="icon-btn" id="save-btn" style="${saved ? 'color:var(--accent);' : ''}" aria-label="${saved ? 'Quitar de guardadas' : 'Guardar'}">
          ${saved ? icons.bookmarkFilled : icons.bookmark}
        </button>
      </div>

      <div class="article-hero" style="position:relative;overflow:hidden;margin:8px 20px 0;height:190px;border-radius:16px;background:var(--thumb);display:flex;align-items:center;justify-content:center;color:var(--thumb-ink);">
        ${article.type === 'paper' ? icons.paper : icons.image}
        ${
          article.imageUrl
            ? `<img src="${escapeHtml(article.imageUrl)}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.remove()" />`
            : ''
        }
      </div>

      <div style="padding:20px 20px 40px;display:flex;flex-direction:column;gap:14px;">
        ${
          getCategoryLabel(article.category)
            ? `<div style="display:inline-flex;align-self:flex-start;padding:5px 12px;border-radius:999px;background:var(--accent-tint);color:var(--accent);font-size:11.5px;font-weight:600;">
                ${escapeHtml(getCategoryLabel(article.category))}
              </div>`
            : ''
        }
        <div style="font-size:21px;font-weight:700;line-height:1.3;letter-spacing:-0.01em;">${escapeHtml(article.title)}</div>
        <div style="font-size:12.5px;color:var(--sub);">${escapeHtml(article.sourceName)} · ${formatRelativeDate(article.publishedAt)}</div>
        <div style="font-size:14.5px;line-height:1.65;color:var(--text-body);">${escapeHtml(article.summary)}</div>

        <a class="btn-primary" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top:6px;">
          <span>Leer nota completa</span>
          ${icons.externalLink}
        </a>
        <div style="text-align:center;font-size:11.5px;color:var(--sub);">Se abre en el navegador, fuera de la app</div>
      </div>
    `;
  }

  function paint() {
    root.innerHTML = template();
  }

  paint();

  on(root, '#back-btn', 'click', () => {
    if (window.history.length > 1) window.history.back();
    else navigate('/home');
  });

  on(root, '#save-btn', 'click', async () => {
    if (saved) await unsaveArticle(article.id);
    else await saveArticle(article);
    saved = !saved;
    paint();
  });
}
