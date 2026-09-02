// Fuentes reales por categoría. Cada RSS se resuelve vía rss2json (proxy
// CORS gratuito, sin API key) — ver services/rssProxy.js. Los feeds fueron
// verificados a mano; si alguno deja de funcionar, alcanza con cambiar la
// URL acá, sin tocar el resto de la app.

export const RSS_SOURCES = {
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', language: 'en' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', language: 'en' },
    { name: 'Xataka', url: 'https://www.xataka.com/feedburner.xml', language: 'es' }
  ],
  science: [
    { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml', language: 'en' },
    { name: 'Nature', url: 'http://feeds.nature.com/nature/rss/current', language: 'en' },
    { name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/ciencia/', language: 'es' }
  ],
  economy: [{ name: 'Ámbito', url: 'https://www.ambito.com/rss/pages/home.xml', language: 'es' }],
  sports: [{ name: 'Olé', url: 'https://www.ole.com.ar/rss/ultimas-noticias/', language: 'es' }],
  politics: [
    { name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/politica/', language: 'es' }
  ],
  entertainment: [
    { name: 'La Nación', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/espectaculos/', language: 'es' }
  ]
};

// arXiv tiene su propia API de búsqueda (devuelve Atom, que rss2json también
// sabe leer), así que los papers se resuelven con el mismo mecanismo que el RSS.
export const ARXIV_QUERIES = {
  tech: { query: 'cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL' },
  science: { query: 'cat:astro-ph.GA+OR+cat:physics.gen-ph+OR+cat:q-bio.NC' }
};

export function buildArxivUrl(categoryId, maxResults = 3) {
  const entry = ARXIV_QUERIES[categoryId];
  if (!entry) return null;
  return `http://export.arxiv.org/api/query?search_query=${entry.query}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
}
