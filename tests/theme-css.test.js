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
    assertRuleContains(':root[data-ptt-palette-theme="light"] #topbar #logo', 'color: var(--pttp-text)');
    assertRuleContains(':root[data-ptt-palette-theme="light"] #topbar #logo:link', 'color: var(--pttp-text)');
    assertRuleContains(':root[data-ptt-palette-theme="light"] #topbar #logo:visited', 'color: var(--pttp-text)');
    assertRuleContains(':root[data-ptt-palette-theme="light"] #topbar #logo', 'background: transparent');
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

  it('turns article lists into plain office rows', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-ent', 'border:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-ent', 'border-radius: 0');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-ent', 'box-shadow: none');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .nrec', 'background: transparent');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .title a', 'color:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .meta', 'color:');
  });

  it('uses a neutral office label instead of product-flavored branding', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'color: var(--pttp-tracker-text)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'font-size: 16px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'height: 40px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'line-height: 40px');
  });

  it('turns article pages into documents with comment threads', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #main-content', 'max-width:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .article-metaline', 'border-bottom:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .push', 'border-left:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #article-polling', 'background:');
  });

  it('supports compact density for office scanning', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"][data-ptt-palette-density="compact"] .r-ent', 'padding:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"][data-ptt-palette-density="compact"] .title', 'font-size:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"][data-ptt-palette-density="compact"] #main-content', 'line-height:');
  });

  it('can hide remaining PTT branding in office mode', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"][data-ptt-palette-hide-branding="true"] #logo', 'display: none');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"][data-ptt-palette-hide-branding="true"] #topbar .right', 'display: none');
  });
});
