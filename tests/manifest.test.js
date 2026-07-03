import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

describe('manifest PTT page coverage', () => {
  it('injects the extension into board pages and age-confirmation pages', () => {
    assert.deepEqual(manifest.host_permissions, [
      'https://www.ptt.cc/bbs/*',
      'https://www.ptt.cc/ask/*',
    ]);
    assert.deepEqual(manifest.content_scripts[0].matches, [
      'https://www.ptt.cc/bbs/*',
      'https://www.ptt.cc/ask/*',
    ]);
  });
});
