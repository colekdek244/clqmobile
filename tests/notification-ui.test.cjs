const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync('index.html', 'utf8');

test('header notification button opens completed-visit list from report data', () => {
  assert.match(source, /title="Notifikasi Kunjungan Selesai"[\s\S]*aria-label="Buka notifikasi kunjungan selesai"/);
  assert.match(source, /aria-label="Buka notifikasi kunjungan selesai"[\s\S]*?<svg aria-hidden="true" viewBox="0 0 24 24"/);
  assert.doesNotMatch(source, /\bBell\b/);
  assert.match(source, /title="Refresh" onClick=\{handleGlobalRefresh\}/);
  assert.match(source, /const visitProgressPercent = hitungPersenKunjungan\(targetCount, visitedCount\)/);
  assert.match(source, /Nasabah<\/span>/);
  assert.match(source, /visitProgressPercent/);
  assert.match(source, /Lihat Daftar/);
  assert.match(source, /setActiveTab\('visit'\)/);
  assert.match(source, /Pilih rentang tanggal lalu tekan Tampilkan/);
  assert.match(source, /w-10 h-10 p-2\.5 bg-blue-600\/80/);
  assert.doesNotMatch(source, /<button onClick=\{handleLogout\}[^>]*title="Logout"/);
  assert.match(source, /onClick=\{\(\) => \{ setShowVisitNotifications\(true\); handleFetchReport\(reportFilterDateStart, reportFilterDateEnd\); \}\}/);
  assert.match(source, /showVisitNotifications &&/);
  assert.match(source, /Notifikasi Kunjungan/);
  assert.match(source, /reportData\.map\(\(row, idx\)/);
  assert.match(source, /<nav className="fixed bottom-0/);
  assert.match(source, /background: 'linear-gradient\(115deg,#102f5e,#071d3f\)'/);
  assert.match(source, /flex flex-1 flex-col items-center/g);
  assert.match(source, /<span className="text-\[10px\] uppercase tracking-tighter">Keluar<\/span>/);
  assert.match(source, /<button onClick=\{handleLogout\}[\s\S]*<LogOut className="w-5 h-5" \/>[\s\S]*Keluar/);
  assert.doesNotMatch(source, /<button onClick=\{handleLogout\} className="p-2 bg-red-500/);
});

test('screen wake lock is automatically requested after login and app visibility', () => {
  assert.match(source, /if \(appUser && document\.visibilityState === 'visible'\) requestWakeLock\(\)/);
  assert.match(source, /document\.visibilityState === 'visible' && appUser[\s\S]*requestWakeLock\(\)/);
  assert.doesNotMatch(source, /title="Mode Layar Terjaga"/);
});
