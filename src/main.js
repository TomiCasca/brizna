import './styles/theme.css';
import './styles/base.css';
import './styles/components.css';
import { getTheme } from './services/storageService.js';
import { startApp } from './app.js';

document.documentElement.dataset.theme = getTheme();

startApp();
