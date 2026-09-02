import { icons } from './icons.js';
import { escapeHtml } from '../utils/domUtils.js';
import { formatRelativeDate } from '../utils/dateUtils.js';

export function ArticleCard(article, { saved = false } = {}) {
  return `
    <div class="article-card" role="button" data-open-article="${article.id}">
      <div class="article-thumb">${icons.image}</div>
      <div class="article-body">
        <div class="article-title clamp-2">${escapeHtml(article.title)}</div>
        <div class="article-summary clamp-2">${escapeHtml(article.summary)}</div>
        <div class="article-meta">
          <span class="article-meta-text">${escapeHtml(article.sourceName)} · ${formatRelativeDate(article.publishedAt)}</span>
          <button
            class="save-toggle ${saved ? 'saved' : ''}"
            data-toggle-save="${article.id}"
            aria-label="${saved ? 'Quitar de guardadas' : 'Guardar'}"
          >${saved ? icons.bookmarkFilled : icons.bookmark}</button>
        </div>
      </div>
    </div>
  `;
}
