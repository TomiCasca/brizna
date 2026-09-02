// La búsqueda combina lo que ya tenemos cacheado del día (RSS + arXiv de
// las 6 categorías, no solo las elegidas por el usuario) con GNews en vivo
// si el usuario cargó su API key en Ajustes. RSS no soporta búsqueda por
// palabra clave del lado del servidor, así que ahí filtramos en el cliente;
// GNews sí la soporta nativamente.
import { getCachedArticles, getGNewsApiKey } from './storageService.js';
import { searchGNews } from './gnewsService.js';

function matchesQuery(article, query) {
  const q = query.toLowerCase();
  return article.title.toLowerCase().includes(q) || article.summary.toLowerCase().includes(q);
}

function dedupeById(articles) {
  const seen = new Map();
  for (const article of articles) {
    if (!seen.has(article.id)) seen.set(article.id, article);
  }
  return [...seen.values()];
}

export async function searchArticles(query, { type = 'all' } = {}) {
  const q = query.trim();
  if (!q) return [];

  const [cached, gnewsResults] = await Promise.all([
    getCachedArticles(),
    searchGNews(q, getGNewsApiKey())
  ]);

  const fromCache = cached.filter((article) => matchesQuery(article, q));
  const combined = dedupeById([...fromCache, ...gnewsResults]);

  return combined
    .filter((article) => type === 'all' || article.type === type)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
