// ⏱️ 학습시간 트래커 — 수업/문제풀이 화면에 머무는 동안만 1분 단위로 학습시간 누적.
// 대시보드·랜딩·메뉴 등 비학습 화면 체류는 학습시간으로 세지 않는다.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { addMinutes, getTodayMinutes, getDailyGoal } from '@/lib/dailyStudy';
import { awardDailyGoal } from '@/lib/rewards';

// 실제 수업/문제풀이가 일어나는 경로만 true
export function isStudyPath(p) {
  if (!p) return false;
  if (p === '/homework') return false;        // 숙제 목록(메뉴)
  if (p === '/class/mock-hub') return false;  // 모의고사 허브(메뉴)
  return (
    p === '/brain' ||
    p.startsWith('/class/math') ||
    p.startsWith('/class/english') ||
    p.startsWith('/class/science') ||
    p === '/test' ||
    p === '/class/mock-exam' ||
    p.startsWith('/class/mock/') ||
    p === '/class/naesin' ||
    p === '/class/go2' ||
    p.startsWith('/homework/')
  );
}

const GOAL_AWARDED_KEY = 'mentos_daily_goal_awarded';
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function StudyTimeTracker() {
  const loc = useLocation();
  const pathRef = useRef(loc.pathname);
  useEffect(() => { pathRef.current = loc.pathname; }, [loc.pathname]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!isStudyPath(pathRef.current)) return;
      addMinutes(1);
      // 오늘 목표 달성 순간 1회 코인·XP 보상
      if (getTodayMinutes() >= getDailyGoal() && localStorage.getItem(GOAL_AWARDED_KEY) !== todayStr()) {
        try {
          awardDailyGoal();
          localStorage.setItem(GOAL_AWARDED_KEY, todayStr());
        } catch { /* noop */ }
      }
    }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return null;
}
