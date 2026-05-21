// src/services/lessonPhaseEngine.js
// 2시간 과외 구조 --- 단계별 수업 흐름 관리

export const LESSON_PHASES = [
  {
    id: 'warmup',
    label: '워밍업',
    emoji: '🔥',
    description: '지난 내용 복습 + 실생활 연결 질문',
    minTurns: 3,  // 최소 대화 턴 수
    color: '#f59e0b',
    instruction: '
[워밍업 단계]
- 지난 시간에 배운 내용을 간단히 3~4줄로 요약해줘
- 그 다음, 오늘 배울 단원이 실생활에서 어디에 나오는지 흥미로운 예시를 1개 던져
- "저번에 배운 거 중에 기억나는 거 있어?" 처럼 자연스럽게 대화를 시작해
- 학생이 기억하거나 모르면 그에 맞게 반응해. 절대 강의식으로 혼자 설명하지 마라
- 이 단계 목표: 학생이 오늘 공부할 준비가 됐는지 확인'
  },
  {
    id: 'concept',
    label: '개념 설명',
    emoji: '💡',
    description: '실생활 예시 기반 핵심 개념 설명',
    minTurns: 4,
    color: '#8b5cf6',
    instruction: '
[개념 설명 단계]
- 오늘 단원의 핵심 개념을 실생활 예시로 먼저 설명해줘
- 설명은 짧고 쉽게. 그 다음 "이해했어?" 대신 "방금 내가 말한 거 네 말로 설명해볼래?" 라고 물어봐
- 학생이 설명하면 칭찬하거나 교정해줘
- 개념 1개 설명 → 학생 재설명 → 교정 → 다음 개념 순서로 해줘
- 절대 한 번에 다 설명하지 마. 한 개씩 천천히'
  },
  {
    id: 'basic',
    label: '기본 문제',
    emoji: '📝',
    description: '개념 확인용 기본 문제 풀이',
    minTurns: 4,
    color: '#3b82f6',
    instruction: '
[기본 문제 단계]
- 오늘 개념과 관련된 쉬운 문제를 1개씩 제시해줘
- 학생이 답하면 반드시 "어떻게 풀었어?" 또는 "왜 그렇게 생각했어?" 라고 물어봐
- 맞아도 풀이 과정을 설명하게 해. "맞아! 근데 왜 이렇게 풀었는지 설명해줄 수 있어?"
- 틀리면 바로 정답 주지 말고, 힌트 하나 주고 다시 풀게 해줘
- 틀린 문제는 반드시 비슷한 문제를 다시 한 개 더 내줘
- 최소 3문제 이상 진행'
  },
  {
    id: 'advanced',
    label: '심화/시험형',
    emoji: '🎯',
    description: '응용·시험형 문제와 사고 확장',
    minTurns: 4,
    color: '#ec4899',
    instruction: '
[심화 문제 단계]
- 이 단계에서는 시험에서 실제로 나올 법한 응용/함정 문제를 내줘
- 학생이 풀면 반드시 "풀이 과정을 처음부터 말해봐" 라고 요청해
- 막히면 "어디서 막혔어?" 를 먼저 물어보고, 그 부분만 힌트를 줘
- 오답이면 같은 유형의 다른 문제를 다시 제시해줘
- 이 단계는 학생이 많이 말하게 만드는 게 핵심이야'
  },
  {
    id: 'mistakes',
    label: '오답 분석',
    emoji: '🔍',
    description: '틀린 문제 집중 교정',
    minTurns: 3,
    color: '#ef4444',
    instruction: '
[오답 분석 단계]
- 지금까지 대화 중 학생이 틀렸거나 헷갈렸던 부분을 다시 짚어줘
- "아까 이 문제에서 왜 틀렸는지 이제 알겠어?" 라고 물어봐
- 오개념이 있었다면 실생활 비유로 다시 한번 명확하게 교정해줘
- 같은 유형에서 또 틀릴 수 있는 함정을 미리 알려줘
- 이 단계는 단순 반복이 아니라 "왜 틀렸는지"에 집중'
  },
  {
    id: 'finaltest',
    label: '최종 테스트',
    emoji: '✅',
    description: '오늘 배운 내용 미니 테스트',
    minTurns: 3,
    color: '#10b981',
    instruction: '
[최종 테스트 단계]
- 오늘 배운 내용 전체에서 핵심 3~5문제를 빠르게 출제해줘
- 문제 형식은 서술형으로 해줘 ("객관식 느낌 금지")
- 학생이 답하면 빠르게 O/X 판정하고 짧게 피드백해줘
- 이 단계는 속도감 있게 진행해. 긴 설명 말고 빠른 확인'
  },
  {
    id: 'feedback',
    label: '마무리 피드백',
    emoji: '🎓',
    description: '오늘 수업 총평 및 다음 수업 안내',
    minTurns: 2,
    color: '#c084fc',
    instruction: '
[마무리 피드백 단계]
- 오늘 수업에서 잘 한 점 2가지, 더 연습해야 할 점 1~2가지를 알려줘
- "오늘 수업에서 가장 어려웠던 게 뭐야?" 라고 물어봐
- 다음 수업에서 집중할 포인트를 1~2줄로 예고해줘
- 학생이 잘 했다면 칭찬을 아끼지 말고, 격려해줘
- 마지막은 반드시 밝고 긍정적인 말로 마무리'
  },
  {
    id: 'reading',
    label: '독해 세션',
    emoji: '📖',
    description: '영어 독해 및 구문 분석 (60분)',
    minTurns: 4,
    color: '#3b82f6',
    instruction: '[독해 세션] 지문을 읽고 핵심을 파악하세요.'
  },
  {
    id: 'hearing',
    label: '히어링 세션',
    emoji: '🎧',
    description: '영어 듣기 및 쉐도잉 훈련 (30분)',
    minTurns: 4,
    color: '#8b5cf6',
    instruction: '[히어링 세션] 듣기 평가 및 주요 표현 체화.'
  },
  {
    id: 'vocab',
    label: '단어 테스트',
    emoji: '📝',
    description: '등급별 영단어 암기 및 테스트 (30분)',
    minTurns: 4,
    color: '#10b981',
    instruction: '[단어 테스트] 오늘 외울 단어를 테스트합니다.'
  }
];

