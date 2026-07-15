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

  it('covers category board lists', () => {
    assertRuleContains(':root[data-ptt-palette-theme="light"] .b-list-container', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .b-ent', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .b-ent', 'border-bottom:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .b-ent:hover', 'background:');
  });

  it('covers article polling status', () => {
    assertRuleContains(':root[data-ptt-palette-theme="light"] #article-polling', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] #article-polling', 'color:');
  });

  it('covers age-confirmation pages', () => {
    assertRuleContains(':root[data-ptt-palette-theme="light"] .over18-notice', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .over18-notice', 'color:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .btn-big', 'background:');
    assertRuleContains(':root[data-ptt-palette-theme="light"] .btn-big', 'color:');
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

  it('turns category board lists into plain office rows', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-list-container', 'max-width:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-ent', 'border: 1px solid var(--pttp-tracker-line)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-ent', 'box-shadow: none');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-ent .board > *', 'float: none');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-ent .board > *', 'min-width: 0');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .b-ent .board > *', 'width: auto');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .board-name', 'font-weight: 700');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .board-nuser', 'text-align: right');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .board-title', 'white-space: nowrap');
  });

  it('uses a neutral office label instead of product-flavored branding', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'color: var(--pttp-tracker-text)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'font-size: 16px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'height: 40px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'line-height: 40px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'padding: 0 10px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar #logo', 'width: auto');
  });

  it('keeps the office topbar compact and aligned', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar', 'display: flex');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar', 'align-items: center');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar', 'gap: 8px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar .board', 'font-size: 16px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] #topbar .right', 'margin-left: auto');
  });

  it('gives office lists more horizontal room without card spacing', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-list-container', 'max-width:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-list-container', 'margin: 0 auto');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-list-container.action-bar-margin', 'margin-top: 56px');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .r-ent', 'max-width: none');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .title', 'overflow: hidden');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .title', 'text-overflow: ellipsis');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .title', 'white-space: nowrap');
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

  it('turns age-confirmation pages into office confirmation panels', () => {
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .over18-notice', 'background: var(--pttp-tracker-surface)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .over18-notice', 'border: 1px solid var(--pttp-tracker-line)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .over18-button-container', 'max-width:');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .btn-big', 'background: var(--pttp-tracker-surface)');
    assertRuleContains(':root[data-ptt-palette-theme="tracker"] .btn-big:hover', 'background: var(--pttp-tracker-pill)');
  });
});
