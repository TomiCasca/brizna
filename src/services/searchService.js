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

// Devuelve TODOS los tipos (no filtra por news/paper acá) — el filtro de
// tipo se aplica en la vista sobre este mismo resultado, para no pegarle
// de nuevo a GNews cada vez que el usuario solo cambia de chip (Todos/
// Noticias/Papers) sin cambiar el texto buscado.
export async function searchArticles(query) {
  const q = query.trim();
  if (!q) return { results: [], gnewsError: null };

  const gnewsKey = getGNewsApiKey();

  const [cached, gnewsSettled] = await Promise.all([
    getCachedArticles(),
    gnewsKey ? searchGNews(q, gnewsKey).then((r) => ({ ok: true, r })).catch((e) => ({ ok: false, e })) : { ok: true, r: [] }
  ]);

  const gnewsResults = gnewsSettled.ok ? gnewsSettled.r : [];
  const gnewsError = gnewsSettled.ok ? null : gnewsSettled.e.message;

  const fromCache = cached.filter((article) => matchesQuery(article, q));
  const combined = dedupeById([...fromCache, ...gnewsResults]).sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  return { results: combined, gnewsError };
}
