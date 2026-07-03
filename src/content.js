const THEME_ATTRIBUTE = 'data-ptt-palette-theme';
const DENSITY_ATTRIBUTE = 'data-ptt-palette-density';
const BRANDING_ATTRIBUTE = 'data-ptt-palette-hide-branding';
const DEFAULT_THEME = 'default';
const LIGHT_THEME = 'light';
const TRACKER_THEME = 'tracker';
const COMFORTABLE_DENSITY = 'comfortable';
const COMPACT_DENSITY = 'compact';
const STORAGE_KEY = 'theme';
const DENSITY_STORAGE_KEY = 'density';
const HIDE_BRANDING_STORAGE_KEY = 'hideBranding';
const MESSAGE_TYPE = 'PTT_PALETTE_SET_THEME';

function normalizeTheme(value) {
  return value === LIGHT_THEME || value === TRACKER_THEME ? value : DEFAULT_THEME;
}

function normalizeDensity(value) {
  return value === COMPACT_DENSITY ? COMPACT_DENSITY : COMFORTABLE_DENSITY;
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

function applyLogoText(theme) {
  const logo = document.querySelector('#topbar #logo');

  if (!logo) {
    return;
  }

  if (!logo.dataset.pttPaletteOriginalText) {
    logo.dataset.pttPaletteOriginalText = logo.textContent;
  }

  if (theme === TRACKER_THEME) {
    logo.textContent = 'Office';
    return;
  }

  logo.textContent = logo.dataset.pttPaletteOriginalText;
}

function applyPreferences(preferences) {
  const normalizedTheme = applyTheme(preferences.theme);
  const normalizedDensity = normalizeDensity(preferences.density);

  if (normalizedTheme === TRACKER_THEME && normalizedDensity === COMPACT_DENSITY) {
    document.documentElement.setAttribute(DENSITY_ATTRIBUTE, COMPACT_DENSITY);
  } else {
    document.documentElement.removeAttribute(DENSITY_ATTRIBUTE);
  }

  if (normalizedTheme === TRACKER_THEME && preferences.hideBranding === true) {
    document.documentElement.setAttribute(BRANDING_ATTRIBUTE, 'true');
  } else {
    document.documentElement.removeAttribute(BRANDING_ATTRIBUTE);
  }

  applyLogoText(normalizedTheme);
}

function readStoredTheme() {
  chrome.storage.sync.get({
    [STORAGE_KEY]: DEFAULT_THEME,
    [DENSITY_STORAGE_KEY]: COMFORTABLE_DENSITY,
    [HIDE_BRANDING_STORAGE_KEY]: false,
  }, (items) => {
    if (chrome.runtime.lastError) {
      applyPreferences({ theme: DEFAULT_THEME });
      return;
    }

    applyPreferences({
      theme: items[STORAGE_KEY],
      density: items[DENSITY_STORAGE_KEY],
      hideBranding: items[HIDE_BRANDING_STORAGE_KEY],
    });
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== MESSAGE_TYPE) {
    return false;
  }

  applyPreferences({
    theme: message.theme,
    density: message.density,
    hideBranding: message.hideBranding,
  });
  return false;
});

readStoredTheme();
