import { HOMEWORK_UNITS } from '../../data/homeworkSSOT.js';

// 대수(수학1) 단원 루트 키워드. homeworkSSOT relatedUnit + JSON 키 명칭 차이를 흡수하는 안정 토큰.
const ALGEBRA_ROOT_TOKENS = [
  '지수', '로그', '지수로그함수', '삼각함수', '삼각함수성질', '삼각함수그래프',
  '삼각함수활용', '등차등비', '수열', '수열의합', '귀납',
];

// homeworkSSOT에서 subject==='수학1'인 단원의 relatedUnit 기반 루트 집합
export function getAlgebraUnitRoots() {
  const list = Array.isArray(HOMEWORK_UNITS) ? HOMEWORK_UNITS : [];
  const roots = new Set(ALGEBRA_ROOT_TOKENS);
  for (const u of list) {
    if (u && u.subject === '수학1' && u.relatedUnit) roots.add(u.relatedUnit);
  }
  return [...roots];
}

// '삼각함수성질3단계' → { root:'삼각함수성질', stage:'3' }
// '삼각함수활용 4단계(68)' → { root:'삼각함수활용', stage:'4' }
export function normalizeUnitKey(key) {
  const cleaned = String(key).replace(/\(\d+\)/g, '').trim(); // 접미 (68) 등 제거
  const m = cleaned.match(/^(.*?)\s*([2-4])단계\s*$/);
  if (m) return { root: m[1].trim(), stage: m[2] };
  return { root: cleaned, stage: null };
}

// 키가 대수 단원에 속하는지(하드코딩+SSOT 합집합 루트 기준).
// JSON 키는 compact('삼각함수성질'), SSOT 루트는 공백/가운뎃점 포함('삼각함수 성질·정의')이라 양방향 포함을 확인.
export function isAlgebraKey(key) {
  const { root } = normalizeUnitKey(key);
  if (!root) return false;
  return getAlgebraUnitRoots().some((t) => root.includes(t) || t.includes(root));
}
