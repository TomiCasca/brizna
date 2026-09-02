import { normalizeArticle } from '../models/Article.js';
import { stripHtml, truncate, extractFirstImage, decodeHtmlEntities } from '../utils/domUtils.js';
import { delay } from '../utils/concurrency.js';

const RSS2JSON_ENDPOINT = 'https://api.rss2json.com/v1/api.json';

// Trae un feed RSS/Atom (RSS de un diario, o incluso la API de arXiv, que
// devuelve Atom) a través de rss2json, que le agrega los headers CORS que
// el sitio original no manda. Nunca tira: si un feed falla, devuelve []
// para no romper el resto de la carga. Sin API key, rss2json comparte un
// pool de uso entre todos sus usuarios anónimos y puede devolver 429 aunque
// nosotros no estemos pidiendo de más — por eso el reintento.
async function fetchFeedItems(feedUrl, apiKey) {
  const params = new URLSearchParams({ rss_url: feedUrl });
  if (apiKey) params.set('api_key', apiKey);
  const proxied = `${RSS2JSON_ENDPOINT}?${params.toString()}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(proxied);
      if (response.status === 429 && attempt === 0) {
        await delay(2000);
        continue;
      }
      const data = await response.json();
      if (data.status !== 'ok') return [];
      return data.items ?? [];
    } catch {
      return [];
    }
  }
  return [];
}

function parsePubDate(pubDate) {
  const parsed = pubDate ? new Date(`${pubDate.replace(' ', 'T')}Z`) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
}

export async function fetchRssArticles({ url, sourceName, category, language, type = 'news', apiKey }) {
  const items = await fetchFeedItems(url, apiKey);

  return items
    .filter((item) => item.link)
    .map((item) => {
      const link = decodeHtmlEntities(item.link);
      const imageUrl = decodeHtmlEntities(
        item.thumbnail ||
          item.enclosure?.link ||
          extractFirstImage(item.content) ||
          extractFirstImage(item.description) ||
          null
      );

      return normalizeArticle({
        id: link,
        type,
        title: stripHtml(item.title),
        summary: truncate(stripHtml(item.description || item.content || '')),
        imageUrl,
        sourceName,
        sourceUrl: link,
        category,
        language,
        publishedAt: parsePubDate(item.pubDate)
      });
    });
}
