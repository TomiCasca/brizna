// Orquesta el refresco diario de contenido: trae RSS + arXiv de
// config/sources.js a través de rssProxy.js, una categoría por vez.
import { RSS_SOURCES, buildArxivUrl } from '../config/sources.js';
import { CATEGORIES } from '../config/categories.js';
import { fetchRssArticles } from './rssProxy.js';
import {
  getLastFetchDate,
  setLastFetchDate,
  replaceArticlesCache,
  getCachedArticles,
  getSavedArticles,
  getRss2JsonApiKey
} from './storageService.js';
import { todayKey } from '../utils/dateUtils.js';
import { sequentialMap } from '../utils/concurrency.js';

function buildFetchTasks(apiKey) {
  const tasks = [];

  for (const category of CATEGORIES) {
    for (const source of RSS_SOURCES[category.id] ?? []) {
      tasks.push(() =>
        fetchRssArticles({
          url: source.url,
          sourceName: source.name,
          category: category.id,
          language: source.language,
          type: 'news',
          apiKey
        })
      );
    }

    const arxivUrl = category.includesPapers ? buildArxivUrl(category.id) : null;
    if (arxivUrl) {
      tasks.push(() =>
        fetchRssArticles({
          url: arxivUrl,
          sourceName: 'arXiv',
          category: category.id,
          language: 'en',
          type: 'paper',
          apiKey
        })
      );
    }
  }

  return tasks;
}

async function fetchFromSources() {
  const tasks = buildFetchTasks(getRss2JsonApiKey());
  const results = await sequentialMap(tasks, (task) => task());
  return results.flat();
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

  return (await getSavedArticles()).find((a) => a.id === id) ?? null;
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
