// answers_master.json은 인덱스 키(0,1,2,...) → {unit, stage, problem, answer, type} 레코드 구조.
// auditMapping이 기대하는 {단원키: {문제번호: 정답}} 맵으로 그룹화한다(불변).
export function adaptAnswersMaster(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const rec of Object.values(raw)) {
    if (!rec || typeof rec !== 'object' || !rec.unit) continue;
    const unit = rec.unit;
    const problem = String(rec.problem ?? '');
    const next = { ...(out[unit] || {}) };
    next[problem] = rec.answer;
    out[unit] = next;
  }
  return out;
}
