// 🏅 성장 리그 — '점수'가 아니라 '이번 주 얼마나 성장했나(XP 증가량)'로 티어를 매긴다.
// 절대 등급이 낮아도 꾸준히 성장하면 상위 티어 도달 가능 → 4·5등급도 좌절하지 않음.
// 저장: mentos_league = { weekStart, startXp, lastGrowth }

import { getRewards } from '@/lib/rewards';

export const TIERS = [
  { name: '브론즈', min: 0, emoji: '🥉', color: '#b45309' },
  { name: '실버', min: 100, emoji: '🥈', color: '#9ca3af' },
  { name: '골드', min: 300, emoji: '🥇', color: '#f59e0b' },
  { name: '플래티넘', min: 600, emoji: '💠', color: '#22d3ee' },
  { name: '다이아', min: 1000, emoji: '💎', color: '#a78bfa' },
];

const KEY = 'mentos_league';

// 이번 주 월요일 키
function weekStartKey() {
  const d = new Date();
  const offset = (d.getDay() + 6) % 7; // 월=0
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}
function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function getLeague() {
  const xp = getRewards().xp;
  const wk = weekStartKey();
  let s = load();
  if (!s || s.weekStart !== wk) {
    const lastGrowth = s ? Math.max(0, xp - (s.startXp ?? xp)) : 0;
    s = { weekStart: wk, startXp: xp, lastGrowth };
    save(s);
  }
  const growth = Math.max(0, xp - s.startXp);
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (growth >= TIERS[i].min) idx = i;
  const tier = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const prevMin = tier.min;
  const span = next ? next.min - prevMin : 1;
  return {
    growth,
    tier,
    tierIdx: idx,
    next,
    toNext: next ? next.min - growth : 0,
    pct: next ? Math.min(100, Math.round(((growth - prevMin) / span) * 100)) : 100,
    lastGrowth: s.lastGrowth || 0,
    tiers: TIERS,
  };
}
