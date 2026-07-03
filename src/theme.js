export const THEME_ATTRIBUTE = 'data-ptt-palette-theme';
export const DENSITY_ATTRIBUTE = 'data-ptt-palette-density';
export const BRANDING_ATTRIBUTE = 'data-ptt-palette-hide-branding';
export const DEFAULT_THEME = 'default';
export const LIGHT_THEME = 'light';
export const TRACKER_THEME = 'tracker';
export const COMFORTABLE_DENSITY = 'comfortable';
export const COMPACT_DENSITY = 'compact';
export const STORAGE_KEY = 'theme';
export const DENSITY_STORAGE_KEY = 'density';
export const HIDE_BRANDING_STORAGE_KEY = 'hideBranding';

export function normalizeTheme(value) {
  return value === LIGHT_THEME || value === TRACKER_THEME ? value : DEFAULT_THEME;
}

export function normalizeDensity(value) {
  return value === COMPACT_DENSITY ? COMPACT_DENSITY : COMFORTABLE_DENSITY;
}

export function applyTheme(documentRef, theme) {
  const normalizedTheme = normalizeTheme(theme);
  const root = documentRef.documentElement;

  if (normalizedTheme !== DEFAULT_THEME) {
    root.setAttribute(THEME_ATTRIBUTE, normalizedTheme);
    return normalizedTheme;
  }

  root.removeAttribute(THEME_ATTRIBUTE);
  return DEFAULT_THEME;
}

function applyLogoText(documentRef, theme) {
  const logo = documentRef.querySelector('#topbar #logo');

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

export function applyPreferences(documentRef, preferences = {}) {
  const normalizedTheme = applyTheme(documentRef, preferences.theme);
  const normalizedDensity = normalizeDensity(preferences.density);
  const root = documentRef.documentElement;

  if (normalizedTheme === TRACKER_THEME && normalizedDensity === COMPACT_DENSITY) {
    root.setAttribute(DENSITY_ATTRIBUTE, COMPACT_DENSITY);
  } else {
    root.removeAttribute(DENSITY_ATTRIBUTE);
  }

  if (normalizedTheme === TRACKER_THEME && preferences.hideBranding === true) {
    root.setAttribute(BRANDING_ATTRIBUTE, 'true');
  } else {
    root.removeAttribute(BRANDING_ATTRIBUTE);
  }

  applyLogoText(documentRef, normalizedTheme);

  return {
    theme: normalizedTheme,
    density: normalizedDensity,
    hideBranding: preferences.hideBranding === true,
  };
}
