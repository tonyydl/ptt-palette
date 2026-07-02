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

describe('tracker theme CSS coverage', () => {
  it('defines the tracker theme root and office surface tokens', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"]', '--pttp-tracker-bg:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] body', 'background:');
  });

  it('turns article lists into issue-tracker rows', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-ent', 'border:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .nrec', 'border-radius:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .title a', 'color:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .meta', 'color:');
  });

  it('turns article pages into documents with comment threads', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #main-content', 'max-width:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .article-metaline', 'border-bottom:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .push', 'border-left:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #article-polling', 'background:');
  });
});
