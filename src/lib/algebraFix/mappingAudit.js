import { normalizeUnitKey, isAlgebraKey } from './algebraUnits.js';

function sizeOf(v) {
  if (!v) return 0;
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'object') return Object.keys(v).length;
  return 0;
}

// sources: { diskFolders?:string[], problemsIndex, avsAnswers, answersMaster, ssotUnits? }
// 대수 키만 대상으로 불일치 리포트 배열 반환.
export function auditMapping(sources) {
  const { problemsIndex = {}, avsAnswers = {}, answersMaster = {}, diskFolders = [] } = sources;
  const SRC = { problemsIndex, avsAnswers, answersMaster };
  const issues = [];

  // 대수 단원키 합집합
  const allKeys = new Set();
  for (const obj of Object.values(SRC)) {
    Object.keys(obj).filter(isAlgebraKey).forEach((k) => allKeys.add(k));
  }
  diskFolders.filter(isAlgebraKey).forEach((k) => allKeys.add(k));

  // KEY_PRESENCE: 소스 간 존재 여부 차이
  for (const key of allKeys) {
    const presentIn = Object.entries(SRC).filter(([, o]) => key in o).map(([n]) => n);
    const missingFrom = Object.keys(SRC).filter((n) => !(key in SRC[n]));
    if (presentIn.length > 0 && missingFrom.length > 0) {
      issues.push({ type: 'KEY_PRESENCE', key, presentIn, missingFrom });
    }
  }

  // EMPTY_SHELL: 어떤 소스에서 값이 0개
  for (const key of allKeys) {
    for (const [name, obj] of Object.entries(SRC)) {
      if (key in obj && sizeOf(obj[key]) === 0) {
        issues.push({ type: 'EMPTY_SHELL', key, source: name });
      }
    }
  }

  // SIZE_MISMATCH: 같은 키의 소스 간 항목수 차이
  for (const key of allKeys) {
    const sizes = Object.fromEntries(
      Object.entries(SRC).filter(([, o]) => key in o).map(([n, o]) => [n, sizeOf(o[key])])
    );
    const vals = Object.values(sizes).filter((n) => n > 0);
    if (vals.length > 1 && new Set(vals).size > 1) {
      issues.push({ type: 'SIZE_MISMATCH', key, sizes });
    }
  }

  // ROOT_VARIANT: 동일 (정규화 stage) 내 성질↔활용 등 루트 변형 공존
  const byStage = {};
  for (const key of allKeys) {
    const { root, stage } = normalizeUnitKey(key);
    if (!stage) continue;
    (byStage[stage] ||= []).push({ key, root });
  }
  for (const [stage, arr] of Object.entries(byStage)) {
    const roots = new Set(arr.map((a) => a.root));
    const hasSung = [...roots].some((r) => r.includes('성질'));
    const hasHwal = [...roots].some((r) => r.includes('활용'));
    if (hasSung && hasHwal) {
      issues.push({ type: 'ROOT_VARIANT', stage, keys: arr.map((a) => a.key) });
    }
  }

  return issues;
}
