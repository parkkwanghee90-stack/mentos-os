/** 난이도 상향 트래커: 학교별 상태(done/deferred/needs_review/needs_source) 관리. */
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'difficulty_progress.json');
const LISTS = ['done', 'deferred', 'needs_review', 'needs_source'];
const key = (grade, slug) => `${grade}:${slug}`;

function load(file = FILE) {
  const t = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const l of LISTS) if (!Array.isArray(t[l])) t[l] = [];
  return t;
}
function save(t, file = FILE) {
  fs.writeFileSync(file, JSON.stringify(t, null, 2));
}
function status(t, grade, slug) {
  for (const l of LISTS) if ((t[l] || []).some(e => e.grade === grade && e.slug === slug)) return l;
  return null;
}
function mark(t, grade, slug, st, extra = {}) {
  if (!LISTS.includes(st)) throw new Error(`bad status: ${st}`);
  for (const l of LISTS) t[l] = (t[l] || []).filter(e => !(e.grade === grade && e.slug === slug));
  t[st].push({ grade, slug, ...extra });
  return t;
}
function isLimitSignal(text) {
  return /session limit|weekly limit|usage limit|토큰.{0,4}한도|한도.{0,6}리셋|resets \d/i.test(String(text || ''));
}

module.exports = { load, save, status, mark, key, isLimitSignal, LISTS, FILE };
