import { getInterests } from './services/storageService.js';
import { renderOnboarding } from './views/OnboardingView.js';
import { renderHome } from './views/HomeView.js';
import { renderArticleDetail } from './views/ArticleDetailView.js';
import { renderSearch } from './views/SearchView.js';
import { renderSaved } from './views/SavedView.js';
import { renderSettings } from './views/SettingsView.js';

const routes = {
  onboarding: renderOnboarding,
  home: renderHome,
  search: renderSearch,
  saved: renderSaved,
  settings: renderSettings,
  article: renderArticleDetail
};

export function navigate(path) {
  window.location.hash = path;
}

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [route, ...params] = hash.split('/').filter(Boolean);
  return { route: route || 'home', params };
}

async function renderCurrentRoute() {
  const app = document.getElementById('app');
  const { route, params } = parseHash();

  if (route !== 'onboarding' && !getInterests()) {
    navigate('/onboarding');
    return;
  }

  const view = routes[route] ?? renderHome;
  await view(app, { navigate, params });
  window.scrollTo(0, 0);
}

export function startApp() {
  window.addEventListener('hashchange', renderCurrentRoute);
  renderCurrentRoute();
}
