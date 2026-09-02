// Datos de ejemplo para poder construir y probar la UI antes de conectar
// las fuentes reales (RSS/GNews/arXiv). newsService.js es el único lugar
// que debería importar este archivo.
import { normalizeArticle } from '../models/Article.js';

const RAW = [
  {
    id: 'tech-1',
    type: 'news',
    title: 'Un nuevo modelo de código abierto reduce a la mitad el costo de inferencia',
    summary:
      'El equipo publicó los pesos del modelo junto con un paper técnico que detalla la arquitectura y el proceso de entrenamiento. Según los benchmarks compartidos, el costo de inferencia se reduce a la mitad frente a modelos de tamaño comparable.',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com',
    category: 'tech',
    language: 'en',
    publishedAt: '2026-09-02T07:00:00Z'
  },
  {
    id: 'tech-2',
    type: 'news',
    title: 'Apple prepara una actualización de privacidad para su próximo sistema operativo',
    summary: 'Fuentes cercanas a la empresa anticipan cambios en el manejo de datos de apps de terceros.',
    sourceName: 'The Verge',
    sourceUrl: 'https://theverge.com',
    category: 'tech',
    language: 'en',
    publishedAt: '2026-09-02T04:00:00Z'
  },
  {
    id: 'tech-3',
    type: 'paper',
    title: 'arXiv: un paper propone una técnica de compresión de contexto para LLMs',
    summary: 'Los autores reportan una reducción del 40% en memoria sin pérdida significativa de precisión.',
    sourceName: 'arXiv',
    sourceUrl: 'https://arxiv.org',
    category: 'tech',
    language: 'en',
    publishedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'science-1',
    type: 'news',
    title: 'Un telescopio espacial detecta agua en la atmósfera de un exoplaneta cercano',
    summary: 'El hallazgo se suma a la lista de candidatos con condiciones potencialmente habitables.',
    sourceName: 'Nature News',
    sourceUrl: 'https://nature.com',
    category: 'science',
    language: 'en',
    publishedAt: '2026-09-02T06:00:00Z'
  },
  {
    id: 'science-2',
    type: 'paper',
    title: 'arXiv: nuevo modelo climático mejora la predicción de olas de calor a 30 días',
    summary: 'Combina datos satelitales con redes neuronales para afinar el pronóstico regional.',
    sourceName: 'arXiv',
    sourceUrl: 'https://arxiv.org',
    category: 'science',
    language: 'en',
    publishedAt: '2026-09-02T01:00:00Z'
  },
  {
    id: 'science-3',
    type: 'news',
    title: 'Investigadores logran editar genes en células adultas con mayor precisión',
    summary: 'La técnica reduce los efectos fuera del blanco observados en versiones anteriores de CRISPR.',
    sourceName: 'Science Daily',
    sourceUrl: 'https://sciencedaily.com',
    category: 'science',
    language: 'en',
    publishedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'economy-1',
    type: 'news',
    title: 'El Banco Central mantiene la tasa de referencia por tercer mes consecutivo',
    summary: 'La decisión busca sostener la desinflación sin frenar de golpe la actividad económica.',
    sourceName: 'Ámbito',
    sourceUrl: 'https://ambito.com',
    category: 'economy',
    language: 'es',
    publishedAt: '2026-09-02T08:00:00Z'
  },
  {
    id: 'economy-2',
    type: 'news',
    title: 'Las acciones tecnológicas lideran las subas en Wall Street',
    summary: 'El sector repunta tras resultados trimestrales mejores a los esperados por el mercado.',
    sourceName: 'Bloomberg',
    sourceUrl: 'https://bloomberg.com',
    category: 'economy',
    language: 'es',
    publishedAt: '2026-09-02T05:00:00Z'
  },
  {
    id: 'economy-3',
    type: 'news',
    title: 'El dólar financiero cierra estable tras una semana volátil',
    summary: 'Analistas atribuyen la calma a la intervención del Tesoro en el mercado de bonos.',
    sourceName: 'Infobae',
    sourceUrl: 'https://infobae.com',
    category: 'economy',
    language: 'es',
    publishedAt: '2026-09-01T22:00:00Z'
  },
  {
    id: 'sports-1',
    type: 'news',
    title: 'La selección confirmó la lista de convocados para las próximas eliminatorias',
    summary: 'El cuerpo técnico apuesta por una mezcla de experiencia y juventud de cara a los próximos partidos.',
    sourceName: 'ESPN',
    sourceUrl: 'https://espn.com',
    category: 'sports',
    language: 'es',
    publishedAt: '2026-09-02T09:00:00Z'
  },
  {
    id: 'sports-2',
    type: 'news',
    title: 'Un histórico título cierra una temporada marcada por las lesiones',
    summary: 'El equipo superó las bajas y se consagró campeón en la última fecha.',
    sourceName: 'Olé',
    sourceUrl: 'https://ole.com.ar',
    category: 'sports',
    language: 'es',
    publishedAt: '2026-09-02T02:00:00Z'
  },
  {
    id: 'sports-3',
    type: 'news',
    title: 'Se confirmó el fixture completo del próximo torneo local',
    summary: 'La fecha inaugural tendrá al campeón vigente como local ante el ascendido.',
    sourceName: 'TyC Sports',
    sourceUrl: 'https://tycsports.com',
    category: 'sports',
    language: 'es',
    publishedAt: '2026-09-01T20:00:00Z'
  },
  {
    id: 'politics-1',
    type: 'news',
    title: 'El Congreso debate un proyecto clave para el próximo presupuesto',
    summary: 'Oficialismo y oposición negocian modificaciones antes de la votación en comisión.',
    sourceName: 'La Nación',
    sourceUrl: 'https://lanacion.com.ar',
    category: 'politics',
    language: 'es',
    publishedAt: '2026-09-02T07:30:00Z'
  },
  {
    id: 'politics-2',
    type: 'news',
    title: 'Cumbre regional busca acordar una agenda común de comercio exterior',
    summary: 'Los cancilleres se reúnen esta semana para destrabar puntos pendientes del acuerdo.',
    sourceName: 'Clarín',
    sourceUrl: 'https://clarin.com',
    category: 'politics',
    language: 'es',
    publishedAt: '2026-09-01T18:00:00Z'
  },
  {
    id: 'politics-3',
    type: 'news',
    title: 'Nueva encuesta muestra un escenario ajustado de cara a las próximas elecciones',
    summary: 'El estudio releva intención de voto en los principales distritos del país.',
    sourceName: 'Perfil',
    sourceUrl: 'https://perfil.com',
    category: 'politics',
    language: 'es',
    publishedAt: '2026-09-01T15:00:00Z'
  },
  {
    id: 'entertainment-1',
    type: 'news',
    title: 'La próxima entrega de la saga ya tiene fecha confirmada de estreno',
    summary: 'El estudio compartió las primeras imágenes durante un evento especial para prensa.',
    sourceName: 'Rolling Stone',
    sourceUrl: 'https://rollingstone.com',
    category: 'entertainment',
    language: 'es',
    publishedAt: '2026-09-02T03:00:00Z'
  },
  {
    id: 'entertainment-2',
    type: 'news',
    title: 'El festival de música anunció el line-up completo para su edición de verano',
    summary: 'Entre los cabezas de cartel hay varias bandas que se presentan por primera vez en el país.',
    sourceName: 'Indie Hoy',
    sourceUrl: 'https://indiehoy.com',
    category: 'entertainment',
    language: 'es',
    publishedAt: '2026-09-01T19:00:00Z'
  },
  {
    id: 'entertainment-3',
    type: 'news',
    title: 'La serie más vista del año ya tiene confirmada una nueva temporada',
    summary: 'La plataforma anunció la renovación tras superar récords de audiencia en su estreno.',
    sourceName: 'IndieWire',
    sourceUrl: 'https://indiewire.com',
    category: 'entertainment',
    language: 'es',
    publishedAt: '2026-09-01T12:00:00Z'
  }
];

export function getMockArticles() {
  return RAW.map(normalizeArticle);
}
