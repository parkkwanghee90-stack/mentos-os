// 일일 학습 습관 추적 — 오늘 학습시간(분) + 연속 학습 스트릭(🔥).
// localStorage MVP. 키: mentos_daily_study = { "YYYY-MM-DD": minutes }
//
// - addMinutes(n): 앱 포그라운드 하트비트가 1분마다 호출 → 오늘 학습시간 누적
// - markActiveToday(): 수업/숙제 완료 등 명시적 활동 → 그날을 스트릭 인정일로 보장
// - getStreak(): 연속 학습일(오늘 또는 어제부터 거꾸로)
// - getTodayMinutes()/getDailyGoal(): 일일 시간링용

const KEY = 'mentos_daily_study';
const LONGEST_KEY = 'mentos_streak_longest';

export const DAILY_GOAL_MIN = 20; // 일일 목표(분) — 링 100% 기준
const STREAK_MIN = 3;             // 스트릭 인정 최소 학습(분)

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* noop */ }
}

// 오늘 학습시간 n분 누적
export function addMinutes(n = 1) {
  if (!(n > 0)) return;
  const map = load();
  const k = dateKey();
  map[k] = (map[k] || 0) + n;
  save(map);
}

// 명시적 활동 발생 → 오늘을 스트릭 인정일로 보장(끊김 방지)
export function markActiveToday() {
  const map = load();
  const k = dateKey();
  if ((map[k] || 0) < STREAK_MIN) {
    map[k] = STREAK_MIN;
    save(map);
  }
}

export function getTodayMinutes() {
  return Math.round(load()[dateKey()] || 0);
}

export function getDailyGoal() {
  return DAILY_GOAL_MIN;
}

const isActive = (map, k) => (map[k] || 0) >= STREAK_MIN;

// 연속 학습일. 오늘 활동했으면 오늘부터, 아니면 어제부터 거꾸로 카운트(오늘은 아직 안 했을 수 있으니 유지).
export function getStreak() {
  const map = load();
  const d = new Date();
  if (!isActive(map, dateKey(d))) d.setDate(d.getDate() - 1);
  let current = 0;
  while (isActive(map, dateKey(d))) {
    current++;
    d.setDate(d.getDate() - 1);
  }
  let longest = parseInt(localStorage.getItem(LONGEST_KEY) || '0', 10) || 0;
  if (current > longest) {
    longest = current;
    try { localStorage.setItem(LONGEST_KEY, String(longest)); } catch { /* noop */ }
  }
  return { current, longest };
}

// 최근 7일 (위젯 점 표시) → [{ date, label, minutes, active }]
export function getLast7Days() {
  const map = load();
  const labels = ['일', '월', '화', '수', '목', '금', '토'];
  const out = [];
  const base = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const k = dateKey(d);
    out.push({
      date: k,
      label: labels[d.getDay()],
      minutes: Math.round(map[k] || 0),
      active: isActive(map, k),
      isToday: i === 0,
    });
  }
  return out;
}

// 이번 주(최근 7일) 총 학습시간(분)
export function getWeekMinutes() {
  return getLast7Days().reduce((s, d) => s + d.minutes, 0);
}
