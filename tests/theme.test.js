import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import {
  BRANDING_ATTRIBUTE,
  DENSITY_ATTRIBUTE,
  applyPreferences,
  applyTheme,
  normalizeDensity,
  normalizeTheme,
  THEME_ATTRIBUTE,
} from "../src/theme.js";

function createDocument() {
  return new JSDOM("<!doctype html><html><body></body></html>").window.document;
}

function createPttDocument() {
  return new JSDOM(`
    <!doctype html>
    <html>
      <body>
        <div id="topbar">
          <a id="logo" href="/bbs/">批踢踢實業坊</a>
        </div>
      </body>
    </html>
  `).window.document;
}

it("normalizeTheme accepts supported theme values", () => {
  assert.equal(normalizeTheme("default"), "default");
  assert.equal(normalizeTheme("light"), "light");
  assert.equal(normalizeTheme("tracker"), "tracker");
});

it("normalizeTheme defaults missing and invalid values", () => {
  assert.equal(normalizeTheme(undefined), "default");
  assert.equal(normalizeTheme(null), "default");
  assert.equal(normalizeTheme("sepia"), "default");
});

it("normalizeDensity accepts compact and defaults other values", () => {
  assert.equal(normalizeDensity("comfortable"), "comfortable");
  assert.equal(normalizeDensity("compact"), "compact");
  assert.equal(normalizeDensity(undefined), "comfortable");
  assert.equal(normalizeDensity("dense"), "comfortable");
});

describe("applyTheme", () => {
  it("sets the light theme attribute", () => {
    const document = createDocument();

    applyTheme(document, "light");

    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), "light");
  });

  it("sets the tracker theme attribute", () => {
    const document = createDocument();

    applyTheme(document, "tracker");

    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), "tracker");
  });

  it("removes the theme attribute for default", () => {
    const document = createDocument();
    document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

    applyTheme(document, "default");

    assert.equal(document.documentElement.hasAttribute(THEME_ATTRIBUTE), false);
  });

  it("treats invalid themes as default", () => {
    const document = createDocument();
    document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

    applyTheme(document, "sepia");

    assert.equal(document.documentElement.hasAttribute(THEME_ATTRIBUTE), false);
  });

  it("can reapply light idempotently", () => {
    const document = createDocument();

    applyTheme(document, "light");
    applyTheme(document, "light");

    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), "light");
  });

  it("returns the normalized applied theme", () => {
    const document = createDocument();

    assert.equal(applyTheme(document, "light"), "light");
    assert.equal(applyTheme(document, "tracker"), "tracker");
    assert.equal(applyTheme(document, "bad-value"), "default");
  });
});

describe("applyPreferences", () => {
  it("sets theme, compact density, and hidden branding attributes", () => {
    const document = createDocument();

    applyPreferences(document, {
      theme: "tracker",
      density: "compact",
      hideBranding: true,
    });

    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), "tracker");
    assert.equal(document.documentElement.getAttribute(DENSITY_ATTRIBUTE), "compact");
    assert.equal(document.documentElement.getAttribute(BRANDING_ATTRIBUTE), "true");
  });

  it("removes non-default preference attributes when preferences reset", () => {
    const document = createDocument();
    document.documentElement.setAttribute(THEME_ATTRIBUTE, "tracker");
    document.documentElement.setAttribute(DENSITY_ATTRIBUTE, "compact");
    document.documentElement.setAttribute(BRANDING_ATTRIBUTE, "true");

    applyPreferences(document, {
      theme: "default",
      density: "comfortable",
      hideBranding: false,
    });

    assert.equal(document.documentElement.hasAttribute(THEME_ATTRIBUTE), false);
    assert.equal(document.documentElement.hasAttribute(DENSITY_ATTRIBUTE), false);
    assert.equal(document.documentElement.hasAttribute(BRANDING_ATTRIBUTE), false);
  });

  it("renames the PTT logo in tracker mode and restores it outside tracker mode", () => {
    const document = createPttDocument();
    const logo = document.querySelector("#logo");

    applyPreferences(document, { theme: "tracker" });

    assert.equal(logo.textContent, "Office");
    assert.equal(logo.dataset.pttPaletteOriginalText, "批踢踢實業坊");

    applyPreferences(document, { theme: "light" });

    assert.equal(logo.textContent, "批踢踢實業坊");
  });
});
