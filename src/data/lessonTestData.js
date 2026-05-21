// src/data/lessonTestData.js
// 등급별 테스트 설정 및 샘플 문항 데이터

export const TEST_CONFIG = {
  '4~5등급': { total: 10, conceptRatio: 0.7, applyRatio: 0.3, thinkingRatio: 0 },
  '3등급':   { total: 12, conceptRatio: 0.5, applyRatio: 0.4, thinkingRatio: 0.1 },
  '2등급':   { total: 15, conceptRatio: 0.3, applyRatio: 0.5, thinkingRatio: 0.2 },
  '1등급':   { total: 18, conceptRatio: 0.2, applyRatio: 0.4, thinkingRatio: 0.4 },
  '모름':    { total: 10, conceptRatio: 0.7, applyRatio: 0.3, thinkingRatio: 0 },
};

export const getLevelConfig = (selfReportedLevel) => {
  return TEST_CONFIG[selfReportedLevel] || TEST_CONFIG['3등급'];
};

// 과학 단원별 테스트 문항 샘플
export const scienceTestQuestions = {
  "여러 가지 힘": {
    concept: [
      { id: 'f_c1', q: "지구가 물체를 끌어당기는 힘의 이름은?", options: ["마찰력", "중력", "탄성력", "부력"], answer: 1, tag: "중력 정의" },
      { id: 'f_c2', q: "용수철이 늘어났다가 원래 길이로 돌아오려는 힘은?", options: ["중력", "마찰력", "탄성력", "자기력"], answer: 2, tag: "탄성력 정의" },
      { id: 'f_c3', q: "물체 사이의 접촉면에서 운동을 방해하는 힘은?", options: ["탄성력", "부력", "마찰력", "중력"], answer: 2, tag: "마찰력 정의" },
      { id: 'f_c4', q: "힘의 단위는?", options: ["kg", "N (뉴턴)", "m", "J"], answer: 1, tag: "힘의 단위" },
      { id: 'f_c5', q: "중력의 방향은?", options: ["위쪽", "옆쪽", "아래쪽", "항상 바뀜"], answer: 2, tag: "중력 방향" },
      { id: 'f_c6', q: "힘이 작용하면 물체의 무엇이 변할 수 있는가?", options: ["색깔", "온도", "속도·모양·방향", "질량"], answer: 2, tag: "힘의 효과" },
      { id: 'f_c7', q: "달 위에서 물체의 무게는 지구보다?", options: ["같다", "크다", "작다", "0이다"], answer: 2, tag: "무게 vs 질량" },
    ],
    apply: [
      { id: 'f_a1', q: "얼음판이 나무 바닥보다 미끄러운 이유를 힘의 종류로 설명하면?", options: ["중력이 작아서", "마찰력이 작아서", "탄성력이 커서", "부력이 커서"], answer: 1, tag: "마찰력 적용" },
      { id: 'f_a2', q: "공중에 던진 공이 포물선을 그리며 떨어지는 이유는?", options: ["마찰력 때문", "탄성력 때문", "중력 때문", "부력 때문"], answer: 2, tag: "중력 적용" },
      { id: 'f_a3', q: "용수철에 추를 달았더니 10cm 늘어났다. 추를 2배로 늘리면?", options: ["5cm", "10cm", "20cm", "변화 없음"], answer: 2, tag: "탄성력 계산" },
    ],
    thinking: [
      { id: 'f_t1', q: "우주에서 공을 던지면 지구와 다른 점은? (중력·마찰력 없는 환경 가정)", options: ["더 빨리 멈춘다", "영원히 직선 운동한다", "포물선을 그린다", "즉시 멈춘다"], answer: 1, tag: "관성 심화" },
      { id: 'f_t2', q: "달에서의 중력은 지구의 1/6이다. 달에서 60N인 물체의 지구 무게는?", options: ["10N", "360N", "60N", "100N"], answer: 1, tag: "무게 계산" },
    ]
  },
  "물질의 구성": {
    concept: [
      { id: 'm_c1', q: "물질을 이루는 가장 기본적인 입자는?", options: ["분자", "원자", "이온", "전자"], answer: 1, tag: "원자 정의" },
      { id: 'm_c2', q: "물(H₂O)의 분자 구성은?", options: ["H 1개 O 2개", "H 2개 O 1개", "H 2개 O 2개", "H 1개 O 1개"], answer: 1, tag: "분자 구성" },
    ],
    apply: [
      { id: 'm_a1', q: "설탕이 물에 녹아도 단 맛이 나는 이유는?", options: ["새 물질이 생겨서", "원자 수가 줄어서", "분자가 분산되었지만 없어지지 않아서", "물 분자가 바뀌어서"], answer: 2, tag: "물질 보존" },
    ],
    thinking: [
      { id: 'm_t1', q: "전기분해로 물(H₂O)을 분해하면 어떤 물질이 나오나?", options: ["수소만", "산소만", "수소와 산소", "수소와 탄소"], answer: 2, tag: "전기분해" },
    ]
  }
};

// 등급별 문항을 선택하는 함수
export const buildTestQuestions = (unit, levelConfig) => {
  const pool = scienceTestQuestions[unit];
  if (!pool) return generateGenericQuestions(unit, levelConfig.total);

  const { total, conceptRatio, applyRatio, thinkingRatio } = levelConfig;
  const conceptCount = Math.round(total * conceptRatio);
  const applyCount = Math.round(total * applyRatio);
  const thinkingCount = total - conceptCount - applyCount;

  const picks = [
    ...(pool.concept || []).slice(0, conceptCount),
    ...(pool.apply || []).slice(0, applyCount),
    ...(pool.thinking || []).slice(0, thinkingCount),
  ];

  // Pad with generic if not enough
  while (picks.length < total) {
    picks.push({ id: `generic_${picks.length}`, q: '다음 중 옳은 것은?', options: ['①', '②', '③', '④'], answer: 0, tag: '일반' });
  }
  return picks.slice(0, total);
};

const generateGenericQuestions = (unit, count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `g_${i}`,
    q: `[${unit}] 문제 ${i + 1}: AI 생성 예정 문항입니다.`,
    options: ['①', '②', '③', '④'],
    answer: 0,
    tag: '자동생성'
  }));
};
