# Estructura del proyecto — Newspaper Brief App

## Stack elegido

- **Vite** — servidor de desarrollo y build, liviano y rápido, ideal para aprender sin la sobrecarga de un framework grande.
- **JavaScript vanilla (ES Modules)** — sin React/Vue, ya que estás terminando JS y sirve como práctica de fundamentos (DOM, módulos, fetch, async/await).
- **vite-plugin-pwa** — genera automáticamente el manifest y el service worker para que la app sea instalable en iPhone.
- **CSS plano con variables (custom properties)** — para manejar el tema claro/oscuro y el color de acento sin librerías de estilos.
- **localStorage + IndexedDB** — persistencia 100% en el dispositivo (intereses, noticias cacheadas, guardadas), sin backend.

> Nota: esta es mi propuesta por simplicidad y valor de aprendizaje. Si preferís otro stack (por ejemplo con un framework), lo cambiamos antes de empezar a codear.

---

## Árbol de carpetas y archivos

```
NewspaperBriefApp/
├── index.html                     # Punto de entrada, shell de la SPA
├── package.json
├── vite.config.js                 # Config de Vite + plugin PWA (manifest, service worker)
├── .gitignore
├── ESTRUCTURA_PROYECTO.md         # Este documento
│
├── public/
│   ├── icons/                     # Íconos de la PWA (varios tamaños para iOS)
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── apple-touch-icon.png
│   └── favicon.svg
│
├── src/
│   ├── main.js                    # Bootstrap: monta la app, registra el service worker
│   ├── app.js                     # Router simple (cambia de sección sin recargar)
│   │
│   ├── styles/
│   │   ├── base.css               # Reset + tipografía (sans-serif) + estructura general
│   │   ├── theme.css               # Variables CSS: claro/oscuro + color de acento (azul)
│   │   └── components.css          # Estilos de tarjetas, tabs, botones, inputs
│   │
│   ├── config/
│   │   ├── categories.js          # Definición de categorías predefinidas y sus fuentes
│   │   └── sources.js             # URLs de RSS, endpoints de GNews y arXiv por categoría/idioma
│   │
│   ├── services/                  # Lógica de acceso a datos (sin UI)
│   │   ├── newsService.js         # Orquesta fetch de RSS + GNews, normaliza resultados
│   │   ├── papersService.js       # Fetch y parseo de arXiv API
│   │   ├── rssProxy.js            # Wrapper del proxy CORS (rss2json) para leer RSS
│   │   ├── searchService.js       # Búsqueda por palabra clave contra las mismas fuentes
│   │   └── storageService.js      # Capa sobre localStorage/IndexedDB (intereses, caché diaria, guardadas)
│   │
│   ├── models/
│   │   └── Article.js             # Forma/normalización de un artículo (noticia o paper) en un objeto común
│   │
│   ├── views/                     # Una "pantalla" por archivo, arman su propio HTML dinámicamente
│   │   ├── OnboardingView.js       # Selección inicial de intereses
│   │   ├── HomeView.js             # Feed principal agrupado por tema (3 + "ver más")
│   │   ├── ArticleDetailView.js    # Vista de detalle (resumen ampliado + link a nota completa)
│   │   ├── SearchView.js           # Búsqueda por palabra clave
│   │   ├── SavedView.js            # Noticias/papers guardados
│   │   └── SettingsView.js         # Editar intereses, toggle claro/oscuro
│   │
│   ├── components/                 # Piezas de UI reutilizables entre vistas
│   │   ├── ArticleCard.js          # Tarjeta de noticia/paper (usada en Home, Search, Saved)
│   │   ├── BottomTabBar.js         # Barra inferior de navegación (Home/Buscar/Guardadas/Ajustes)
│   │   ├── CategorySection.js      # Bloque "Tecnología" / "Ciencia" / etc. con sus 3 tarjetas + botón
│   │   ├── ThemeToggle.js          # Switch de modo claro/oscuro
│   │   └── LoadingSpinner.js
│   │
│   └── utils/
│       ├── dateUtils.js           # Comparar "último fetch" vs hoy, formatear fechas relativas
│       └── domUtils.js            # Helpers chicos para crear/actualizar elementos del DOM
│
└── sw-custom/                     # (si hace falta lógica custom del service worker más allá del plugin)
    └── background-sync.js         # Placeholder para eventual sync futuro (fuera de alcance v1)
```

---

## Modelo de datos local (localStorage / IndexedDB)

| Clave / Store              | Contenido                                                                 | Motor           |
|-----------------------------|----------------------------------------------------------------------------|------------------|
| `user_interests`            | Array de categorías elegidas (ej. `["tech", "science"]`)                  | localStorage     |
| `theme_preference`          | `"light"` \| `"dark"`                                                     | localStorage     |
| `last_fetch_date`           | Fecha ISO del último refresh de contenido (para el chequeo "1 vez al día") | localStorage     |
| `articles_cache`            | Artículos normalizados del día, agrupados por categoría                    | IndexedDB        |
| `saved_articles`            | Artículos guardados por el usuario (persisten entre días)                  | IndexedDB        |

### Forma de un artículo normalizado (`Article`)

```js
{
  id: "sha1-o-hash-del-link",   // para deduplicar
  type: "news" | "paper",
  title: "...",
  summary: "...",
  imageUrl: "..." | null,
  sourceName: "Clarín" | "arXiv" | "GNews:BBC",
  sourceUrl: "https://...",     // link a la nota/paper completo
  category: "tech",
  language: "es" | "en",
  publishedAt: "2026-09-02T10:00:00Z",
  fetchedAt: "2026-09-02T08:00:00Z"
}
```

---

## Flujo de datos (alto nivel)

1. **`main.js`** arranca, registra el service worker (PWA) y llama a `app.js`.
2. **`app.js`** decide qué vista mostrar: si no hay `user_interests` guardado → `OnboardingView`; si no → `HomeView`.
3. **`HomeView`** le pide a `storageService` el estado de `last_fetch_date`. Si es de otro día, dispara `newsService` + `papersService` para traer contenido fresco, lo normaliza a `Article` y lo guarda en `articles_cache` (IndexedDB) junto con la nueva `last_fetch_date`. Si es el mismo día, lee directo del caché.
4. Las **tarjetas** (`ArticleCard`) se arman con `CategorySection`, agrupadas por tema.
5. Tocar una tarjeta navega a **`ArticleDetailView`** (sin salir de la app), con botón externo "Leer nota completa".
6. El ícono de guardar en cualquier tarjeta escribe/borra en `saved_articles` vía `storageService`.
7. **`SearchView`** usa `searchService`, que pega directo a las mismas fuentes (RSS/GNews/arXiv) filtrando por palabra clave, sin depender del caché diario.
8. **`SettingsView`** permite reeditar `user_interests` y togglear `theme_preference`.

---

## Próximos pasos sugeridos

1. Confirmar esta estructura (o ajustar algo).
2. Bocetos/wireframes de las 5 pantallas (Onboarding, Home, Detalle, Búsqueda, Guardadas, Ajustes).
3. Setup inicial del proyecto (`npm create vite@latest`, instalar `vite-plugin-pwa`) — te guío paso a paso con los comandos.
4. Implementación incremental: primero `storageService` + `HomeView` con datos mock, después conexión real a las fuentes.
