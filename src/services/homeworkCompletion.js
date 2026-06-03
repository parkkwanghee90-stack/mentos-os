const COMPLETIONS_KEY = 'mentos_homework_completions';

function read() {
  try { return JSON.parse(localStorage.getItem(COMPLETIONS_KEY) || '[]'); }
  catch { return []; }
}
function write(list) {
  try {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('[homeworkCompletion] 저장 실패:', err.message);
  }
}

/** 학부모 푸시 메시지 생성 */
export function buildSummaryMessage(studentName, { title, accuracy, correct, total, wrong, minutes }) {
  return `[학부모 알림 - 숙제 완료]
📢 ${studentName} 학생이 '${title}' 숙제를 완료했습니다.
📊 정답률: ${accuracy}% (${correct}/${total})
❌ 오답: ${wrong}문제 · ⏱️ ${minutes}분
자세한 분석은 앱 대시보드에서 확인하실 수 있습니다.`;
}

/** 해당 숙제가 이미 푸시되었는지 */
export function hasPushed(homeworkId) {
  return read().some(c => c.homeworkId === homeworkId && c.pushed);
}

/**
 * 완료 이벤트 기록. 최초 기록 시에만 shouldPush=true 반환(중복 푸시 가드).
 * @returns {{ shouldPush: boolean }}
 */
export function recordCompletion(homeworkId, summary, now = Date.now()) {
  const list = read();
  const already = list.find(c => c.homeworkId === homeworkId);
  if (already?.pushed) {
    return { shouldPush: false };
  }
  const entry = { homeworkId, ...summary, completedAt: now, pushed: true };
  const next = already
    ? list.map(c => (c.homeworkId === homeworkId ? entry : c))
    : [...list, entry];
  write(next);
  return { shouldPush: true };
}

/** 완료 이벤트 목록 (대시보드용) */
export function getCompletions() {
  return read();
}
