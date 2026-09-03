// Búsqueda en vivo, gratis y sin API key: el feed RSS público de búsqueda
// de Google Noticias, resuelto a través de rss2json (mismo mecanismo que
// las demás fuentes RSS de la app).
import { fetchRssArticles } from './rssProxy.js';

const GOOGLE_NEWS_SEARCH = 'https://news.google.com/rss/search';

// Google Noticias mete el nombre del medio al final del título
// ("Título de la nota - infobae.com"); lo separamos para tener una
// fuente prolija en vez de que todo diga "Google Noticias".
function splitTitleAndSource(rawTitle) {
  const idx = rawTitle.lastIndexOf(' - ');
  if (idx === -1) return { title: rawTitle, sourceName: 'Google Noticias' };
  return { title: rawTitle.slice(0, idx), sourceName: rawTitle.slice(idx + 3) };
}

export async function searchGoogleNews(query, { apiKey, lang = 'es-419', country = 'AR' } = {}) {
  const url = `${GOOGLE_NEWS_SEARCH}?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${country}:${lang}`;
  const rawArticles = await fetchRssArticles({ url, sourceName: 'Google Noticias', category: null, language: lang, type: 'news', apiKey });

  return rawArticles.map((article) => {
    const { title, sourceName } = splitTitleAndSource(article.title);
    // El campo "description" de Google Noticias no es un resumen real: es
    // el mismo título repetido (o, para notas agrupadas, una lista de
    // títulos relacionados). Mostrarlo duplica el título, así que se
    // descarta en vez de mostrar texto confuso.
    return { ...article, title, sourceName, summary: '' };
  });
}
