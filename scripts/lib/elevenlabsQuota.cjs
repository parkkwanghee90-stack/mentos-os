'use strict';

// ElevenLabs 글자수 한도/재개 순수 로직 (I/O 없음).
function remaining(items, progress = { done: [] }) {
  const done = new Set((progress && progress.done) || []);
  return items.filter(it => !done.has(it.key));
}

function wouldExceed(usedChars, nextChars, limit) {
  return (usedChars + nextChars) > limit;
}

function isQuotaError(err) {
  if (!err) return false;
  if (err.status === 429 || err.status === 401 || err.status === 402) return true;
  const msg = String(err.message || '');
  return /quota|character_limit|unauthorized|payment/i.test(msg);
}

module.exports = { remaining, wouldExceed, isQuotaError };
