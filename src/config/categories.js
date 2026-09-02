export const CATEGORIES = [
  { id: 'tech', label: 'Tecnología / Programación', includesPapers: true },
  { id: 'science', label: 'Ciencia', includesPapers: true },
  { id: 'economy', label: 'Economía / Finanzas', includesPapers: false },
  { id: 'sports', label: 'Deportes', includesPapers: false },
  { id: 'politics', label: 'Política', includesPapers: false },
  { id: 'entertainment', label: 'Entretenimiento', includesPapers: false }
];

export function getCategoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? null;
}
