// src/engine/ssot.js
// SINGLE SOURCE OF TRUTH — 멘토스 OS 전체 규칙의 단일 출처

// ──────────────────────────────────────────────────
// A. QUESTION TYPE SSOT
// ──────────────────────────────────────────────────
export const QUESTION_TYPES = {
  concept:       { id: 'concept',       label: '개념 확인',    emoji: '💡' },
  apply:         { id: 'apply',         label: '적용 문제',    emoji: '📝' },
  misconception: { id: 'misconception', label: '오개념 체크',  emoji: '⚠️' },
  thinking:      { id: 'thinking',      label: '사고 확장',    emoji: '🧠' },
  review:        { id: 'review',        label: '복습 확인',    emoji: '🔁' },
  retry:         { id: 'retry',         label: '재도전',       emoji: '🔄' },
  exam_drill:    { id: 'exam_drill',    label: '시험 드릴',    emoji: '🎯' },
  reallife:      { id: 'reallife',      label: '실생활 연결',  emoji: '🌍' },
  explain:       { id: 'explain',       label: '학생이 설명',  emoji: '🗣️' },
};

// ──────────────────────────────────────────────────
// B. STUDENT STATE SSOT (초기값)
// ──────────────────────────────────────────────────
export const INITIAL_STUDENT_STATE = {
  currentUnit: null,
  currentLevel: null,          // beginner | intermediate | advanced
  studyMode: 'NORMAL',         // NORMAL | EXAM
  conceptScore: 0,             // 0~100
  applyScore: 0,               // 0~100
  confidence: 50,              // 0~100, 학생 자신감 추정치
  recentMistakeTag: null,      // 마지막으로 틀린 개념 태그
  currentQuestionType: 'concept',
  answerHistory: [],           // [{ qType, correct, tag, answerLength }]
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
  lessonPhase: 'warmup',       // warmup|concept|basic|advanced|mistakes|finaltest|feedback
  phaseMinTurns: { warmup:3, concept:4, basic:4, advanced:4, mistakes:3, finaltest:3, feedback:2 },
  phaseTurns: 0,
};

// ──────────────────────────────────────────────────
// C. LEVEL → TEST CONFIG SSOT
// ──────────────────────────────────────────────────
export const TEST_CONFIG_SSOT = {
  beginner:     { normal: 10, exam: 15, timeLimit: 20 }, // 4~5등급: 10~15문제
  intermediate: { normal: 15, exam: 20, timeLimit: 30 }, // 3등급: 15~20문제
  advanced_2:   { normal: 30, exam: 35, timeLimit: 40 }, // 2등급: 최소 30문제
  advanced_1:   { normal: 30, exam: 40, timeLimit: 45 }, // 1등급: 30~40문제
};

export const LEVEL_FROM_REPORT = {
  '4~5등급': 'beginner',
  '모름':    'beginner',
  '3등급':   'intermediate',
  '2등급':   'advanced_2',
  '1등급':   'advanced_1',
};

// ──────────────────────────────────────────────────
// D. TRANSITION RULE SSOT
// ──────────────────────────────────────────────────
// 각 규칙: { condition(state, lastAnswer) → nextQType }
// lastAnswer: { qType, signal, tag } where signal = 'correct'|'wrong'|'partial'|'unknown'
export const TRANSITION_RULES = [

  // EXAM MODE: 문제 풀이 중심 전이
  {
    id: 'exam_drill_loop',
    condition: (s) => s.studyMode === 'EXAM' && s.consecutiveCorrect >= 2,
    next: 'exam_drill',
    reason: '시험 모드에서 연속 정답 → 난이도 상승(드릴 반복)'
  },
  {
    id: 'exam_wrong_to_misconception',
    condition: (s, a) => s.studyMode === 'EXAM' && a?.signal === 'wrong',
    next: 'misconception',
    reason: '시험 모드 오답 → 오개념 체크'
  },

  // 모르겠어요 / 빈 답변 → 실생활 예시
  {
    id: 'unknown_to_reallife',
    condition: (s, a) => a?.signal === 'unknown' && s.currentLevel === 'beginner',
    next: 'reallife',
    reason: '초급 학생 모름 → 실생활 예시 먼저'
  },
  {
    id: 'unknown_to_easier',
    condition: (s, a) => a?.signal === 'unknown',
    next: 'reallife',
    reason: '모름 → 쉬운 예시'
  },

  // 개념 질문 정답 → 적용으로 이동
  {
    id: 'concept_correct_to_apply',
    condition: (s, a) => a?.qType === 'concept' && a?.signal === 'correct',
    next: 'apply',
    reason: '개념 정답 → 적용 문제'
  },

  // 개념 부분정답 → 확인 질문 (학생이 설명)
  {
    id: 'concept_partial_to_explain',
    condition: (s, a) => a?.qType === 'concept' && a?.signal === 'partial',
    next: 'explain',
    reason: '부분정답 → 학생이 직접 설명해보기'
  },

  // 적용 틀림 → 오개념 체크
  {
    id: 'apply_wrong_to_misconception',
    condition: (s, a) => a?.qType === 'apply' && a?.signal === 'wrong',
    next: 'misconception',
    reason: '적용 문제 틀림 → 오개념 체크'
  },

  // 오개념 틀림 → 실생활 예시 + 재도전
  {
    id: 'misconception_wrong_to_retry',
    condition: (s, a) => a?.qType === 'misconception' && a?.signal === 'wrong',
    next: 'retry',
    reason: '오개념도 틀림 → 재설명 후 재도전'
  },

  // 재도전 후 → 복습
  {
    id: 'retry_to_review',
    condition: (s, a) => a?.qType === 'retry',
    next: 'review',
    reason: '재도전 후 → 복습 확인'
  },

  // 상위 등급 문제 확장 (심화 등급은 사고 확장 → 다시 적용 문제로 무한루프)
  {
    id: 'advanced_loop',
    condition: (s, a) => (s.currentLevel === 'advanced_1' || s.currentLevel === 'advanced_2') && a?.qType === 'thinking',
    next: 'apply',
    reason: '상위 등급 → 사고 확장 이후 다시 새로운 적용 문제 진입 (시간 기반 확장)'
  },

  // 연속 정답 → 사고 확장 질문
  {
    id: 'consecutive_correct_to_thinking',
    condition: (s) => s.consecutiveCorrect >= 2 && s.studyMode === 'NORMAL',
    next: 'thinking',
    reason: '연속 정답 → 사고 확장 레벨 업'
  },

  // 기본: 다음 단계 진행
  {
    id: 'default_flow',
    condition: () => true,
    next: 'apply',
    reason: '기본 흐름'
  }
];

// 규칙을 순서대로 적용해서 다음 질문 타입 결정
export const resolveNextQuestionType = (studentState, lastAnswer) => {
  for (const rule of TRANSITION_RULES) {
    if (rule.condition(studentState, lastAnswer)) {
      console.log(`[Transition] ${rule.id}: ${rule.reason} → ${rule.next}`);
      return rule.next;
    }
  }
  return 'concept';
};

// 답변 시그널 추정 (AI가 명시하지 않는 경우 길이/내용 기반으로)
export const inferAnswerSignal = (answerText) => {
  if (!answerText || answerText.trim().length < 5) return 'unknown';
  const lower = answerText.toLowerCase();
  if (lower.includes('모르') || lower.includes('모름') || lower.includes('모르겠') || lower.includes('잘 모')) return 'unknown';
  if (answerText.trim().length < 15) return 'partial';
  return 'correct'; // optimistic default, AI does real evaluation
};
