import { icons } from './icons.js';
import { escapeHtml } from '../utils/domUtils.js';
import { formatRelativeDate } from '../utils/dateUtils.js';

export function ArticleCard(article, { saved = false } = {}) {
  return `
    <div class="article-card" role="button" data-open-article="${escapeHtml(article.id)}">
      <div class="article-thumb">
        ${article.type === 'paper' ? icons.paper : icons.image}
        ${article.imageUrl ? `<img src="${escapeHtml(article.imageUrl)}" alt="" loading="lazy" onerror="this.remove()" />` : ''}
      </div>
      <div class="article-body">
        <div class="article-title clamp-2">${escapeHtml(article.title)}</div>
        ${article.summary ? `<div class="article-summary clamp-2">${escapeHtml(article.summary)}</div>` : ''}
        <div class="article-meta">
          <span class="article-meta-text">${escapeHtml(article.sourceName)} · ${formatRelativeDate(article.publishedAt)}</span>
          <button
            class="save-toggle ${saved ? 'saved' : ''}"
            data-toggle-save="${escapeHtml(article.id)}"
            aria-label="${saved ? 'Quitar de guardadas' : 'Guardar'}"
          >${saved ? icons.bookmarkFilled : icons.bookmark}</button>
        </div>
      </div>
    </div>
  `;
}
