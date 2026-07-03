const DEFAULT_THEME = 'default';
const LIGHT_THEME = 'light';
const TRACKER_THEME = 'tracker';
const COMFORTABLE_DENSITY = 'comfortable';
const COMPACT_DENSITY = 'compact';
const STORAGE_KEY = 'theme';
const DENSITY_STORAGE_KEY = 'density';
const HIDE_BRANDING_STORAGE_KEY = 'hideBranding';
const MESSAGE_TYPE = 'PTT_PALETTE_SET_THEME';
const PTT_BBS_URL_PREFIX = 'https://www.ptt.cc/bbs/';

const statusEl = document.querySelector('#status');
const themeInputs = [...document.querySelectorAll('input[name="theme"]')];
const densityInputs = [...document.querySelectorAll('input[name="density"]')];
const hideBrandingInput = document.querySelector('#hide-branding');

function normalizeTheme(value) {
  return value === LIGHT_THEME || value === TRACKER_THEME ? value : DEFAULT_THEME;
}

function normalizeDensity(value) {
  return value === COMPACT_DENSITY ? COMPACT_DENSITY : COMFORTABLE_DENSITY;
}

function setStatus(message) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
}

function setSelectedTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);

  for (const input of themeInputs) {
    input.checked = input.value === normalizedTheme;
  }
}

function setSelectedDensity(density) {
  const normalizedDensity = normalizeDensity(density);

  for (const input of densityInputs) {
    input.checked = input.value === normalizedDensity;
  }
}

function setHideBranding(hideBranding) {
  if (hideBrandingInput) {
    hideBrandingInput.checked = hideBranding === true;
  }
}

function getSelectedTheme() {
  return normalizeTheme(themeInputs.find((input) => input.checked)?.value);
}

function getSelectedDensity() {
  return normalizeDensity(densityInputs.find((input) => input.checked)?.value);
}

function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      callback(undefined);
      return;
    }

    callback(tabs[0]);
  });
}

function sendPreferencesToActiveTab(preferences) {
  getActiveTab((tab) => {
    if (!tab || !tab.id || !tab.url || !tab.url.startsWith(PTT_BBS_URL_PREFIX)) {
      setStatus('Saved. Open a PTT page to see it.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPE, ...preferences }, () => {
      if (chrome.runtime.lastError) {
        setStatus('Saved. Reload the PTT page if it does not update.');
        return;
      }

      setStatus('Applied to this PTT page.');
    });
  });
}

function savePreferences(preferences) {
  const normalizedPreferences = {
    theme: normalizeTheme(preferences.theme),
    density: normalizeDensity(preferences.density),
    hideBranding: preferences.hideBranding === true,
  };

  setSelectedTheme(normalizedPreferences.theme);
  setSelectedDensity(normalizedPreferences.density);
  setHideBranding(normalizedPreferences.hideBranding);

  chrome.storage.sync.set({
    [STORAGE_KEY]: normalizedPreferences.theme,
    [DENSITY_STORAGE_KEY]: normalizedPreferences.density,
    [HIDE_BRANDING_STORAGE_KEY]: normalizedPreferences.hideBranding,
  }, () => {
    if (chrome.runtime.lastError) {
      setStatus('Could not save settings.');
      return;
    }

    sendPreferencesToActiveTab(normalizedPreferences);
  });
}

chrome.storage.sync.get({
  [STORAGE_KEY]: DEFAULT_THEME,
  [DENSITY_STORAGE_KEY]: COMFORTABLE_DENSITY,
  [HIDE_BRANDING_STORAGE_KEY]: false,
}, (items) => {
  if (chrome.runtime.lastError) {
    setSelectedTheme(DEFAULT_THEME);
    setSelectedDensity(COMFORTABLE_DENSITY);
    setHideBranding(false);
    setStatus('Using default theme.');
    return;
  }

  setSelectedTheme(items[STORAGE_KEY]);
  setSelectedDensity(items[DENSITY_STORAGE_KEY]);
  setHideBranding(items[HIDE_BRANDING_STORAGE_KEY]);
});

for (const input of themeInputs) {
  input.addEventListener('change', () => {
    if (input.checked) {
      savePreferences({
        theme: input.value,
        density: getSelectedDensity(),
        hideBranding: hideBrandingInput?.checked,
      });
    }
  });
}

for (const input of densityInputs) {
  input.addEventListener('change', () => {
    if (input.checked) {
      savePreferences({
        theme: getSelectedTheme(),
        density: input.value,
        hideBranding: hideBrandingInput?.checked,
      });
    }
  });
}

hideBrandingInput?.addEventListener('change', () => {
  savePreferences({
    theme: getSelectedTheme(),
    density: getSelectedDensity(),
    hideBranding: hideBrandingInput.checked,
  });
});
