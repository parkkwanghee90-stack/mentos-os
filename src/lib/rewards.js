// 🎮 보상 시스템 — XP(레벨)·코인(재화)·보너스 수강시간.
// localStorage: mentos_rewards = { xp, coins, bonusMinutes }
//
// 적립: 문제 정답·수업 완료·일일목표·스트릭 마일스톤
// 교환: 코인 → 보너스 수강시간(분) (시간제 결제와 연결되는 실보상)

const KEY = 'mentos_rewards';

export const COINS_PER_BLOCK = 100; // 코인 100
export const MINUTES_PER_BLOCK = 30; // → 수강시간 30분

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return { xp: 0, coins: 0, bonusMinutes: 0, ...(s || {}) };
  } catch {
    return { xp: 0, coins: 0, bonusMinutes: 0 };
  }
}
function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

// 레벨 곡선: Lv = floor(sqrt(xp/50)) + 1  (완만, 초반 빠르게)
export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}
function xpForLevel(l) {
  return 50 * (l - 1) * (l - 1);
}

export function getRewards() {
  const s = load();
  const level = levelFromXp(s.xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    xp: s.xp,
    coins: s.coins,
    bonusMinutes: s.bonusMinutes,
    level,
    xpIntoLevel: s.xp - base,
    xpForNext: next - base,
    pct: Math.min(100, Math.round(((s.xp - base) / (next - base)) * 100)),
  };
}

export function award({ xp = 0, coins = 0 } = {}) {
  const s = load();
  const before = levelFromXp(s.xp);
  s.xp += Math.max(0, Math.round(xp));
  s.coins += Math.max(0, Math.round(coins));
  save(s);
  const after = levelFromXp(s.xp);
  return { ...getRewards(), leveledUp: after > before };
}

// 수업/숙제 1회 완료 보상
export function awardForLesson({ correctCount = 0, accuracy = 0 } = {}) {
  const xp = correctCount * 10 + (accuracy >= 80 ? 30 : 0);
  const coins = correctCount * 2 + (accuracy >= 80 ? 10 : 0);
  return award({ xp, coins });
}

// 일일 목표 달성 보상(하루 1회)
export function awardDailyGoal() {
  return award({ xp: 50, coins: 20 });
}

// 스트릭 마일스톤(7·14·30...) 보상
export function awardStreakMilestone(streak) {
  if (streak > 0 && streak % 7 === 0) return award({ xp: 100, coins: 50 });
  return getRewards();
}

// 코인 → 보너스 수강시간 교환
export function redeemForMinutes(blocks = 1) {
  const s = load();
  const cost = COINS_PER_BLOCK * blocks;
  if (s.coins < cost) return { ok: false, reason: '코인이 부족해요', ...getRewards() };
  s.coins -= cost;
  s.bonusMinutes += MINUTES_PER_BLOCK * blocks;
  save(s);
  return { ok: true, redeemedMinutes: MINUTES_PER_BLOCK * blocks, ...getRewards() };
}
