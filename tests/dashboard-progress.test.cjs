const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync('index.html', 'utf8');
const match = source.match(/const hitungPersenKunjungan = \(target, dikunjungi\) => \{([\s\S]*?)\n\s*\};/);
assert.ok(match, 'dashboard progress helper exists in application source');
const hitungPersenKunjungan = new Function('target', 'dikunjungi', match[1]);

test('dashboard progress is derived from live target and completed count', () => {
  assert.equal(hitungPersenKunjungan(12, 8), 67);
});

test('dashboard progress handles zero/missing target and never exceeds 100', () => {
  assert.equal(hitungPersenKunjungan(0, 0), 0);
  assert.equal(hitungPersenKunjungan(undefined, 2), 0);
  assert.equal(hitungPersenKunjungan(5, 8), 100);
});
