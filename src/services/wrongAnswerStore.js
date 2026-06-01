export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30일
const STORAGE_KEY = 'mentos_wrong_answers';

// ─── 순수 헬퍼 (테스트 대상) ───────────────────────────────

/** (hwId,num) 기준 upsert. 재오답 시 resolved 해제·lastSeen 갱신, firstWrongAt 유지 */
export function upsertWrong(entries, { hwId, num, unit, answerKey }, now) {
  const idx = entries.findIndex(e => e.hwId === hwId && e.num === num);
  if (idx === -1) {
    return [
      ...entries,
      { hwId, num, unit, answerKey, firstWrongAt: now, lastSeenAt: now, resolved: false, resolvedAt: null },
    ];
  }
  return entries.map((e, i) =>
    i === idx ? { ...e, unit, answerKey, lastSeenAt: now, resolved: false, resolvedAt: null } : e
  );
}

/** 정답 처리됨으로 마킹(목록 유지) */
export function applyResolved(entries, hwId, num, now) {
  return entries.map(e =>
    e.hwId === hwId && e.num === num
      ? { ...e, resolved: true, resolvedAt: now, lastSeenAt: now }
      : e
  );
}

/** firstWrongAt + 30일 이내 항목만 반환(resolved 포함) */
export function computeActive(entries, now) {
  return entries.filter(e => now - e.firstWrongAt <= RETENTION_MS);
}

// ─── localStorage 래퍼 ─────────────────────────────────────

function read() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function write(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** 오답 1건 기록 */
export function addWrong(entry, now = Date.now()) {
  const next = upsertWrong(read(), entry, now);
  write(next);
  return next;
}

/** 정답 처리 마킹 */
export function markResolved(hwId, num, now = Date.now()) {
  const next = applyResolved(read(), hwId, num, now);
  write(next);
  return next;
}

/** 만료(30일 초과) 제거 후 활성 오답 반환 */
export function getActiveWrongAnswers(now = Date.now()) {
  const active = computeActive(read(), now);
  write(active); // 만료분 영구 제거
  return active;
}
