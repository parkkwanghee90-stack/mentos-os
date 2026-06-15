'use strict';

// 순수 분류 로직. bucket 객체 키를 confirmed / suspect로 나눈다.
// 규칙(스펙 §4): manifest에 3.1+Aoede로 기록 + known-legacy 아님 → confirmed. 그 외 → suspect.
function classifyClips({ bucketKeys, manifest, knownLegacy = [] }) {
  const legacy = new Set(knownLegacy);
  const confirmed = [];
  const suspect = [];
  for (const key of bucketKeys) {
    const meta = manifest[key];
    const isThreeOne = meta && meta.model === 'gemini-3.1-flash-tts-preview' && meta.voice === 'Aoede';
    if (isThreeOne && !legacy.has(key)) confirmed.push(key);
    else suspect.push(key);
  }
  return { confirmed, suspect };
}

// 4과목(수학 상/하/수1/수2) 범위 판정. 미적분·확통 심화(u<digit>_*)는 범위 밖.
function inFourSubjectScope(key) {
  return !/^u\d/.test(key);
}

module.exports = { classifyClips, inFourSubjectScope };
