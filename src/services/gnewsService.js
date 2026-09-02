// GNews es opcional: solo se usa si el usuario cargó su propia API key
// (gratuita, en https://gnews.io) en Ajustes. Sin key, la búsqueda sigue
// funcionando igual, solo que limitada a RSS + arXiv.
import { normalizeArticle } from '../models/Article.js';

const GNEWS_ENDPOINT = 'https://gnews.io/api/v4/search';

export async function searchGNews(query, apiKey, { lang = 'es', max = 10 } = {}) {
  if (!apiKey) return [];

  try {
    const url = `${GNEWS_ENDPOINT}?q=${encodeURIComponent(query)}&lang=${lang}&max=${max}&apikey=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();

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
  } catch {
    return [];
  }
}
