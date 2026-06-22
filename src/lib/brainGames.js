// 🧠 두뇌게임 레지스트리 — 인지영역(카테고리)별 분류 + 성별 첫 추천 정렬.

export const CATEGORIES = [
  { key: 'calc', name: '🔢 계산력', desc: '연산·수 감각' },
  { key: 'logic', name: '🧩 논리·추론', desc: '연역·규칙 발견' },
  { key: 'focus', name: '👁️ 집중력', desc: '주의·관찰' },
  { key: 'memory', name: '🧠 기억력', desc: '작업기억' },
  { key: 'space', name: '🧊 공간·도형', desc: '공간추론·회전' },
  { key: 'creative', name: '💡 창의·통찰', desc: '패턴·발상' },
];

export const GAMES = [
  { id: 'g24', cat: 'calc', name: '24 만들기', emoji: '🎯', tagline: '네 숫자로 24를!', accent: '#f59e0b', bg: 'bg-amber', pref: 'all' },
  { id: 'speed', cat: 'calc', name: '번개 계산', emoji: '⚡', tagline: '60초 타임어택', accent: '#22d3ee', bg: 'bg-cyan', pref: 'boy' },
  { id: 'nono', cat: 'logic', name: '네모네모로직', emoji: '🧩', tagline: '숨은 그림 추리', accent: '#f472b6', bg: 'bg-pink', pref: 'girl' },
  { id: 'spot', cat: 'focus', name: '틀린그림찾기', emoji: '👁️', tagline: '다른 곳 5군데', accent: '#f472b6', bg: 'bg-pink', pref: 'girl' },
  { id: 'memory', cat: 'memory', name: '카드 짝맞추기', emoji: '🧠', tagline: '같은 그림 기억', accent: '#c084fc', bg: 'bg-pink', pref: 'all' },
  { id: 'rotate', cat: 'space', name: '회전 도형', emoji: '🧊', tagline: '돌린 도형 찾기', accent: '#a78bfa', bg: 'bg-cyan', pref: 'boy' },
  { id: 'seq', cat: 'creative', name: '징검다리 건너기', emoji: '🐸', tagline: '규칙 찾아 강 건너기', accent: '#22c55e', bg: 'bg-cyan', pref: 'all' },
];

const PREF_KEY = 'mentos_brain_pref'; // 'boy' | 'girl' | 'all'
export function getBrainPref() { return localStorage.getItem(PREF_KEY) || null; }
export function setBrainPref(p) { try { localStorage.setItem(PREF_KEY, p); } catch { /* noop */ } }
export function getGame(id) { return GAMES.find((g) => g.id === id) || null; }

// 카테고리별 묶음 — 선호 성별 게임이 많은 카테고리를 앞으로
export function categorized() {
  const pref = getBrainPref();
  const cats = CATEGORIES.map((c) => ({ ...c, games: GAMES.filter((g) => g.cat === c.key) }));
  if (pref && pref !== 'all') {
    cats.sort((a, b) => b.games.filter((g) => g.pref === pref).length - a.games.filter((g) => g.pref === pref).length);
  }
  return cats;
}
