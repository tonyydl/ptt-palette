import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const css = readFileSync(new URL('../src/theme-light.css', import.meta.url), 'utf8');

function assertContains(selector) {
  assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

function assertRuleContains(selector, declaration) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedDeclaration = declaration.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  assert.match(css, new RegExp(`${escapedSelector}[^{}]*\\{[^}]*${escapedDeclaration}`));
}

describe('light theme CSS coverage', () => {
  it('overrides article metadata backgrounds that PTT sets directly', () => {
    assertRuleContains(':root[data-ptt-palette-theme="light"] .article-meta-tag', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .article-meta-value', 'background:');
  });

  it('covers fixed top and board-list controls', () => {
    assertContains(':root[data-ptt-palette-theme="light"] #topbar-container');
    assertContains(':root[data-ptt-palette-theme="light"] #action-bar-container');
    assertContains(':root[data-ptt-palette-theme="light"] .btn');
    assertContains(':root[data-ptt-palette-theme="light"] .search-bar .query');
  });

  it('covers article polling status', () => {
    assertRuleContains(':root[data-ptt-palette-theme="light"] #article-polling', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] #article-polling', 'color:');
  });
});
