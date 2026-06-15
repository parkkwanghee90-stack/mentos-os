'use strict';

// 재생성 러너용 순수 할당량/재개 로직 (I/O 없음).

// 이미 처리된(done) 키를 제외한 남은 작업 목록.
function remainingWork(suspect, progress = { done: [] }) {
  const done = new Set((progress && progress.done) || []);
  return suspect.filter(item => !done.has(item.key));
}

// 이번 실행에서 처리할 배치(일일 한도만큼).
function takeBatch(items, limit) {
  return items.slice(0, Math.max(0, limit));
}

// Gemini 일일 할당량 소진 여부 판정(429 / RESOURCE_EXHAUSTED / quota).
function isQuotaExhausted(err) {
  if (!err) return false;
  if (err.status === 429) return true;
  const msg = String(err.message || '');
  return /RESOURCE_EXHAUSTED|quota|429/i.test(msg);
}

module.exports = { remainingWork, takeBatch, isQuotaExhausted };
