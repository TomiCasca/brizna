// GNews es opcional: solo se usa si el usuario cargó su propia API key
// (gratuita, en https://gnews.io) en Ajustes. Sin key, la búsqueda sigue
// funcionando igual, solo que limitada a RSS + arXiv.
import { normalizeArticle } from '../models/Article.js';

const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';

// A diferencia de rssProxy (que traga errores por fuente porque son 10
// fuentes y una caída no debe tirar abajo el resto), acá hay una sola
// llamada y el usuario la puede diagnosticar — así que el error real de
// GNews se propaga en vez de esconderse como un array vacío silencioso.
export async function searchGNews(query, apiKey, { lang = 'es', max = 10 } = {}) {
  if (!apiKey) return [];

  const url = `${GNEWS_ENDPOINT}?q=${encodeURIComponent(query)}&lang=${lang}&max=${max}&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0] ?? `GNews respondió ${response.status}`);
  }

  return (data.articles ?? []).map((item) =>
    normalizeArticle({
      id: item.url,
      type: 'news',
      title: item.title,
      summary: item.description ?? '',
      imageUrl: item.image ?? null,
      sourceName: item.source?.name ?? 'GNews',
      sourceUrl: item.url,
      category: null,
      language: lang,
      publishedAt: item.publishedAt
    })
  );
}
