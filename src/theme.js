export const THEME_ATTRIBUTE = 'data-ptt-palette-theme';
export const DEFAULT_THEME = 'default';
export const LIGHT_THEME = 'light';
export const STORAGE_KEY = 'theme';

export function normalizeTheme(value) {
  return value === LIGHT_THEME ? LIGHT_THEME : DEFAULT_THEME;
}

export function applyTheme(documentRef, theme) {
  const normalizedTheme = normalizeTheme(theme);
  const root = documentRef.documentElement;

  if (normalizedTheme === LIGHT_THEME) {
    root.setAttribute(THEME_ATTRIBUTE, LIGHT_THEME);
    return LIGHT_THEME;
  }

  root.removeAttribute(THEME_ATTRIBUTE);
  return DEFAULT_THEME;
}
