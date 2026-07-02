import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const html = readFileSync(new URL('../src/popup.html', import.meta.url), 'utf8');

describe('popup theme labels', () => {
  it('presents tracker mode as Office without changing the saved value', () => {
    assert.match(html, /<input type="radio" name="theme" value="tracker">/);
    assert.match(html, /<span>Office<\/span>/);
    assert.doesNotMatch(html, /<span>Tracker<\/span>/);
  });
});
