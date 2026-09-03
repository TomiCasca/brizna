// La búsqueda combina lo que ya tenemos cacheado del día (RSS + arXiv de
// las 6 categorías, no solo las elegidas por el usuario) con una búsqueda
// en vivo contra Google Noticias (gratis, sin API key). RSS no soporta
// búsqueda por palabra clave del lado del servidor, así que ahí filtramos
// en el cliente; Google Noticias sí la soporta nativamente.
import { getCachedArticles, getRss2JsonApiKey } from './storageService.js';
import { searchGoogleNews } from './googleNewsService.js';

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

// Devuelve TODOS los tipos (no filtra por news/paper acá) — el filtro de
// tipo se aplica en la vista sobre este mismo resultado, para no repetir
// la búsqueda en vivo cada vez que el usuario solo cambia de chip (Todos/
// Noticias/Papers) sin cambiar el texto buscado.
export async function searchArticles(query) {
  const q = query.trim();
  if (!q) return { results: [], searchError: null };

  const [cached, liveSettled] = await Promise.all([
    getCachedArticles(),
    searchGoogleNews(q, { apiKey: getRss2JsonApiKey() })
      .then((r) => ({ ok: true, r }))
      .catch((e) => ({ ok: false, e }))
  ]);

  const liveResults = liveSettled.ok ? liveSettled.r : [];
  const searchError = liveSettled.ok ? null : liveSettled.e.message;

  const fromCache = cached.filter((article) => matchesQuery(article, q));
  const combined = dedupeById([...fromCache, ...liveResults]).sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return { results: combined, searchError };
}