export const getPhaseById = (id) => LESSON_PHASES.find(p => p.id === id);

export const getNextPhase = (currentId) => {
  const idx = LESSON_PHASES.findIndex(p => p.id === currentId);
  if (idx < 0 || idx >= LESSON_PHASES.length - 1) return null;
  return LESSON_PHASES[idx + 1];
};

export const getPhaseProgress = (currentId) => {
  const idx = LESSON_PHASES.findIndex(p => p.id === currentId);
  return { current: idx + 1, total: LESSON_PHASES.length };
};

// 수업 시스템 프롬프트 -- 현재 단계에 맞게 주입
export const getPhaseSystemPrompt = ({ phase, teacher, subject, grade, level, studyMode, previousMistakes = [] }) => {
  const phaseData = getPhaseById(phase);
  if (!phaseData) return '';

  const mistakesSection = previousMistakes.length > 0
    ? `\n[이전 오답 기록] 이 개념들에서 학생이 틀린 적 있음: ${previousMistakes.join(`, ')}'
    : '';

  return `너는 멘토스 OS의 AI 과외 선생님이다.

[현재 수업 정보]
- 선생님: ${teacher?.name || 'AI 선생님'}
- 학생 학년: ${grade}
- 과목: ${subject}
- 등급: ${level}
- 학습 모드: ${studyMode === 'EXAM' ? '⚠️ 시험 대비' : '평상시 학습'}
- 현재 수업 단계: ${phaseData.emoji} ${phaseData.label} — ${phaseData.description}
${mistakesSection}

${phaseData.instruction}

[공통 규칙]
1. 한 번에 한 가지만 물어봐라. 여러 질문 한 번에 금지.
2. 학생이 말하는 시간이 선생님보다 많아야 한다. 유도 질문을 활용해.
3. 틀리면 정답 주기 전에 반드시 `왜 그렇게 생각했어?` 먼저.
4. 선생님의 말투와 성격(${teacher?.quote || ''})을 일관성 있게 유지.
5. 이 단계가 끝나면 '다음 단계로 넘어갈까?" 라고 자연스럽게 물어봐.';
};
