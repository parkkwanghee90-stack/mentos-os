// 📩 주간 부모 리포트 — 한 주 학습(스트릭·시간·정답률·취약단원)을 요약해 학부모에게 발송.
// 기존 승인 알림톡 템플릿 'weeklyTest'(#{name}/#{range}/#{score}/#{grade}/#{weak}/#{comment}) 재사용.
//
// 자동 주간 발송: Dashboard 진입 시 shouldAutoSend()가 참이면 1회 발송 후 기록(클라이언트 기준 주1회).
// (앱이 닫혀 있을 때의 완전 자동화는 서버 스케줄러로 별도 처리.)

import { queueParentPush } from '@/services/pushService';
import { getResults } from '@/services/lessonResultStore';
import { getStreak, getWeekMinutes } from '@/lib/dailyStudy';

const LAST_SENT_KEY = 'mentos_weekly_report_sent_at';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const gradeOf = (s) => (s >= 90 ? '1등급' : s >= 80 ? '2등급' : s >= 70 ? '3등급' : s >= 60 ? '4등급' : '5등급 이하');

function mmdd(d) { return `${d.getMonth() + 1}월 ${d.getDate()}일`; }

// 최근 7일 학습 결과 집계
function aggregateWeek() {
  const since = Date.now() - WEEK_MS;
  const week = getResults().filter((r) => new Date(r.date).getTime() >= since);

  const lessons = week.length;
  const totalQ = week.reduce((s, r) => s + (r.totalQuestions || 0), 0);
  const totalC = week.reduce((s, r) => s + (r.correctCount || 0), 0);
  const accuracy = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

  // 취약 단원: 이번 주 오답이 가장 많이 나온 단원/유형
  const tagCount = {};
  week.forEach((r) => (r.mistakeTags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
  const wrongUnits = {};
  week.forEach((r) => { if ((r.wrongQuestions || []).length) wrongUnits[r.unit] = (wrongUnits[r.unit] || 0) + r.wrongQuestions.length; });
  const weak =
    Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    Object.entries(wrongUnits).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    '없음';

  return { lessons, accuracy, weak };
}

export function buildWeeklyReport(studentName = '학생') {
  const { lessons, accuracy, weak } = aggregateWeek();
  const { current: streak } = getStreak();
  const weekMin = getWeekMinutes();

  const now = new Date();
  const start = new Date(now.getTime() - WEEK_MS + 24 * 60 * 60 * 1000);
  const range = `${mmdd(start)}~${mmdd(now)}`;

  const comment =
    `🔥 ${streak}일 연속 · 이번 주 ${weekMin}분 학습` +
    (lessons > 0
      ? `, 수업 ${lessons}회. ` + (accuracy >= 80 ? '안정적이에요. 심화로 더 끌어올려요!' : '취약 단원 보강이 필요해요.')
      : `. 이번 주 학습을 시작해볼까요?`);

  const message =
    `[멘토스 주간 학습 리포트] ${studentName} (${range})\n` +
    `· 연속 학습: ${streak}일 🔥\n` +
    `· 주간 학습시간: ${weekMin}분\n` +
    `· 수업: ${lessons}회 · 평균 정답률: ${accuracy}점 (${gradeOf(accuracy)})\n` +
    `· 취약 단원: ${weak}\n` +
    `자세한 분석은 앱 대시보드 리포트에서 확인하실 수 있습니다.`;

  return {
    message,
    lessons, accuracy, weak, streak, weekMin, range,
    variables: {
      '#{name}': studentName,
      '#{range}': range,
      '#{score}': String(accuracy),
      '#{grade}': gradeOf(accuracy),
      '#{weak}': weak,
      '#{comment}': comment,
    },
  };
}

// 발송 (알림톡 weeklyTest 템플릿 + SMS 폴백)
export function sendWeeklyParentReport(studentName) {
  const rep = buildWeeklyReport(studentName);
  queueParentPush(rep.message, { templateKey: 'weeklyTest', variables: rep.variables });
  try { localStorage.setItem(LAST_SENT_KEY, String(Date.now())); } catch { /* noop */ }
  return rep;
}

export function getLastSentAt() {
  const t = parseInt(localStorage.getItem(LAST_SENT_KEY) || '0', 10);
  return t > 0 ? t : null;
}

// 자동 주간 발송 조건: 마지막 발송 후 7일 경과 + 이번 주 학습 활동 존재
export function shouldAutoSend() {
  const last = getLastSentAt();
  if (last && Date.now() - last < WEEK_MS) return false;
  const { lessons } = aggregateWeek();
  const { current } = getStreak();
  return lessons > 0 || current > 0;
}
