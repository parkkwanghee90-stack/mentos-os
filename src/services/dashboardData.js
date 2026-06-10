import { supabase } from '@/services/supabaseClient';

/** 현재 로그인 학생 id (= auth.uid()) */
export function getStudentId() {
  try { return JSON.parse(localStorage.getItem('mentos_mock_user') || 'null')?.id || null; }
  catch { return null; }
}

/**
 * 대시보드용 실데이터를 Supabase에서 직접 로드.
 * 비로그인/오류 시 null 반환(호출부에서 localStorage 폴백).
 * @returns {Promise<{homeworkProgress:any[], wrongAnswers:any[], studyLogs:any[]}|null>}
 */
export async function fetchCloudDashboard() {
  const id = getStudentId();
  if (!id) return null;
  try {
    const [hp, wa, sl] = await Promise.all([
      supabase.from('homework_progress').select('*').eq('user_id', id),
      supabase.from('wrong_answers').select('*').eq('student_id', id),
      supabase.from('study_logs').select('*').eq('student_id', id),
    ]);
    if (hp.error || wa.error || sl.error) throw (hp.error || wa.error || sl.error);
    return {
      homeworkProgress: hp.data || [],
      wrongAnswers: wa.data || [],
      studyLogs: sl.data || [],
    };
  } catch (err) {
    console.warn('[dashboardData] Supabase 로드 실패(로컬 폴백):', err.message);
    return null;
  }
}

/**
 * 최근 7일 정답/풀이 추이를 homework_progress(updated_at) 기준으로 집계.
 * 실데이터 전용 — 기록 없는 날은 0(목업 없음).
 */
export function buildWeeklySeries(homeworkProgress = []) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const buckets = [];
  const index = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const b = { key, day: i === 0 ? '오늘' : days[d.getDay()], correct: 0, total: 0 };
    buckets.push(b); index[key] = b;
  }
  for (const r of homeworkProgress) {
    if (!r.updated_at) continue;
    const d = new Date(r.updated_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const b = index[key];
    if (b) { b.total += 1; if (r.is_correct) b.correct += 1; }
  }
  return buckets.map(b => {
    const acc = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
    return { day: b.day, 개념이해도: acc, 오답률: b.total > 0 ? 100 - acc : 0, 푼문제수: b.total };
  });
}
