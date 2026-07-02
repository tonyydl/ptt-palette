# PTT Palette Design Spec

## Summary

PTT Palette is a Chrome/Edge browser extension that lets users switch PTT Web pages under `https://www.ptt.cc/bbs/*` from the default black theme to a readable light theme. The first release focuses on a simple, reliable theme toggle: Default keeps PTT unchanged, and Light applies a carefully scoped CSS theme.

The extension display name is `PTT Palette`. The project folder is `ptt-palette`.

## Goals

- Support Chrome and Edge using Manifest V3.
- Apply only to `https://www.ptt.cc/bbs/*`.
- Provide a popup UI with a Default / Light theme toggle.
- Persist the user's selected theme across browsing sessions.
- Apply the selected theme on PTT board index pages, article list pages, and article content pages.
- Preserve PTT's information density, typography rhythm, and color semantics where practical.
- Fail softly: if extension storage or messaging fails, PTT remains usable in its original style.

## Non-Goals

- Firefox support in the first release.
- Custom user-created themes.
- Multiple packaged themes beyond Light.
- Changing PTT layout, navigation, sorting, login behavior, or content.
- Supporting PTT pages outside `/bbs/*`, including login and age confirmation pages.
- Publishing to extension stores as part of the first implementation plan.

## Product Experience

The user installs the extension and visits a PTT page under `https://www.ptt.cc/bbs/*`. By default, PTT remains visually unchanged. When the user opens the extension popup, they can choose either:

- `Default`: remove PTT Palette styling and use PTT's original theme.
- `Light`: apply a light background, dark body text, softened dividers, readable link colors, and adjusted PTT status colors.

The choice is saved. Reloading a PTT page or opening another `/bbs/*` page applies the saved setting automatically.

## Recommended Approach

Use a CSS class/theme-attribute engine.

The content script manages a single DOM attribute on the document root:

```html
<html data-ptt-palette-theme="light">
```

When the selected theme is `Default`, the content script removes the attribute. Theme CSS is always available to the matched page, but its rules are scoped under `[data-ptt-palette-theme="light"]`, so it only affects pages when the attribute is present.

This approach keeps the implementation simple, makes theme application deterministic, and leaves a clean path for future themes such as Sepia or High Contrast.

## Architecture

### Manifest

The extension uses Manifest V3 and declares:

- `content_scripts` for `https://www.ptt.cc/bbs/*`
- `storage` permission for saving theme preference
- `activeTab` permission only if needed for immediate popup-to-tab updates
- an extension popup

### Content Script

The content script is responsible for:

- Reading the saved theme from extension storage when a PTT page loads.
- Applying the theme by setting or removing `data-ptt-palette-theme`.
- Listening for popup messages so theme changes apply immediately to the active PTT tab.
- Keeping behavior idempotent so repeated messages do not accumulate duplicate DOM state.

### Theme CSS

The light theme CSS is responsible for:

- Setting page background and base text colors.
- Updating common PTT containers such as top bars, board list rows, article list rows, and article content blocks.
- Preserving meaningful PTT cues such as push/recommendation colors, metadata, links, visited states, and warning/error text.
- Avoiding layout changes except where minor contrast or spacing fixes are needed.

All light theme rules must be scoped under:

```css
[data-ptt-palette-theme="light"] {
}
```

or descendants of that selector.

### Popup

The popup provides a compact Default / Light control. It is responsible for:

- Reading the current saved theme when opened.
- Updating `chrome.storage.sync` when the user changes the selection.
- Sending a message to the active PTT tab so the visible page updates without reload.
- Showing the saved state even if the current active tab is not a PTT page.

## Data Model

The stored preference is a small string value:

```json
{
  "theme": "default"
}
```

Allowed values:

- `default`
- `light`

If the value is missing, invalid, or unreadable, the extension treats it as `default`.

## Data Flow

### Page Load

1. User opens a matched PTT URL.
2. Content script loads.
3. Content script reads `theme` from `chrome.storage.sync`.
4. If `theme` is `light`, content script sets `data-ptt-palette-theme="light"` on `document.documentElement`.
5. If `theme` is `default` or invalid, content script removes `data-ptt-palette-theme`.

### Popup Toggle

1. User opens the extension popup.
2. Popup reads `theme` from storage and reflects it in the control.
3. User selects Default or Light.
4. Popup writes the selected value to storage.
5. Popup sends a message to the active tab with the selected theme.
6. Content script applies the theme immediately if the active tab is a matched PTT page.

## Error Handling

- Storage read failure: use `default`.
- Storage write failure: keep the popup usable and avoid changing page state incorrectly.
- Message send failure: ignore when the active tab is not a PTT `/bbs/*` page; the saved theme still applies on future matched page loads.
- Invalid stored value: normalize to `default`.
- Missing PTT DOM elements: CSS selectors should degrade naturally; content script must not depend on page-specific elements beyond `document.documentElement`.

## Test Strategy

### Automated Checks

Use lightweight tests around the theme application logic:

- Applying `light` sets `data-ptt-palette-theme="light"`.
- Applying `default` removes `data-ptt-palette-theme`.
- Invalid values behave as `default`.
- Reapplying the same value is idempotent.

If the implementation uses bundled JavaScript modules, tests should run in Node with a DOM test environment such as jsdom. If the implementation stays dependency-free, the logic should be isolated so it can still be tested without Chrome APIs.

### Manual Browser Verification

Load the unpacked extension in Chrome or Edge and verify:

- `https://www.ptt.cc/bbs/index.html` renders correctly in Default and Light.
- A board article list page renders correctly in Default and Light.
- An article content page renders correctly in Default and Light.
- Popup selection updates the current PTT page without reload.
- Reloading a PTT page preserves the selected theme.
- Non-PTT pages are not visually affected.

## Acceptance Criteria

- The extension can be loaded unpacked in Chrome/Edge.
- The popup exposes a Default / Light toggle.
- The selected theme is persisted.
- Light theme applies to all `https://www.ptt.cc/bbs/*` pages through a document root theme attribute.
- Default mode removes the theme attribute and leaves PTT visually unchanged.
- No extension errors appear during normal theme toggling on matched PTT pages.
- The implementation includes automated tests for theme application logic and a manual verification checklist.

