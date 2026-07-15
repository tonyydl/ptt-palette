# Manual Verification

## Load Unpacked Extension

1. Open Chrome or Edge.
2. Go to `chrome://extensions` or `edge://extensions`.
3. Enable Developer mode.
4. Select "Load unpacked".
5. Choose the folder containing `manifest.json`; for this worktree, use `C:\Users\S2403004\code\workspace\ptt-palette\.worktrees\ptt-palette-extension`.
6. Confirm the extension named `PTT Palette` appears without manifest errors.

## Test Pages

- `https://www.ptt.cc/bbs/index.html`
- `https://www.ptt.cc/bbs/Gossiping/index.html`
- `https://www.ptt.cc/ask/over18?from=%2Fbbs%2FGossiping%2Findex.html`
- `https://www.ptt.cc/cls/3652`
- Any readable article URL under `https://www.ptt.cc/bbs/*/M.*.html`

## Checks

- Default is selected on first install.
- Default mode leaves PTT visually unchanged.
- Selecting Light updates the current PTT page without reload.
- Reloading the page preserves Light.
- Opening another supported PTT page applies Light automatically.
- Selecting Default removes `data-ptt-palette-theme` from the document root.
- Non-PTT pages do not receive PTT Palette styling.
- No extension errors appear in extension details/errors, the popup console, or the page console during normal toggling.

## Automated Browser Verification

1. Run `npm run playwright:install` once to install Playwright's Chromium browser.
2. Run `npm run test:e2e` to load the unpacked extension in Chromium and verify Office theme rendering on hot boards, category pages, and the over-18 confirmation page.
3. Run `npm run test:all` before release-level changes.

Playwright screenshots and traces are written under `test-results/` and are intentionally ignored by git.
