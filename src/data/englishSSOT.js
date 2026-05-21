// src/data/englishSSOT.js
// SINGLE SOURCE OF TRUTH for English Curriculum Structure

export const ENGLISH_PHASES = {
  READING: {
    phases: ['QUESTION', 'INPUT', 'EXPLANATION'],
    ttsEnabled: {
      QUESTION: false,
      INPUT: false,
      EXPLANATION: true
    },
  },
  LISTENING: {
    phases: ['LISTEN_PROMPT', 'LISTEN_1', 'WAIT_INPUT', 'LISTEN_2', 'EXPLANATION', 'CHECK'],
    ttsEnabled: {
      LISTEN_PROMPT: false,
      LISTEN_1: false, // 듣기 음원 자체는 TTS 엔진이 아니라 별도 오디오 재생으로 간주
      WAIT_INPUT: false,
      LISTEN_2: false,
      EXPLANATION: true,
      CHECK: true
    }
  },
  VOCAB: {
    phases: ['EXPOSURE_1', 'MNEMONIC', 'EXPOSURE_2', 'EXAMPLE', 'TEST', 'RESULT'],
    timings: {
      EXPOSURE_1: 3, // 개당 3초
      MNEMONIC: 5,   // 개당 5초 (TTS 포함)
      EXPOSURE_2: 3, // 개당 3초
      EXAMPLE: 2,    // 개당 2초 (빠른 노출)
    },
    cardCount: 10,   // 세션당 10단어
    ttsEnabled: {
      EXPOSURE_1: false,
      MNEMONIC: true,
      EXPOSURE_2: false,
      EXAMPLE: false,
      TEST: false,
      RESULT: false
    }
  }
};

export const READING_SSOT_TIER1 = {
  description: '1등급 실전 구조 (Top Tier Reading SSOT)',
  totalTimeMin: 60,
  passageCountMin: 7,
  passageCountMax: 9,
  targetRanks: ['1등급', '1~2등급'],
  structure: [
    { phase: 'Passage 1~3', type: '기본 구조 훈련', difficulty: '중상', questions: ['빈칸 1', '요약 1'] },
    { phase: 'Passage 4~5', type: '핵심 유형 집중', difficulty: '상', questions: ['빈칸 1', '문장 삽입 1'] },
    { phase: 'Passage 6~7', type: '킬러 구간', difficulty: '최상', questions: ['순서 배열 1', '빈칸 1'] },
    { phase: 'Passage 8~9', type: '고난도 확장 (선택)', difficulty: '최상', questions: ['복합 (빈칸+요약+어휘)'] }
  ],
  passageRules: {
    lengthLines: '6~10문장',
    mandatoryElements: ['개념 (정의)', '예시', '대비 (However / contrast)', '결론'],
    evidenceRule: '반드시 지문 기반 (절대 외부 추론 금지)'
  },
  questionDistribution: {
    blank: '3~4문제',
    ordering: '1~2문제',
    insertion: '1~2문제',
    summary: '1~2문제',
    vocabulary: '1문제',
    total: '8~12문제'
  },
  strictInteractionRule: {
    forbidden: 'AI 설명 먼저 금지',
    flow: '지문 → 질문 → 학생 답 → AI 교정',
    mandatoryStudentAnswerFormat: [
      '1. 구조 (개념 / 예시 / 결론)',
      '2. 핵심 단어',
      '3. 논리 흐름',
      '4. 답 선택 이유'
    ]
  }
};

export const ENGLISH_GRADE_CONFIG = {
  middle1: {
    vocabLevel: '교육부 필수 기초',
    sentenceLength: 10,
    listeningSpeed: 0.8,
    explanationDepth: '기초 용어 중심',
  },
  middle2: {
    vocabLevel: '중등 일반',
    sentenceLength: 15,
    listeningSpeed: 0.9,
    explanationDepth: '기본 연결표현 중심',
  },
  middle3: {
    vocabLevel: '중등 심화/내신 고난도',
    sentenceLength: 20,
    listeningSpeed: 1.0,
    explanationDepth: '시험 핵심 포인트 중심',
  },
  high1: {
    vocabLevel: '고등 필수',
    sentenceLength: 25,
    listeningSpeed: 1.0,
    explanationDepth: '문장 성분 분석 중심',
  },
  high2: {
    vocabLevel: '수능/학평 기출',
    sentenceLength: 30,
    listeningSpeed: 1.1,
    explanationDepth: '글의 논리 구조 분석 중심',
  },
  high3: {
    vocabLevel: '수능 고난도/EBS',
    sentenceLength: 35,
    listeningSpeed: 1.1,
    explanationDepth: '오답 소거 및 시간 단축 중심',
    mode: 'EXAM',
  }
};

export const DIAGNOSIS_CONFIG = {
  maxQuestions: 5,
  silentQuestion: true,
  resultLocked: true, // TeacherSelect 강제 경유 여부
};
