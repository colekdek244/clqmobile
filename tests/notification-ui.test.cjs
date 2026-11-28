const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync('index.html', 'utf8');

test('header notification button opens completed-visit list from report data', () => {
  assert.match(source, /Bell className=/);
  assert.match(source, /onClick=\{\(\) => \{ setShowVisitNotifications\(true\); handleFetchReport\(reportFilterDateStart, reportFilterDateEnd\); \}\}/);
  assert.match(source, /showVisitNotifications &&/);
  assert.match(source, /Notifikasi Kunjungan/);
  assert.match(source, /reportData\.map\(\(row, idx\)/);
  assert.match(source, /Belum ada kunjungan selesai/);
});

test('screen wake lock is automatically requested after login and app visibility', () => {
  assert.match(source, /if \(appUser && document\.visibilityState === 'visible'\) requestWakeLock\(\)/);
  assert.match(source, /document\.visibilityState === 'visible' && appUser[\s\S]*requestWakeLock\(\)/);
  assert.doesNotMatch(source, /title="Mode Layar Terjaga"/);
});
