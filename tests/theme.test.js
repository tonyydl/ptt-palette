import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { applyTheme, normalizeTheme, THEME_ATTRIBUTE } from "../src/theme.js";

function createDocument() {
  return new JSDOM("<!doctype html><html><body></body></html>").window.document;
}

it("normalizeTheme accepts supported theme values", () => {
  assert.equal(normalizeTheme("default"), "default");
  assert.equal(normalizeTheme("light"), "light");
});

it("normalizeTheme defaults missing and invalid values", () => {
  assert.equal(normalizeTheme(undefined), "default");
  assert.equal(normalizeTheme(null), "default");
  assert.equal(normalizeTheme("sepia"), "default");
});

describe("applyTheme", () => {
  it("sets the light theme attribute", () => {
    const document = createDocument();

    applyTheme(document, "light");

    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), "light");
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
    assert.equal(applyTheme(document, "bad-value"), "default");
  });
});
