// Orquesta el refresco diario de contenido. Hoy trae los artículos desde
// mockData.js; el próximo paso es reemplazar fetchFromSources() por las
// llamadas reales a RSS (rss2json) + GNews + arXiv, manteniendo el resto
// de este archivo igual.
import { getMockArticles } from './mockData.js';
import {
  getLastFetchDate,
  setLastFetchDate,
  replaceArticlesCache,
  getCachedArticles,
  getSavedArticles
} from './storageService.js';
import { todayKey } from '../utils/dateUtils.js';

async function fetchFromSources() {
  // TODO: reemplazar por RSS/GNews/arXiv reales.
  return getMockArticles();
}

export async function getDailyArticles({ force = false } = {}) {
  const isNewDay = force || getLastFetchDate() !== todayKey();

  if (isNewDay) {
    const articles = await fetchFromSources();
    await replaceArticlesCache(articles);
    setLastFetchDate(todayKey());
    return articles;
  }

  const cached = await getCachedArticles();
  if (cached.length > 0) return cached;

  // Caché vacío por alguna razón (primer uso, IndexedDB limpiado): refrescar igual.
  const articles = await fetchFromSources();
  await replaceArticlesCache(articles);
  setLastFetchDate(todayKey());
  return articles;
}

export async function findArticleById(id) {
  const cached = await getCachedArticles();
  const fromCache = cached.find((a) => a.id === id);
  if (fromCache) return fromCache;

  const saved = await getSavedArticles();
  const fromSaved = saved.find((a) => a.id === id);
  if (fromSaved) return fromSaved;

  return getMockArticles().find((a) => a.id === id) ?? null;
}

export function groupByCategory(articles, categoryIds) {
  const groups = {};
  for (const id of categoryIds) {
    groups[id] = articles
      .filter((a) => a.category === id)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
  return groups;
}
