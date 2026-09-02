const RELATIVE_UNITS = [
  { limitMs: 60 * 60 * 1000, divisorMs: 60 * 1000, singular: 'hace 1 min', suffix: 'min' },
  { limitMs: 24 * 60 * 60 * 1000, divisorMs: 60 * 60 * 1000, singular: 'hace 1 h', suffix: 'h' },
  { limitMs: 7 * 24 * 60 * 60 * 1000, divisorMs: 24 * 60 * 60 * 1000, singular: 'hace 1 día', suffix: 'días' }
];

export function formatRelativeDate(isoDate) {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  if (diffMs < 0) return 'recién';

  for (const unit of RELATIVE_UNITS) {
    if (diffMs < unit.limitMs) {
      const value = Math.max(1, Math.floor(diffMs / unit.divisorMs));
      return value === 1 ? unit.singular : `hace ${value} ${unit.suffix}`;
    }
  }

  return new Date(isoDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

export function formatTodayLong() {
  const formatted = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
