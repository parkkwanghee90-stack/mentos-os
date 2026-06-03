// 매핑 삭제 러너 (T8, 개정) — 백업 잔재 키 + 빈 성질3 키 제거.
// 승인: scripts/approvals/mapping_deletes.json
// 가드: problems_index 백업키는 비접미 base 단원이 동일 파일에 존재할 때만 삭제(데이터 손실 방지).
//       avs_answers 키는 값이 비어 있을 때만 삭제(빈 껍데기/백업만 제거).
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const p = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));

const FILE_MAP = {
  problemsIndex: 'public/problems_index.json',
  avsAnswers: 'public/data/avs_answers.json',
};

const BACKUP_SUFFIX = /(_백업_완료|_완료백업)$/;
const baseUnitOf = (key) => key.replace(BACKUP_SUFFIX, '');
const sizeOf = (v) => (Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 0);

const approvals = readJson('scripts/approvals/mapping_deletes.json');
const log = [];

for (const [srcKey, rel] of Object.entries(FILE_MAP)) {
  const keys = approvals.deletes[srcKey] || [];
  if (!keys.length) continue;
  fs.copyFileSync(p(rel), p(rel) + '.map.bak'); // 백업 먼저
  const data = readJson(rel);
  const next = { ...data };
  for (const key of keys) {
    if (!(key in next)) { log.push(`SKIP ${srcKey}: '${key}' 없음`); continue; }
    if (srcKey === 'problemsIndex' && BACKUP_SUFFIX.test(key)) {
      const base = baseUnitOf(key);
      if (!(base in next)) { log.push(`GUARD ${srcKey}: '${key}' 비접미 base '${base}' 없음 → 보존(삭제 안 함)`); continue; }
    }
    if (srcKey === 'avsAnswers' && sizeOf(next[key]) > 0) {
      log.push(`GUARD ${srcKey}: '${key}' 값 ${sizeOf(next[key])}개(비어있지 않음) → 보존(삭제 안 함)`); continue;
    }
    delete next[key];
    log.push(`DELETE ${srcKey}: '${key}'`);
  }
  fs.writeFileSync(p(rel), JSON.stringify(next, null, 2));
}

const md = ['# 매핑 삭제 적용 로그 (2026-06-02)', '', `총 ${log.length}건 처리`, '', ...log.map((l) => `- ${l}`)].join('\n');
fs.mkdirSync(p('docs/superpowers/specs'), { recursive: true });
fs.writeFileSync(p('docs/superpowers/specs/2026-06-02-mapping-delete-log.md'), md);
console.log(`[fix-mapping-delete] ${log.filter((l) => l.startsWith('DELETE')).length} deleted, ${log.filter((l) => !l.startsWith('DELETE')).length} skipped/guarded`);
