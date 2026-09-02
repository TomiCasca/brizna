import { icons } from './icons.js';

const TABS = [
  { route: 'home', label: 'Home', icon: icons.home },
  { route: 'search', label: 'Buscar', icon: icons.search },
  { route: 'saved', label: 'Guardadas', icon: icons.bookmark },
  { route: 'settings', label: 'Ajustes', icon: icons.settings }
];

export function BottomTabBar(activeRoute) {
  return `
    <nav class="tab-bar">
      ${TABS.map(
        (tab) => `
        <button class="tab ${tab.route === activeRoute ? 'active' : ''}" data-navigate="${tab.route}">
          ${tab.icon}
          <span>${tab.label}</span>
        </button>
      `
      ).join('')}
    </nav>
  `;
}
