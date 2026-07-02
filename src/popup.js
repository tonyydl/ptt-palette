const DEFAULT_THEME = 'default';
const LIGHT_THEME = 'light';
const STORAGE_KEY = 'theme';
const MESSAGE_TYPE = 'PTT_PALETTE_SET_THEME';
const PTT_BBS_URL_PREFIX = 'https://www.ptt.cc/bbs/';

const statusEl = document.querySelector('#status');
const themeInputs = [...document.querySelectorAll('input[name="theme"]')];

function normalizeTheme(value) {
  return value === LIGHT_THEME ? LIGHT_THEME : DEFAULT_THEME;
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

function getActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      callback(undefined);
      return;
    }

    callback(tabs[0]);
  });
}

function sendThemeToActiveTab(theme) {
  getActiveTab((tab) => {
    if (!tab || !tab.id || !tab.url || !tab.url.startsWith(PTT_BBS_URL_PREFIX)) {
      setStatus('Saved. Open a PTT page to see it.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPE, theme }, () => {
      if (chrome.runtime.lastError) {
        setStatus('Saved. Reload the PTT page if it does not update.');
        return;
      }

      setStatus('Applied to this PTT page.');
    });
  });
}

function saveTheme(theme) {
  const normalizedTheme = normalizeTheme(theme);
  setSelectedTheme(normalizedTheme);

  chrome.storage.sync.set({ [STORAGE_KEY]: normalizedTheme }, () => {
    if (chrome.runtime.lastError) {
      setStatus('Could not save theme.');
      return;
    }

    sendThemeToActiveTab(normalizedTheme);
  });
}

chrome.storage.sync.get({ [STORAGE_KEY]: DEFAULT_THEME }, (items) => {
  if (chrome.runtime.lastError) {
    setSelectedTheme(DEFAULT_THEME);
    setStatus('Using default theme.');
    return;
  }

  setSelectedTheme(items[STORAGE_KEY]);
});

for (const input of themeInputs) {
  input.addEventListener('change', () => {
    if (input.checked) {
      saveTheme(input.value);
    }
  });
}
