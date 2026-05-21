// src/engine/studentState.js
// 학생 상태 업데이트 순수 함수들 (불변 업데이트)
import { INITIAL_STUDENT_STATE, resolveNextQuestionType, inferAnswerSignal } from '@/engine/ssot';

// 학생 상태 초기화
export const initStudentState = ({ unit, level, studyMode }) => ({
  ...INITIAL_STUDENT_STATE,
  currentUnit: unit,
  currentLevel: level,
  studyMode,
});

// 학생 답변이 들어왔을 때 상태 업데이트
export const updateStateOnAnswer = (state, { answerText, tag = null }) => {
  const signal = inferAnswerSignal(answerText);

  const lastAnswer = {
    qType: state.currentQuestionType,
    signal,
    tag,
    answerLength: answerText.trim().length,
    timestamp: Date.now(),
  };

  const newConsecutiveCorrect = signal === 'correct' ? state.consecutiveCorrect + 1 : 0;
  const newConsecutiveWrong  = signal === 'wrong'   ? state.consecutiveWrong + 1 : 0;

  const nextQType = resolveNextQuestionType(
    { ...state, consecutiveCorrect: newConsecutiveCorrect, consecutiveWrong: newConsecutiveWrong },
    lastAnswer
  );

  // Update scores
  const delta = signal === 'correct' ? 10 : signal === 'partial' ? 3 : -5;
  const scoreField = state.currentQuestionType === 'concept' ? 'conceptScore' : 'applyScore';

  return {
    ...state,
    consecutiveCorrect: newConsecutiveCorrect,
    consecutiveWrong: newConsecutiveWrong,
    recentMistakeTag: signal === 'wrong' ? (tag || state.recentMistakeTag) : state.recentMistakeTag,
    [scoreField]: Math.max(0, Math.min(100, state[scoreField] + delta)),
    confidence: Math.max(0, Math.min(100, state.confidence + (signal === 'correct' ? 5 : -10))),
    currentQuestionType: nextQType,
    phaseTurns: state.phaseTurns + 1,
    answerHistory: [...state.answerHistory, lastAnswer],
  };
};

// 단계(phase) 전환
export const advancePhase = (state, newPhase) => ({
  ...state,
  lessonPhase: newPhase,
  phaseTurns: 0,
  consecutiveCorrect: 0,
  consecutiveWrong: 0,
});

// 현재 단계 최소 턴 충족 여부
export const canAdvancePhase = (state) => {
  const min = state.phaseMinTurns?.[state.lessonPhase] ?? 2;
  return state.phaseTurns >= min;
};

// 수업 종료 조건
export const isLessonComplete = (state) =>
  state.lessonPhase === 'feedback' && state.phaseTurns >= 2;
