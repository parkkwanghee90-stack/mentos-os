// src/pages/mockExamNav.js
// 모의고사 AVS 해설 모달 '다음 문제 보기' 네비게이션 로직 (순수 함수 — 브라우저 없이 단위 테스트 가능)
//
// 비유: 문제집을 넘길 때 빈 페이지(설명 없는 placeholder)는 건너뛰고
//       풀이가 있는 다음 문제로만 넘어가는 규칙.
// 입력 배열을 변형하지 않는다(immutable).

// 풀이 가능한 문항만 추림 — 텍스트(공백 아님) 또는 이미지(picture) 보유
export const answerableQuestions = (questions) =>
  (Array.isArray(questions) ? questions : []).filter(
    (q) => q && typeof q === 'object' && ((typeof q.text === 'string' && q.text.trim() !== '') || !!q.picture)
  );

// 현재 문항(currentId) 기준 '다음 문제' 정보 계산
// 반환: { list, index, total, hasNext, next }
//  - hasNext: 다음 풀이가능 문항 존재 여부 (마지막/미발견 시 false → 버튼 비활성)
//  - next: 다음 문항 객체 (없으면 null)
export const nextHintProblem = (questions, currentId) => {
  const list = answerableQuestions(questions);
  const index = list.findIndex((q) => q.id === currentId);
  const hasNext = index >= 0 && index < list.length - 1;
  return { list, index, total: list.length, hasNext, next: hasNext ? list[index + 1] : null };
};
