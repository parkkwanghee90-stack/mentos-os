/**
 * 현재 문제 목록(problems) 기준으로 진행 카운트 계산.
 * solvedStatus는 problemId -> { isCorrect, ... } 맵.
 * 만료/변동으로 stale 키가 있어도 현재 problems 집합만 집계한다.
 */
export function computeSolvedCounts(problems, solvedStatus) {
  let answeredCount = 0;
  let correctCount = 0;
  let wrongCount = 0;
  for (const p of problems) {
    const s = solvedStatus[p.problemId];
    if (s === undefined) continue;
    answeredCount++;
    if (s.isCorrect) correctCount++;
    else if (s.isCorrect === false) wrongCount++;
  }
  const totalProblems = problems.length;
  return { answeredCount, correctCount, wrongCount, totalProblems, isAllSolved: totalProblems > 0 && answeredCount >= totalProblems };
}
