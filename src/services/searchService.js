// Búsqueda por palabra clave. Hoy filtra sobre mockData.js; cuando se
// conecten las fuentes reales, esta función debería pegarle directo a
// RSS/GNews/arXiv en vez de depender del caché diario.
import { getMockArticles } from './mockData.js';

export async function searchArticles(query, { type = 'all' } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getMockArticles().filter((article) => {
    const matchesQuery =
      article.title.toLowerCase().includes(q) || article.summary.toLowerCase().includes(q);
    const matchesType = type === 'all' || article.type === type;
    return matchesQuery && matchesType;
  });
}
