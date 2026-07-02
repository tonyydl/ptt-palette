import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { applyTheme, normalizeTheme, THEME_ATTRIBUTE } from "../src/theme.js";

test("normalizeTheme accepts supported theme values", () => {
  assert.equal(normalizeTheme("default"), "default");
  assert.equal(normalizeTheme("light"), "light");
});

test("normalizeTheme defaults missing and invalid values", () => {
  assert.equal(normalizeTheme(undefined), "default");
  assert.equal(normalizeTheme(null), "default");
  assert.equal(normalizeTheme("sepia"), "default");
});

test("applyTheme sets the light theme attribute", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");

  applyTheme(dom.window.document, "light");

  assert.equal(
    dom.window.document.documentElement.getAttribute(THEME_ATTRIBUTE),
    "light",
  );
});

test("applyTheme removes the theme attribute for default", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  dom.window.document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

  applyTheme(dom.window.document, "default");

  assert.equal(
    dom.window.document.documentElement.hasAttribute(THEME_ATTRIBUTE),
    false,
  );
});

test("applyTheme treats invalid themes as default", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  dom.window.document.documentElement.setAttribute(THEME_ATTRIBUTE, "light");

  applyTheme(dom.window.document, "sepia");

  assert.equal(
    dom.window.document.documentElement.hasAttribute(THEME_ATTRIBUTE),
    false,
  );
});

test("applyTheme can reapply light idempotently", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>");

  applyTheme(dom.window.document, "light");
  applyTheme(dom.window.document, "light");

  assert.equal(
    dom.window.document.documentElement.getAttribute(THEME_ATTRIBUTE),
    "light",
  );
});
