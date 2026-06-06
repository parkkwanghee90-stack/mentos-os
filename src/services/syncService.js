import { supabase } from '@/services/supabaseClient';

/** 현재 로그인 사용자 id (없으면 null) */
export function getUserId() {
  try {
    return JSON.parse(localStorage.getItem('mentos_mock_user') || 'null')?.id || null;
  } catch {
    return null;
  }
}

/**
 * updated_at(또는 timestamp) 기준 merge. 같은 키는 최신 우선, 다른 키는 합집합.
 * @param {Array} local
 * @param {Array} remote
 * @param {(e:any)=>string} keyFn
 */
export function mergeByTimestamp(local, remote, keyFn) {
  const map = new Map();
  const ts = e => e.updated_at ?? e.timestamp ?? 0;
  [...local, ...remote].forEach(e => {
    const k = keyFn(e);
    const cur = map.get(k);
    if (!cur || ts(e) > ts(cur)) map.set(k, e);
  });
  return [...map.values()];
}

/**
 * 진행도 한 건 Supabase 미러(upsert). 비로그인/오류 시 조용히 무시(localStorage가 SSOT).
 */
export async function mirrorProgress({ homeworkId, problemId, isCorrect, userAnswer, avsViewed }) {
  const userId = getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('homework_progress').upsert({
      user_id: userId,
      homework_id: homeworkId,
      problem_id: problemId,
      is_correct: isCorrect,
      user_answer: userAnswer,
      avs_viewed: avsViewed,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,homework_id,problem_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[syncService] mirrorProgress 실패(무시):', err.message);
    return false;
  }
}

/**
 * 오답 1건을 wrong_answers 테이블에 미러(학생ID·문제ID·정답·학생답).
 * 비로그인/오류 시 조용히 무시(로컬 오답노트가 SSOT).
 */
export async function mirrorWrongAnswer({ problemId, problemNum, unit, correctAnswer, userAnswer }) {
  const userId = getUserId();
  if (!userId) return false;
  try {
    const { error } = await supabase.from('wrong_answers').insert({
      student_id: userId,        // 학생ID
      subject: '수학',
      unit_folder: unit,
      problem_id: problemId,     // 문제ID
      problem_num: problemNum != null ? String(problemNum) : null,
      correct_answer: correctAnswer, // 정답
      wrong_answer_text: userAnswer, // 학생답
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[syncService] mirrorWrongAnswer 실패(무시):', err.message);
    return false;
  }
}
