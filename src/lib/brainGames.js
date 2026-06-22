// 🧠 두뇌게임 레지스트리 + 성별 기반 첫 추천 정렬.
// 성별은 "고정"이 아니라 "첫 추천 순서"만 바꾼다(모든 게임은 누구나 가능). 직접 고르기 가능.

export const GAMES = [
  {
    id: 'g24', name: '24 만들기', emoji: '🎯', tagline: '네 숫자로 24를 만들어!',
    trains: '사칙연산 · 식 세우기', accent: '#f59e0b', bg: 'bg-amber', pref: 'all',
  },
  {
    id: 'speed', name: '번개 계산', emoji: '⚡', tagline: '60초 안에 몇 개?',
    trains: '연산 순발력 · 집중', accent: '#22d3ee', bg: 'bg-cyan', pref: 'boy',
  },
  {
    id: 'nono', name: '네모네모 로직', emoji: '🧩', tagline: '숨은 그림을 찾아봐',
    trains: '추론 · 논리', accent: '#f472b6', bg: 'bg-pink', pref: 'girl',
  },
];

const PREF_KEY = 'mentos_brain_pref'; // 'boy' | 'girl' | 'all'

export function getBrainPref() {
  return localStorage.getItem(PREF_KEY) || null;
}
export function setBrainPref(p) {
  try { localStorage.setItem(PREF_KEY, p); } catch { /* noop */ }
}

// 추천순 정렬: 선호 성별 게임 → 공용 → 나머지
export function orderedGames() {
  const pref = getBrainPref();
  if (!pref || pref === 'all') return GAMES;
  const weight = (g) => (g.pref === pref ? 0 : g.pref === 'all' ? 1 : 2);
  return [...GAMES].sort((a, b) => weight(a) - weight(b));
}

export function getGame(id) {
  return GAMES.find((g) => g.id === id) || null;
}
