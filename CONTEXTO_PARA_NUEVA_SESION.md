# Contexto del proyecto Brizna (para retomar en una sesión nueva)

Pegá este archivo o su contenido como primer mensaje al abrir Claude Code
en la PC de casa, después de clonar el repo e instalar dependencias.

## Qué es

App PWA personal (no se publica en App Store) para reemplazar el scroll
de redes sociales en el trayecto al trabajo, con noticias y papers
académicos filtrados por temas de interés elegidos por el usuario.

## Requerimientos ya definidos

- Onboarding: elegís categorías (Tecnología/Programación, Ciencia,
  Economía/Finanzas, Deportes, Política, Entretenimiento), se guardan
  localmente y no se vuelven a preguntar.
- Home: agrupado por categoría, 3 artículos por tema + "Ver más".
- Detalle: dentro de la app (resumen ampliado), con botón "Leer nota
  completa" que abre la fuente original fuera de la app.
- Guardar artículos (persistente en el dispositivo).
- Búsqueda por palabra clave con filtros (Todos/Noticias/Papers).
- Actualización diaria (no en cada apertura): compara la fecha del
  último fetch guardado contra hoy.
- 100% client-side, sin backend propio, sin costos.
- Fuentes previstas: RSS (vía proxy CORS tipo rss2json) + GNews API +
  arXiv API para papers en Tecnología/Ciencia.

## Diseño

Minimalista/editorial, sans-serif (system-ui/Inter), acento único
azul (#2563eb), claro y oscuro con toggle manual, tarjetas espaciadas,
navegación por barra inferior de tabs (Home, Buscar, Guardadas,
Ajustes).

## Nombre y logo

App: **Brizna**. Isotipo: un trazo curvo + un punto (gesto único,
minimalista), azul sobre blanco / blanco sobre azul.

## Stack y estado actual

Vite + JavaScript vanilla (sin framework, para practicar fundamentos) +
`vite-plugin-pwa`. Estructura completa en `ESTRUCTURA_PROYECTO.md`.

Ya está armado y probado funcionando en el navegador (onboarding, home,
detalle, guardar, buscar, ajustes, tema claro/oscuro, persistencia en
localStorage/IndexedDB, manifest y service worker de la PWA).

Los datos que se muestran hoy son **de ejemplo** (`src/services/mockData.js`).

## Lo que falta (próximo paso)

Reemplazar `fetchFromSources()` en `src/services/newsService.js` (y la
lógica de `src/services/searchService.js`) por las fuentes reales:
RSS + GNews + arXiv, en vez de los datos mock. Después, probar la
instalación como PWA en el iPhone ("Añadir a inicio" desde Safari) —
esto se pausó porque desde la red corporativa del banco no se podía
conectar el iPhone a la notebook (probable aislamiento de clientes);
debería funcionar sin problema desde la red de casa.
