// 🎯 데일리 퀘스트 — 매일 작은 목표 → 코인 보상. 정복맵·학습시간·수업과 연결.
// 저장: mentos_daily_quests = { date, claimed: { questId: true } }

import { getResults } from '@/services/lessonResultStore';
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { getTodayMinutes, getDailyGoal } from '@/lib/dailyStudy';
import { award } from '@/lib/rewards';
import { celebrateQuest } from '@/lib/celebrate';

const KEY = 'mentos_daily_quests';

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function sameDay(iso, ref = todayKey()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return todayKey(d) === ref;
}

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.date === todayKey()) return s;
  } catch { /* noop */ }
  return { date: todayKey(), claimed: {} };
}
function saveState(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

// 오늘 진행도 측정값
function lessonsToday() {
  return getResults().filter((r) => sameDay(r.date)).length;
}
function resolvedToday() {
  return getActiveWrongAnswers().filter((w) => w.resolved && w.resolvedAt && sameDay(new Date(w.resolvedAt).toISOString())).length;
}

function questDefs() {
  return [
    { id: 'study_goal', title: `오늘 ${getDailyGoal()}분 학습`, target: getDailyGoal(), reward: 15, progress: getTodayMinutes() },
    { id: 'conquer3', title: '약점 3문제 정복', target: 3, reward: 30, progress: resolvedToday() },
    { id: 'lesson1', title: '수업·숙제 1회 완료', target: 1, reward: 20, progress: lessonsToday() },
  ];
}

export function getTodayQuests() {
  const { claimed } = loadState();
  return questDefs().map((q) => {
    const progress = Math.min(q.progress, q.target);
    return {
      ...q,
      progress,
      pct: Math.min(100, Math.round((q.progress / q.target) * 100)),
      done: q.progress >= q.target,
      claimed: !!claimed[q.id],
    };
  });
}

export function claimQuest(id) {
  const state = loadState();
  const q = getTodayQuests().find((x) => x.id === id);
  if (!q || !q.done || state.claimed[id]) return { ok: false };
  state.claimed[id] = true;
  saveState(state);
  award({ coins: q.reward });
  try { celebrateQuest(q.title, q.reward); } catch { /* noop */ }
  return { ok: true, reward: q.reward };
}

export function questsSummary() {
  const qs = getTodayQuests();
  return { total: qs.length, claimed: qs.filter((q) => q.claimed).length, claimable: qs.filter((q) => q.done && !q.claimed).length };
}
