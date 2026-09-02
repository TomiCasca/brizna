export function normalizeArticle(raw) {
  return {
    id: raw.id,
    type: raw.type ?? 'news',
    title: raw.title,
    summary: raw.summary,
    imageUrl: raw.imageUrl ?? null,
    sourceName: raw.sourceName,
    sourceUrl: raw.sourceUrl,
    category: raw.category,
    language: raw.language ?? 'es',
    publishedAt: raw.publishedAt,
    fetchedAt: raw.fetchedAt ?? new Date().toISOString()
  };
}
