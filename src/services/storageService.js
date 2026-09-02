const DB_NAME = 'brizna';
const DB_VERSION = 1;
const STORE_ARTICLES = 'articles_cache';
const STORE_SAVED = 'saved_articles';

const LS_KEYS = {
  interests: 'user_interests',
  theme: 'theme_preference',
  lastFetchDate: 'last_fetch_date'
};

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ARTICLES)) {
        const store = db.createObjectStore(STORE_ARTICLES, { keyPath: 'id' });
        store.createIndex('category', 'category');
      }
      if (!db.objectStoreNames.contains(STORE_SAVED)) {
        db.createObjectStore(STORE_SAVED, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const result = callback(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Preferencias (localStorage) ---

export function getInterests() {
  const raw = localStorage.getItem(LS_KEYS.interests);
  return raw ? JSON.parse(raw) : null;
}

export function setInterests(categoryIds) {
  localStorage.setItem(LS_KEYS.interests, JSON.stringify(categoryIds));
}

export function getTheme() {
  return localStorage.getItem(LS_KEYS.theme) ?? 'light';
}

export function setTheme(value) {
  localStorage.setItem(LS_KEYS.theme, value);
}

export function getLastFetchDate() {
  return localStorage.getItem(LS_KEYS.lastFetchDate);
}

export function setLastFetchDate(isoDate) {
  localStorage.setItem(LS_KEYS.lastFetchDate, isoDate);
}

// --- Caché diario de artículos (IndexedDB) ---

export async function replaceArticlesCache(articles) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ARTICLES, 'readwrite');
    const store = tx.objectStore(STORE_ARTICLES);
    store.clear();
    for (const article of articles) store.put(article);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedArticles() {
  return withStore(STORE_ARTICLES, 'readonly', (store) => requestToPromise(store.getAll())).then((p) => p);
}

export async function getCachedArticlesByCategory(categoryId) {
  const db = await openDB();
  const tx = db.transaction(STORE_ARTICLES, 'readonly');
  const index = tx.objectStore(STORE_ARTICLES).index('category');
  return requestToPromise(index.getAll(categoryId));
}

// --- Guardadas (IndexedDB) ---

export async function saveArticle(article) {
  return withStore(STORE_SAVED, 'readwrite', (store) => store.put(article));
}

export async function unsaveArticle(articleId) {
  return withStore(STORE_SAVED, 'readwrite', (store) => store.delete(articleId));
}

export async function getSavedArticles() {
  const db = await openDB();
  const tx = db.transaction(STORE_SAVED, 'readonly');
  return requestToPromise(tx.objectStore(STORE_SAVED).getAll());
}

export async function isArticleSaved(articleId) {
  const db = await openDB();
  const tx = db.transaction(STORE_SAVED, 'readonly');
  const result = await requestToPromise(tx.objectStore(STORE_SAVED).get(articleId));
  return Boolean(result);
}
