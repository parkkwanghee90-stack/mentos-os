// src/data/mathFPuzzleLibrary.js

// 수학 F등급 전용 두뇌 훈련 퍼즐 라이브러리 엔진
// 언어유희 배제, 순수 수학적 사고 및 구조 논리 유도

export const PUZZLE_LIBRARY = {
  visualPuzzles: [
    {
      id: 'vis_1',
      type: '도형의 위상',
      title: '9개의 점 정사각형',
      image: '![9개의 점](https://placehold.co/300x200/0f172a/ffffff?text=3x3+Grid)',
      content: '가로 3열, 세로 3열로 일정하게 9개의 점이 찍혀 있어. 이 점 4개를 선으로 이어서 만들 수 있는 크고 작은 정사각형은 총 몇 개일까?',
      goal: '반듯한 모양(4개+1개) 외에 기울어진 정사각형(1개)을 시각적으로 인지할 수 있는지 유도',
    },
    {
      id: 'vis_2',
      type: '그래프/조합',
      title: '파티 악수 횟수',
      image: '![5명의 사람 별모양](https://placehold.co/300x200/0f172a/60a5fa?text=Pentagon+Connections)',
      content: '5명이 모인 파티에서 한 명도 빠짐없이 서로 한 번씩 모두 악수를 했다면, 총 악수 횟수는 몇 번일까?',
      goal: '교환법칙(A-B와 B-A가 같음)을 이해하고 중복을 제거하며 선을 이어가는 구조 파악 능력을 확인',
    },
    {
      id: 'vis_3',
      type: '임계값 파악',
      title: '우물 빠진 달팽이',
      image: '![10m 우물 달팽이](https://placehold.co/300x200/0f172a/34d399?text=10m+Well)',
      content: '깊이가 10m인 우물이 있어. 달팽이가 낮에는 3m를 오르지만 밤에는 2m 미끄러져 내려와. 달팽이가 10m 우물을 완전히 탈출하려면 며칠이 걸릴까?',
      goal: '하루 1m씩의 산술 평균에 속지 않고 마지막 날(도달 후 안 미끄러짐)의 경계값을 인지하는지 확인',
    }
  ],
  
  textPuzzles: [
    {
      id: 'txt_1',
      type: '경우 나누기',
      difficulty: 'easy',
      title: '숫자 9의 개수',
      content: '1부터 100까지 숫자를 쭉 적을 때, 숫자 9는 과연 총 몇 번 나오게 될까?',
      goal: '10번이라는 직관적 오류를 넘어 90번대의 구조(십의 자리)를 따로 분리해서 생각할 수 있는지 파악',
    },
    {
      id: 'txt_2',
      type: '극한 논리',
      difficulty: 'easy',
      title: '암실 양말 맞추기',
      content: '불 꺼진 방에 검은 양말 10켤레, 흰 양말 10켤레가 바구니에 마구 섞여 있어. 안 보고 단번에 같은 색깔 1켤레를 맞추려면 최소 양말을 몇 짝 꺼내야 할까?',
      goal: '운이 좋은 경우가 아닌 최악의 경우(Worst-case 시나리오)를 극복하기 위한 비둘기집 원리 확인',
    },
    {
      id: 'txt_3',
      type: '상태 전이',
      difficulty: 'medium',
      title: '양동이 물 맞추기',
      content: '3L와 5L짜리 빈 양동이 2개, 그리고 물은 무제한으로 쓸 수 있어. 이 두 양동이로 딱 4L의 물을 정확히 남기려면 어떻게 해야 할까?',
      goal: '잉여 값을 이동시키고 빼가며 원하는 상태로 전이시키는 알고리즘 설계 능력 유도',
    },
    {
      id: 'txt_4',
      type: '진리표 추론',
      difficulty: 'medium',
      title: '누가 거짓말쟁이?',
      content: 'A는 "B가 거짓말쟁이다"라고 하고, B는 "C가 거짓말쟁이다", C는 "A와 B 둘 다 거짓말쟁이다"라고 해. 그럼 이 중에서 진짜 진실을 말하는 사람은 누구일까?',
      goal: '한 명이 참일 때 생기는 모순을 통해 논리 명제의 진리표를 검증하는 능력 파악',
    },
    {
      id: 'txt_5',
      type: '분할 정복',
      difficulty: 'hard',
      title: '위조 동전 찾기',
      content: '9개의 똑같이 생긴 동전이 있는데 하나가 가짜라서 무게가 불량(더 가벼움)이야. 양팔 저울을 딱 2번만 써서 반드시 그 가짜 동전을 찾는 방법이 뭘까?',
      goal: '2분할 방식이 아닌 3분할 트리 탐색 사고(3개씩 묶기) 방식을 통해 최적화 전략 구조를 만들 줄 아는지 파악',
    },
    {
      id: 'txt_6',
      type: '모순 / 귀류법',
      difficulty: 'hard',
      title: '모두 틀린 라벨',
      content: '3개의 상자에 서로 잘못된 라벨(사과, 오렌지, 사과+오렌지)이 붙어있어. 모두 잘못 붙은 상태야. 상자 하나에서 과일을 딱 1개만 꺼내보고 모든 상자를 맞추려면 어떤 라벨 상자를 열어봐야 할까?',
      goal: '모든 라벨이 틀렸다는 부정 명제를 이용해 가장 정보량이 많은 상자부터 접근하는 역추론 방식 유도',
    },
    {
      id: 'txt_7',
      type: '규칙성 / 완전제곱',
      difficulty: 'hard',
      title: '100개의 스위치',
      content: '1번부터 100번 스위치를 1번째 사람이 다 누르고, 2번째 사람이 2의 배수를 똑딱, 3번째는 3의 배수를 똑딱... 100번째 사람까지 끝나면 켜진 전구들은 어떤 특징을 가질까?',
      goal: '약수의 개수가 홀수개인 완전제곱수의 성질을 직관적으로 깨닫고 구조 규칙을 읽어내는지 유도',
    }
  ]
};

// 해시 기반 퍼즐 세트 (1시각 + 4텍스트 = 총 5문항) 추출 엔진
export const generateFPuzzleSet = (sessionId) => {
  let hash = 0;
  if (sessionId) {
    for (let i = 0; i < sessionId.length; i++) hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const visualPuzzles = PUZZLE_LIBRARY.visualPuzzles;
  const easyTextPuzzles = PUZZLE_LIBRARY.textPuzzles.filter(p => p.difficulty === 'easy');
  const hardTextPuzzles = PUZZLE_LIBRARY.textPuzzles.filter(p => p.difficulty !== 'easy');

  const visualIndex = hash % visualPuzzles.length;
  
  // 첫 문제는 무조건 easy 그룹에서 추출하여 진입 장벽 낮춤
  const t1 = easyTextPuzzles[hash % easyTextPuzzles.length];
  
  // 나머지는 난이도 섞인 그룹에서 추출
  const t2 = hardTextPuzzles[(hash) % hardTextPuzzles.length];
  const t3 = hardTextPuzzles[(hash + 1) % hardTextPuzzles.length];
  const t4 = hardTextPuzzles[(hash + 2) % hardTextPuzzles.length];

  // 배열: [가벼운 첫 텍스트 문제, 그림 문제, 중간, 중간, 어려움]
  const finalSet = [
    t1,
    visualPuzzles[visualIndex],
    t2,
    t3,
    t4
  ];

  return finalSet;
};
