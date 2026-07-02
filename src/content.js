const THEME_ATTRIBUTE = 'data-ptt-palette-theme';
const DEFAULT_THEME = 'default';
const LIGHT_THEME = 'light';
const TRACKER_THEME = 'tracker';
const STORAGE_KEY = 'theme';
const MESSAGE_TYPE = 'PTT_PALETTE_SET_THEME';

function normalizeTheme(value) {
  return value === LIGHT_THEME || value === TRACKER_THEME ? value : DEFAULT_THEME;
}

function applyTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);

  if (normalizedTheme !== DEFAULT_THEME) {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, normalizedTheme);
    return normalizedTheme;
  }

  document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  return DEFAULT_THEME;
}

function readStoredTheme() {
  chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_THEME }, (items) => {
    if (chrome.runtime.lastError) {
      applyTheme(DEFAULT_THEME);
      return;
    }

    applyTheme(items[STORAGE_KEY]);
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== MESSAGE_TYPE) {
    return false;
  }

  applyTheme(message.theme);
  return false;
});

readStoredTheme();
