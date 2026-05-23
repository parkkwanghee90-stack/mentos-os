// src/data/hTeacherProfiles.js
export const HIGH_TEACHER_PROFILES = {
  // ── 고등 수학 (9명) ──
  math1: { 
    id: 'h_math1', subject: 'math', name: '강태양', gender: 'male', image: window.resolveAsset('/hteachers/math/math1.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'h_math_gpa_1', routeTitle: '고1 내신 1등급 직행 루트', routeDescription: '학교 시험의 출제 원리를 꿰뚫고 점수를 극대화하는 최상위 특화 과정.',
    tagline: '내신 1등급을 지키는 힘', intro: '치열한 내신 경쟁에서 살아남는 실전 대비.', features: ['빈출 킬러 유형 분석', '시간 단축 훈련', '기출 변형 대비'] 
  },
  math2: { 
    id: 'h_math2', subject: 'math', name: '이수현', gender: 'female', image: window.resolveAsset('/hteachers/math/math2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'h_math_adv_1', routeTitle: '고1 상위권 도약 루트', routeDescription: '내신 1등급 진입을 위한 심화 문제 및 변형 문제 집중 훈련반.',
    tagline: '흔들리지 않는 최상위권의 시작', intro: '학교 기출과 모의고사 변형에 철저히 대비합니다.', features: ['빈출 킬러 완전 정복', '서술형 감점 0점 전략', '문제 해결력 강화'] 
  },
  math3: { 
    id: 'h_math3', subject: 'math', name: '정우진', gender: 'male', image: window.resolveAsset('/hteachers/math/math3.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1'], targetRanks: ['4~5등급'],
    mode: 'subject_specific',
    routeId: 'h_math_fnd_1', routeTitle: '고1 내신 응급처치 루트', routeDescription: '진도를 따라가기도 벅찬 학생을 위한 교과서 필수 예제 마스터 과정.',
    tagline: '수학의 기초 체력을 기릅니다', intro: '중학 수학의 구멍부터 메꾸면서 진도를 따라갑니다.', features: ['개념 백지 복습', '수식 풀이 교정', '기초 연산 집중 방어'] 
  },
  math4: { 
    id: 'h_math4', subject: 'math', name: '최지아', gender: 'female', image: window.resolveAsset('/hteachers/math/math4.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'h_math_adv', routeTitle: '고2 심화 변별력 극복 루트', routeDescription: '어떤 응용이나 킬러 문제가 나와도 흔들리지 않는 절대 실력 양성.',
    tagline: '킬러를 넘어서는 묵직함', intro: '난이도의 한계를 부수는 심층 사고력 수학.', features: ['고난도 조건 해체', '다각도 문제 해결력', '수능형 변형 문항 방어'] 
  },
  math5: { 
    id: 'h_math5', subject: 'math', name: '차민성', gender: 'male', image: window.resolveAsset('/hteachers/math/math5.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'h_math_step_2', routeTitle: '고2 핵심 기출 브릿지 루트', routeDescription: '개념을 넘어 기출 분석으로 나아가는 2등급 진입 훈련.',
    tagline: '원리를 파악하면 흔들리지 않는다', intro: '모든 응용 문제의 접근법을 공식화합니다.', features: ['필수 기출 유형 분석', '문제 접근 로직 훈련', '함정 회피 스킬'] 
  },
  math6: { 
    id: 'h_math6', subject: 'math', name: '윤수아', gender: 'female', image: window.resolveAsset('/hteachers/math/math6.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2'], targetRanks: ['3등급'],
    mode: 'subject_specific',
    routeId: 'h_math_calc', routeTitle: '수학1 (대수 실전)', routeDescription: '수학1의 모든 약점을 극복하는 필수 코스.',
    tagline: '수학1의 정석 윤수아', intro: '수학1의 벽, 확실하게 허물어 드립니다.', features: ['수학1 기초 완벽 이해', '필수 유형 모의고사', '그래프 직관력 강화'] 
  },
  math7: { 
    id: 'h_math7', subject: 'math', name: '윤도현', gender: 'male', image: window.resolveAsset('/hteachers/math/math7.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'h_math_exam_top', routeTitle: '수능 수학 만점 루트', routeDescription: '최상위 1등급을 지키고 만점을 목표로 하는 초고난도 집중 돌파 루트.',
    tagline: '만점을 향한 정밀한 타격', intro: '만점이 아니면 허락하지 않는 최고의 난이도.', features: ['초고난도 킬러 N제 훈련', '조건의 미세한 함정 분석', '상위 1% 전용 솔루션'] 
  },
  math8: { 
    id: 'h_math8', subject: 'math', name: '최하율', gender: 'female', image: window.resolveAsset('/hteachers/math/math8.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'h_math_exam_prac', routeTitle: '수능 실전 감각 극대화 루트', routeDescription: '준킬러를 완벽하게 맞추고 수능 당일 실수를 줄이는 실전 훈련.',
    tagline: '수능 날 강해지는 실전 수학', intro: '최적의 타임어택과 문제 우선순위 분배를 연습합니다.', features: ['실전 모의고사 체화', '준킬러 집중 방어', '타임 어택 관리'] 
  },
  math9: { 
    id: 'h_math9', subject: 'math', name: '강힘찬', gender: 'male', image: window.resolveAsset('/hteachers/math/math9.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['4~5등급'],
    mode: 'subject_specific',
    routeId: 'h_math_exam_found', routeTitle: '수능 특급 요약 파이널 루트', routeDescription: '과감한 선택과 집중을 통해 수능 필수 3점 문항을 완벽히 방어하는 현실적 전략 루트.',
    tagline: '수능 수학의 최소 방어선 구축', intro: '오직 맞춰야 할 빈출 문제에만 화력을 쏟습니다.', features: ['기본 빈출 기출 집중', '선택과 집중 전략', '수능 공통 구조 체화'] 
  },

  // ── 고등 영어 (8명) ──
  eng1: {
    id: 'h_eng1', subject: 'eng', name: '백도진', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng1.webp'),
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1', '고2'], targetRanks: ['4~5등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 백도진 선생님이다. 수능 영어, 시간 안에 끝내는 방법 알려준다.",
        styleMessage: "내 수업은 문제를 많이 푸는 게 아니라, 틀리지 않는 구조를 만드는 수업이다.",
        motivationMessage: "지금부터 ‘맞는 이유’를 아는 훈련을 시작한다. 따라와라."
      },
      repeatClass: {
        checkMessage: "숙제 했나. 안 했으면 오늘 바로 무너진다.",
        reviewMessage: "복습한 만큼만 실력 나온다. 바로 확인한다."
      }
    },
    mode: 'interest_reading',
    curriculumId: 'eng_basic_1', contentProfileId: 'fun_reading_story', routeTitle: '영어 흥미 회복형', routeDescription: '초등 회화가 아닌 고등학생 감성의 재밌는 스토리와 독해 결합 코스.',
    contentProfile: 'fun_reading_story',
    contentRules: [
      '일상생활 회화형 초등 수준 스피킹 및 질의응답 형태의 수업 절대 금지',
      'What do you do for fun? 취미 등의 단순 패턴 생활회화 전면 금지',
      '문장은 짧아도 내용과 감성은 고등학생 일상(친구, 오해, 지각, 시험 등) 반영',
      '읽는 맛이 있는 3~5줄 분량의 연속성 있는 단문 스토리 독해 중심',
      '[흥미형 기초 독해 프로세스] 1. 문장 제시 -> 2. 직독직해 유도 -> 3. 핵심 표현 설명 -> 4. 내용 퀴즈 -> 5. 내용 기반 심화 확장'
    ],
    listeningRouteId: 'eng_listening_story_basic',
    listeningRouteTitle: '쉬운 스토리 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~3분: 상황 소개 (사전 그림 연상 또는 한 줄 설명으로 듣기 목적 공지)",
      "3~8분: 1차 듣기 (전체 내용 이해 중심. 느린 속도의 일상 대화)",
      "8~12분: 핵심 내용 확인 (아주 쉬운 직관적 질문)",
      "12~18분: 스크립트 일부 공개 및 쉬운 해석 (문법 설명 최소화)",
      "18~23분: 2차 듣기 (배운 내용 바탕 이해도 강화)",
      "23~28분: 따라 말하기 (2~3개 핵심 문장 쉐도잉 집중 훈련)",
      "28~30분: 재미있는 한 줄 요약 마무리",
      "[포인트] 문법 배제, 편안한 일상/스토리 소재 활용"
    ],
    tagline: '구조를 알면 해석이 풀린다', intro: '단어만 나열하는 독해는 이제 그만.', features: ['interesting_short_passage', 'emotion_daily_story', 'light_narrative_reading'] 
  },
  eng2: { 
    id: 'h_eng2', subject: 'eng', name: '설윤아', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1', '고2'], targetRanks: ['1~2등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 설윤아 선생님이야. 지금부터 영어가 왜 어려웠는지 정확히 알려줄게.",
        styleMessage: "내 수업은 내신이랑 수능을 같이 잡는 구조야.",
        motivationMessage: "쌤만 믿고 따라오면, 영어가 갑자기 보이기 시작할 거야."
      },
      repeatClass: {
        checkMessage: "숙제는 했지? 복습 제대로 했는지 오늘 바로 확인할게.",
        reviewMessage: "지난 시간 내용 기억나는지 먼저 체크하고 시작하자."
      }
    },
    mode: 'exam_reading',
    curriculumId: 'eng_gpa_1', contentProfileId: 'gpa_structure_logic', routeTitle: '평가원 감각형', routeDescription: '교과서와 모의고사 변형 지문을 완벽 분석해 내신 1등급을 노립니다.',
    contentProfile: 'gpa_structure_logic',
    contentRules: [
      '[1등급 독해 훈련 프로토콜 적용]',
      '1. 문제를 제시한 후 바로 정답을 알려주지 말고, 학생이 먼저 접근법(첫 문장 핵심, 역접 뒤 반전 내용, 빈칸 방향성, 정답)을 설명하게 유도한다.',
      '2. 학생의 접근법이 입력되면 1등급 관점(구조 파악, 원인/결과 대비)에서 맞는지 단계별로 엄격히 피드백한다.',
      '3. 감이나 분위기로 답을 맞춘 경우 이를 지적하고, 지문 내 정확한 단어/문장 근거로 재확정시키도록 교정한다.',
      '4. 학생의 논리가 완벽하면 칭찬 후 다음 문제로 넘어간다.'
    ],
    listeningRouteId: 'eng_listening_exam_sense',
    listeningRouteTitle: '평가원 듣기 감각 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~3분: 문제 유형 설명 및 듣기 목적(핵심 타겟) 설정",
      "3~10분: 1차 듣기 및 직접 문제 풀기",
      "10~15분: 정답 확인 및 오답인 이유 명확한 해설",
      "15~20분: 핵심 문장 분석 설계도 제공",
      "20~25분: 함정 패턴을 인식하며 2차 듣기 재청취",
      "25~28분: 평가원식 함정 패턴 정리 및 따라 말하기 쉐도잉",
      "28~30분: 출제 유형 요약",
      "[포인트] 실제 시험 유형 최적화, 선택지 분석 중심"
    ],
    tagline: '빈틈없는 내신 분석가', intro: '출제 원리에 꿰뚫는 분석 시크릿.', features: ['지문 구조화', '서술형 집중 대비', '변형 문제 훈련'] 
  },
  eng3: { 
    id: 'h_eng3', subject: 'eng', name: '한시우', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng3.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1', '고2'], targetRanks: ['3등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 한시우 선생님이야. 영어 못하는 이유부터 바로 고쳐줄게.",
        styleMessage: "대충 읽는 습관, 오늘부터 다 버린다.",
        motivationMessage: "지금부터 제대로 읽는 법 시작한다. 따라와."
      },
      repeatClass: {
        checkMessage: "숙제 해봤지? 어디서 막혔는지 바로 보자.",
        reviewMessage: "복습 안 된 부분부터 다시 잡고 간다."
      }
    },
    mode: 'subject_specific',
    curriculumId: 'eng_found_1', contentProfileId: 'rescue_basic_syntax', routeTitle: '구조 재건형', routeDescription: '영어를 “단어 뭉치”가 아니라 “구조”로 읽게 만들기. 구문독해 약한 학생 재건.',
    contentProfile: 'rescue_basic_syntax',
    contentRules: ['문법 용어 사용 거의 배제', '매우 쉬운 단문 형태의 직독직해 위주', '영어 울렁증을 해결할 수 있는 가벼운 분량', '자신감을 주는 흥미 위주 토크 결합'],
    listeningRouteId: 'eng_listening_structure_basic',
    listeningRouteTitle: '문장 구조 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~5분: 오늘 들을 지문의 핵심 문장 구조 사전 소개 및 듣기 목적 공지",
      "5~10분: 짧은 문장 듣기",
      "10~15분: 들은 문장을 구조적으로 끊어서 정밀 해석 확인",
      "15~20분: 구조를 떠올리며 2차 재청취",
      "20~25분: 주요 문장 따라 읽기 및 구조 체화 쉐도잉",
      "25~30분: 오늘 훈련한 영문 구조 최종 복습",
      "[포인트] 한 문장씩 수식어 떼며 정확히 듣기, 구조 기반 직청직해"
    ],
    tagline: '마지막으로 영어를 믿어봐', intro: '문법 용어 없이 이해시키는 구문 독해.', features: ['필수 영단어 매일 반복', '문장 끊어 읽기 공식', '해석의 감 유지'] 
  },
  eng4: { 
    id: 'h_eng4', subject: 'eng', name: '정유나', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng4.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고3'], targetRanks: ['1등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 정유나 선생님이야. 영어, 충분히 잘할 수 있어.",
        styleMessage: "쌤이 쉽게 풀어서 이해하게 만들어줄게.",
        motivationMessage: "부담 갖지 말고 같이 해보자. 천천히 올라간다."
      },
      repeatClass: {
        checkMessage: "숙제 해봤지? 어려운 부분 있었지?",
        reviewMessage: "괜찮아. 오늘 다시 같이 풀어보자."
      }
    },
    mode: 'logic_advanced',
    curriculumId: 'eng_gpa_2', contentProfileId: 'gpa_1st_defense', routeTitle: '최상위 독해형', routeDescription: '수능 1등급을 위한 초고난도 비문학 독파반.',
    contentProfile: 'gpa_1st_defense',
    contentRules: [
      '[1등급 독해 훈련 프로토콜 적용]',
      '1. 초고난도 지문/문제를 1개 제시하고 대기. 학생이 풀이 접근법(구조 파악, 전환점, 타겟팅)을 직접 설명하게 유도.',
      '2. 학생의 설명을 듣고 부분별로 정답 여부와 무관하게 1등급 사고인지 진단(확인/오답 교정).',
      '3. 분위기나 감으로 푼 부분은 1개 단어 근거나 문장 구조 기반 사고로 명확히 확정하도록 1등급식 피드백 제공.',
      '4. 완벽한 논리가 증명될 때만 다음 킬러 문항으로 진행.'
    ],
    listeningRouteId: 'eng_listening_advanced',
    listeningRouteTitle: '고난도 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~3분: 킬러 문항 문제 유형 및 정보 추출 전략 브리핑",
      "3~12분: 빠른 속도의 1차 듣기 및 고난도 문제 풀이",
      "12~18분: 정답 도출 및 논리적 근거 분석",
      "18~23분: 듣기 극강 난이도를 유발하는 킬러 핵심 문장 정밀 해부",
      "23~27분: 분석 내용을 바탕으로 2차 듣기 및 스피킹(섀도잉) 훈련",
      "27~30분: 핵심 표현 및 고난도 정보 추출 포인트 랩업",
      "[포인트] 빠른 재생 속도, 1등급 변별력을 위한 정보 추출 능력 특화"
    ],
    tagline: '빈틈없는 내신 1등급 로드맵', intro: '서술형 영작부터 지문 변형까지 대비.', features: ['지문 구조화 암기법', '서술형 영작 패턴 훈련', '어법 함정 돌파'] 
  },
  eng5: { 
    id: 'h_eng5', subject: 'eng', name: '신지훈', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng5.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고3'], targetRanks: ['4~5등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 신지훈 선생님이야. 영어 포기할 필요 없다.",
        styleMessage: "지금부터 점수 올라가는 방법만 알려준다.",
        motivationMessage: "쌤만 믿고 따라오면 된다. 같이 가자."
      },
      repeatClass: {
        checkMessage: "숙제 했지? 조금씩이라도 했으면 잘한 거다.",
        reviewMessage: "복습한 만큼 실력 붙는다. 이어서 가보자."
      }
    },
    mode: 'subject_specific',
    curriculumId: 'eng_adv_1', contentProfileId: 'friendly_healing_english', routeTitle: '흥미 유도 회복 루트', routeDescription: '기초가 없는 학생을 위해 영어가 즐거워지는 상황극 및 일상 회화 회복 루트.',
    contentProfile: 'friendly_healing_english',
    contentRules: ['초장문 구조를 가진 지문/문장 분석', '철학적, 과학적, 인문학적 고난도 주제의 글만 사용', '의역을 바탕으로 깊은 의미 추론 훈련'],
    listeningRouteId: 'eng_listening_fun',
    listeningRouteTitle: '재미있는 영어 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~5분: 상황극 느낌의 공감대 형성 흥미 유도 및 듣기 목적 설정",
      "5~12분: 1차 듣기 (유쾌한 스토리나 대화문)",
      "12~18분: 내용의 핵심만 묻는 아주 가벼운 이해 확인 질문",
      "18~22분: 일상에서 바로 쓸 수 있는 재밌는 표현 위주 설명",
      "22~27분: 즐거운 따라 말하기 및 액팅 쉐도잉",
      "27~30분: 일상형 짧은 말하기 응용 및 랩업",
      "[포인트] 영어가 즐거워지는 힐링 리스닝, 심리적 부담 최소화"
    ],
    tagline: '복잡한 문장도 한 눈에', intro: '번역이 아닌 진정한 이해로 이끕니다.', features: ['초장문 구조 분석', 'EBS 연계 심층 분석', '고난도 주제 완벽 정리'] 
  },
  eng6: { 
    id: 'h_eng6', subject: 'eng', name: '임하민', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng6.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3'], targetRanks: ['3등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 임하민 선생님이야. 영어가 왜 막막한지부터 같이 잡아보자.",
        styleMessage: "쌤 수업은 어렵게 안 간다. 대신 확실하게 이해하게 만든다.",
        motivationMessage: "지금부터 하나씩 올라간다. 절대 포기 안 시킨다."
      },
      repeatClass: {
        checkMessage: "숙제 해봤어? 어려웠던 부분 같이 다시 보자.",
        reviewMessage: "복습하면서 막힌 거부터 풀어줄게."
      }
    },
    mode: 'subject_specific',
    curriculumId: 'eng_exam_1', contentProfileId: 'exam_3rd_cut', routeTitle: '수능 절대평가 3등급 보장 루트', routeDescription: '딱 필요한 빈출 유형(주제, 제목, 목적 등)만 맞춰서 3등급 컷을 넘기는 전략.',
    contentProfile: 'exam_3rd_cut',
    contentRules: ['수능형 지문 입문', '쉬운 유형(주제, 제목, 목적 파악) 위주로 집중 훈련', '어려운 고난도 빈칸, 삽입 등은 스킵하고 기본 독해력 회복에 중점'],
    listeningRouteId: 'eng_listening_sentence_focus',
    listeningRouteTitle: '문장 집중 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~5분: 오늘의 청취 타겟 핵심 문장(구문) 소개 및 듣기 목표 세팅",
      "5~10분: 대상 지문 1차 듣기",
      "10~15분: 스크립트 내 핵심 문장의 구문적 요소를 낱낱이 분석 및 청취 장애 요소 제거",
      "15~20분: 구문을 머릿속으로 시각화하며 2차 재청취",
      "20~25분: 분해했던 문장 구조 그대로 연결해서 따라 읽기(쉐도잉)",
      "25~30분: 구문에 따른 발음 연음 현상 및 구조 정리",
      "[포인트] 독해 구문론을 듣기에 그대로 얹어 시너지를 내는 특화 분석"
    ],
    tagline: '효율로 승부하는 수능 3등급', intro: '들을 것 듣고 맞출 것 맞추는 콤팩트 강의.', features: ['듣기 만점 방어', '쉬운 유형 절대 방어', '어려운 문항 버리기 전략'] 
  },
  eng7: { 
    id: 'h_eng7', subject: 'eng', name: '류지호', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng7.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3'], targetRanks: ['2~3등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 류지호 선생님이다. 문제 유형만 잡아도 점수는 올라간다.",
        styleMessage: "내 수업은 ‘어떻게 풀지’를 정확히 알려주는 수업이다.",
        motivationMessage: "지금부터 유형별로 정리해서 바로 써먹게 만들어준다."
      },
      repeatClass: {
        checkMessage: "숙제는 했나. 유형 기억 안 나면 다시 잡는다.",
        reviewMessage: "지난 시간 패턴 기억하는지 확인하고 간다."
      }
    },
    mode: 'subject_specific',
    curriculumId: 'eng_exam_2', contentProfileId: 'exam_logical_flow', routeTitle: '수능 빈칸/순서/삽입 마스터 루트', routeDescription: '영어에서 가장 오답률이 높은 논리 파트를 기계적인 공식으로 풀어내는 실전 반.',
    contentProfile: 'exam_logical_flow',
    contentRules: ['빈칸 추론, 순서 배열, 문장 삽입 중심', '근거를 찾는 엑스레이 독해 공식 제공', '확실한 오답 소거법 및 타임어택 논리 훈련'],
    listeningRouteId: 'eng_listening_speed',
    listeningRouteTitle: '실전 압축 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~3분: 오늘 달성할 실전 듣기 점수 목표 및 타임어택 세팅",
      "3~10분: 실전 모의고사 세트 1차 듣기 풀이 (극한의 시간 압박)",
      "10~15분: 득점 여부 정답 확인 및 틀린 문제 분리",
      "15~20분: 오답에 대한 매우 빠르고 치명적인 솔루션 해설",
      "20~25분: 틀렸던 함정 구간 집중 2차 청취 및 약점 구간 쉐도잉 타격",
      "25~30분: 청취 시 시간 낭비 줄이는 버리기/취하기 전략 정리",
      "[포인트] 극한의 효율 및 시간 관리 능력이 중점"
    ],
    tagline: '답의 근거를 찾는 엑스레이', intro: '느낌이 아닌 오답 소거법과 명확한 근거 잡기.', features: ['논리 전개 공식 적용', '매력적인 오답 소거법', '실전 모의고사 멘탈 관리'] 
  },
  eng8: { 
    id: 'h_eng8', name: '송채린', subject: 'eng', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng8.webp'),
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    introPhase: {
      firstClass: {
        introMessage: "난 송채린 선생님이야. 앞으로 수능 영어를 구조로 완전히 정복하게 만들어줄게.",
        styleMessage: "내 수업은 감으로 푸는 게 아니라, 문문을 해체해서 논리로 푸는 방식이야.",
        motivationMessage: "지금부터 영어를 ‘읽는 게 아니라 분석하는 법’을 배우게 될 거야. 믿고 따라와."
      },
      repeatClass: {
        checkMessage: "숙제는 했겠지. 복습 안 했으면 오늘 바로 티 난다.",
        reviewMessage: "지난 시간 구조 기억하는지 바로 확인하면서 시작한다."
      }
    },
    mode: 'subject_specific',
    curriculumId: 'eng_top_1', contentProfileId: 'logic_structure_reading', routeTitle: '논리 독해 심화 루트', routeDescription: '한두 문제 차이로 흔들리지 않는 압도적인 1등급을 위한 초정밀 훈련 루트.',
    contentProfile: 'logic_structure_reading',
    tone: '차갑고 정확함',
    teachingStyle: '1등급의 정밀함을 지키는 빈틈없는 수능 영어 전문가',
    contentRules: [
      '[1등급 논리 해체 독해 프로토콜 적용]',
      '1. 킬러 문항을 주고 즉시 해설/정답 공개 금지. 학생이 스스로의 접근 논리(역접 앞뒤 구조, 원인 파악, 타겟 개념)를 먼저 설명토록 유도.',
      '2. 학생의 논리 전개를 단계별(핵심 구조, However 뒤 분석, 빈칸 방향성)로 분해/분석하여 1등급 기준 피드백.',
      '3. 느낌으로 푼 오답과 실제 논리적 매칭간 핀트 어긋남을 집요하게 찾아내 단어 근거(question=doubt -> confidence 등)로 확정짓도록 교정.',
      '4. 단순 번역 금지, 왜 이 문장이 나왔는가를 끝까지 추적.'
    ],
    hearingRules: [
      '단순 청취가 아니라 비교/대조/인과 구조 파악 중심 듣기',
      '지시어와 논리 연결어를 근거로 판단',
      '쉐도잉은 의미 단위 중심'
    ],
    features: [
      '고난도 논리 독해',
      '오답 선지 해부',
      '구문 구조 분석'
    ]
  },

  // ── 고등 물리 (9명) ──
  kim_doyoon: { 
    id: 'kim_doyoon', subject: 'physics', name: '김도윤', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics1.webp'), 
    schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['3~5등급'],
    position: '개념형 / 직관 설명 중심',
    routeTitle: '고1 물리 기초 입문반', routeDescription: '쉬운 말과 직관적 예시로 통합과학 물리 기초를 다지는 수업.',
    tagline: '직관적 설명 중심', intro: '어려운 물리도 일상 예제로 쉽게 풉니다.', features: ['통합과학 대비', '직관적 예시 해설', '가벼운 기초 연습'] 
  },
  park_seoyoon: { 
    id: 'park_seoyoon', subject: 'physics', name: '박서윤', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics2.webp'), 
    schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['2~3등급'],
    position: '실전형 / 문제 적용 중심',
    routeTitle: '고1 실전 문제 적용반', routeDescription: '개념을 바로 실전에 적용하고 연습시키는 훈련반.',
    tagline: '개념을 점수로 직결', intro: '학교 내신 수준의 문제 풀이력을 기릅니다.', features: ['내신 문제 위주', '적용 중심 훈련', '풀이법 암기'] 
  },
  seo_minjae: { 
    id: 'seo_minjae', subject: 'physics', name: '서민재', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics5.webp'), 
    schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['1등급'],
    position: '상위권/최상위 브리지형',
    routeTitle: '고1 심화 브릿지 과정', routeDescription: '물리 1등급을 결정짓는 초고난도 도약반.',
    tagline: '고1 최상위 도약 브릿지', intro: '킬러를 두려워하지 않는 실력을 만듭니다.', features: ['중상 난도 집중', '킬러 브릿지 훈련', '모의고사 변형'] 
  },
  lee_junho: { 
    id: 'lee_junho', subject: 'physics', name: '이준호', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics3.webp'), 
    schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['3~5등급'],
    position: '일반 내신형 / 개념 정비',
    routeTitle: '고2 내신 개념 재정비', routeDescription: '공식과 구조를 다시 잡아주는 상세한 개념 정리반.',
    tagline: '흔들린 개념 완벽 복구', intro: '구조부터 단단하게 잡아줍니다.', features: ['공식 유도 증명', '기초 개념 정비', '내신 문제 대응'] 
  },
  choi_seoyeon: { 
    id: 'choi_seoyeon', subject: 'physics', name: '최서연', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics4.webp'), 
    schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['2~3등급'],
    position: '적용 훈련형 / 실전 속도',
    routeTitle: '고2 적용 집중 훈련', routeDescription: '계산, 그래프, 조건 해석 중심의 실전 적용 훈련 코스.',
    tagline: '그래프와 조건 완벽 해석', intro: '모든 상황을 그래프로 해석합니다.', features: ['조건 해석 훈련', '계산 스피드', '그래프 분석'] 
  },
  jung_woosung: { 
    id: 'jung_woosung', subject: 'physics', name: '정우성', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics9.webp'), 
    schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['1등급'],
    position: '최상위형 / 평가원 킬러 대비',
    routeTitle: '고2 최상위권 평가원 모의반', routeDescription: '평가원 준킬러 및 킬러를 미리 해체하는 전략 훈련반.',
    tagline: '킬러 및 고난도 돌파 전략', intro: '수능 킬러의 본질을 미리 파헤칩니다.', features: ['수능 킬러 선행', '논리 전개 방식 점검', '고난도 N제'] 
  },
  han_jimin: { 
    id: 'han_jimin', subject: 'physics', name: '한지민', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics6.webp'), 
    schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['3~5등급'],
    position: '압축 요약형 / 콤팩트 파이널',
    routeTitle: '고3 개념 압축 파이널', routeDescription: '핵심만 요약하는 3~5등급 수험생을 위한 필수 방어 루트.',
    tagline: '수능 필수 등급 쾌속 방어', intro: '불필요한 공부를 빼고 핵심만 넣습니다.', features: ['개념 초단기 압축', '등급 방어', '필수 유형 분석'] 
  },
  kang_minseok: { 
    id: 'kang_minseok', subject: 'physics', name: '강민석', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics7.webp'), 
    schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['2~3등급'],
    position: '실전 기출형 / 타임어택',
    routeTitle: '고3 기출 대응 집중반', routeDescription: '기출 실전 대응형으로 최고 효율을 내어 2등급을 확보하는 과정.',
    tagline: '기출의 완벽한 자기화', intro: '수능의 맥락을 정확히 잡아냅니다.', features: ['실전 기출 다회독', '평가원 의도 분석', '준킬러 극복'] 
  },
  yoon_seojin: { 
    id: 'yoon_seojin', subject: 'physics', name: '윤서진', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics8.webp'), 
    schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['1등급'],
    position: '만점 종결형 / 킬러 완전 해체',
    routeTitle: '고3 킬러 완벽 해체', routeDescription: '킬러 구조를 완벽하게 해체하여 상위 1% 1등급을 결정짓는 과정.',
    tagline: '함정을 찢어버리는 분석', intro: '킬러 문제의 시야를 완전히 바꿔드립니다.', features: ['킬러 문항 분해', '최상위 모의고사', '신유형 N제'] 
  },


  // ── 고등 화학 (9명) ──
  chem_t1: { id: 'chem_t1', subject: 'chemistry', name: '이도현', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry1.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['4~5등급'], position: '초보 개념 입문', routeTitle: '화학 첫걸음', routeDescription: '개념 완성 첫걸음', tagline: '세상 쉬운 화학', intro: '원소 기호부터 다시 시작합니다.', features: ['기초 화학반응', '원소 암기', '주기율표 파악'] },
  chem_t2: { id: 'chem_t2', subject: 'chemistry', name: '박지연', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry2.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['2~3등급'], position: '내신 실전형', routeTitle: '내신 화학의 정석', routeDescription: '통합과학 내신 직결반', tagline: '화학 만점 코스', intro: '산화환원의 늪을 탈출합니다.', features: ['내신 실전', '자료 해석', '복합 문제'] },
  chem_t3: { id: 'chem_t3', subject: 'chemistry', name: '김민준', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry3.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['1등급'], position: '최상위 선행 브릿지', routeTitle: '화학I 선행반', routeDescription: '화학I 몰과 양적관계 사전 진입', tagline: '의대 지망생 전용', intro: '가장 강력한 선행 집중', features: ['양적관계', '몰수 계산', '최상위 기출'] },
  chem_t4: { id: 'chem_t4', subject: 'chemistry', name: '정서연', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry4.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['4~5등급'], position: '일반 내신 개념형', routeTitle: '화학I 개념 정비', routeDescription: '화학I의 뼈대를 세우는 과정', tagline: '모든 것의 시작점', intro: '암기와 이해의 밸런스', features: ['내신 마스터', '개념 정교화', '필수 공식'] },
  chem_t5: { id: 'chem_t5', subject: 'chemistry', name: '최지훈', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry5.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['2~3등급'], position: '자료 해석 적용형', routeTitle: '표/그래프 분석반', routeDescription: '까다로운 중화반응과 양적관계 도표 분석', tagline: '숫자가 보이는 마법', intro: '더 이상의 자료 해석 포기는 없습니다.', features: ['도표 해석', '양적관계', '계산 스킬'] },
  chem_t6: { id: 'chem_t6', subject: 'chemistry', name: '임나윤', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry6.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['1등급'], position: '최상위 킬러 대비', routeTitle: '화학 킬러 공략', routeDescription: '수능 킬러문항에 준하는 고난도 내신 및 모의고사', tagline: '최강의 킬러 파훼법', intro: '중화와 양적관계 킬러에 대비합니다.', features: ['수능형 내신', '타임어택', '오답 소거'] },
  chem_t7: { id: 'chem_t7', subject: 'chemistry', name: '오시안', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry7.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['4~5등급'], position: '수능 4등급 쾌속형', routeTitle: '4등급 방어 파이널', routeDescription: '킬러를 포기하고 4등급을 사수하는 전략', tagline: '효율의 극대화', intro: '잡을 수 있는 문제는 다 잡습니다.', features: ['비킬러 완벽', '실수 방지', '빠른 회독'] },
  chem_t8: { id: 'chem_t8', subject: 'chemistry', name: '정수아', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry8.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['2~3등급'], position: '기출 실전 분석형', routeTitle: '평가원 기출 해부', routeDescription: '최근 3개년 평가원 트렌드 완벽 분석', tagline: '평가원을 압도하라', intro: '기출의 이면을 봅니다.', features: ['기출 해부', '시각화 풀이', '실전 모의'] },
  chem_t9: { id: 'chem_t9', subject: 'chemistry', name: '강주혁', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry9.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['1등급'], position: '만점 종결 킬러형', routeTitle: '킬러 극복 모의고사', routeDescription: '양적/중화/금속 반응 킬러 완전 정복', tagline: '1등급 그 너머', intro: '어떤 난이도에도 무너지지 않습니다.', features: ['초고난도', '변형 모의', '최고의 통찰력'] },

  // ── 고등 생명과학 (9명) ──
  bio_t1: { id: 'bio_t1', subject: 'biology', name: '이지훈', gender: 'male', image: window.resolveAsset('/hteachers/biology/biology1.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['3~5등급'], position: '생명 기초 입문', routeTitle: '세포와 대사', routeDescription: '통합과학 생명 파트의 완벽한 뼈대 세우기', tagline: '재미난 생명 이야기', intro: '원리를 알아야 암기가 쉽습니다.', features: ['스토리텔링', '용어 정리', '흐름 이해'] },
  bio_t2: { id: 'bio_t2', subject: 'biology', name: '김태연', gender: 'female', image: window.resolveAsset('/hteachers/biology/biology2.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['2~3등급'], position: '유전 기초 실전', routeTitle: '기본 유전 법칙', routeDescription: '중학생 유전부터 업그레이드된 통합과학 유전', tagline: '유전의 자신감', intro: '유전 가계도가 눈에 보입니다.', features: ['가계도 기초', '확률 계산', '내신 문제'] },
  bio_t3: { id: 'bio_t3', subject: 'biology', name: '송재민', gender: 'male', image: window.resolveAsset('/hteachers/biology/biology3.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['1등급'], position: '생명I 선행 브릿지', routeTitle: '생명I 신경과 유전', routeDescription: '가장 어려운 단원을 고1 때 미리 끝냅니다', tagline: '빠르고 확실한 1등급', intro: '남들보다 먼저 앞서갑니다.', features: ['선행 심화', '유전/신경', '고난도 접근'] },
  bio_t4: { id: 'bio_t4', subject: 'biology', name: '이채원', gender: 'female', image: window.resolveAsset('/hteachers/biology/biology4.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['3~5등급'], position: '일반 내신 개념', routeTitle: '생명과학I의 정석', routeDescription: '학교 내신 및 모의고사를 위한 A to Z', tagline: '가장 친절한 생명과학', intro: '놓치는 개념 없이 다 잡습니다.', features: ['빈틈없는 암기', '마인드맵', '내신 완벽'] },
  bio_t5: { id: 'bio_t5', subject: 'biology', name: '박진우', gender: 'male', image: window.resolveAsset('/hteachers/biology/biology5.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['2~3등급'], position: '로직/추론 훈련', routeTitle: '근수축과 신경 전도', routeDescription: '단순 암기를 넘어 논리적 함정을 파훼합니다', tagline: '퍼즐 고수', intro: '논리로 생명을 풉니다.', features: ['신경전도', '근수축', '논리 훈련'] },
  bio_t6: { id: 'bio_t6', subject: 'biology', name: '권유진', gender: 'female', image: window.resolveAsset('/hteachers/biology/biology6.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['1등급'], position: '유전 킬러 타파', routeTitle: '다인자/비분리 킬러 집중반', routeDescription: '학교 최고난도 유전 문제를 1분 내에 푸는 훈련', tagline: '가계도의 지배자', intro: '유전을 게임처럼 즐기게 됩니다.', features: ['다인자 훈련', '돌연변이', '킬러 직관'] },
  bio_t7: { id: 'bio_t7', subject: 'biology', name: '문성호', gender: 'male', image: window.resolveAsset('/hteachers/biology/biology7.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['3~5등급'], position: '수능 3등급 쾌속 방어', routeTitle: '비유전 만점 프로젝트', routeDescription: '킬러 유전을 과감히 버리고 다른 모든 걸 맞춥니다', tagline: '전략적 선택과 집중', intro: '유전을 제외하고 무조건 다 맞춥니다.', features: ['비유전 집중', '기본기 탄탄', '실수 제로'] },
  bio_t8: { id: 'bio_t8', subject: 'biology', name: '안소영', gender: 'female', image: window.resolveAsset('/hteachers/biology/biology8.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['2~3등급'], position: '기출 실전 분석', routeTitle: '수능 기출 트렌드 분석', routeDescription: '최근 평가원 생명과학의 기조 분석반', tagline: '평가원의 눈', intro: '문항 출제자의 의도를 읽어냅니다.', features: ['기출 분석', '루틴 확립', '시간 단축'] },
  bio_t9: { id: 'bio_t9', subject: 'biology', name: '최윤성', gender: 'male', image: window.resolveAsset('/hteachers/biology/biology9.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['1등급'], position: '유전/신경 타임어택', routeTitle: '초격차 만점 모의고사', routeDescription: '시험장 긴장도까지 고려한 최고난도 모의고사 훈련', tagline: '생명 만점의 종착역', intro: '시간 압박 속에서도 흔들리지 않습니다.', features: ['신유형 N제', '실전 모의고사', '최상위 감각'] },

  // ── 고등 지구과학 (9명) ──
  earth_t1: { id: 'earth_t1', subject: 'earth', name: '홍성훈', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth1.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['3~5등급'], position: '지구/우주 기초', routeTitle: '재미있는 지구시스템', routeDescription: '우리 지구의 역사와 환경 첫걸음', tagline: '스토리텔링 지구과학', intro: '옛날 이야기 듣듯 편하게 시작해요.', features: ['쉬운 용어 해설', '그림과 영상', '개념 기반'] },
  earth_t2: { id: 'earth_t2', subject: 'earth', name: '배지민', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth2.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['2~3등급'], position: '환경 변화 분석', routeTitle: '지구 환경의 변화', routeDescription: '엘니뇨, 기후 변화 등 시험에 나오는 킬러 주제', tagline: '트렌디한 지과', intro: '외우는 것을 넘어서 이해로 승부합니다.', features: ['그래프 해석', '내신 문제 대비', '현상 이해'] },
  earth_t3: { id: 'earth_t3', subject: 'earth', name: '강준호', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth3.webp'), schoolLevel: 'high', targetGrades: ['고1'], targetRanks: ['1등급'], position: '천체 선행 브릿지', routeTitle: '별과 우주 선행반', routeDescription: '지구과학에서 가장 까다로운 천체 선행', tagline: '천체 마스터', intro: '헷갈리던 우주가 선명하게 보입니다.', features: ['천체 좌표', '별의 진화', '공간 지각능력'] },
  earth_t4: { id: 'earth_t4', subject: 'earth', name: '오수진', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth4.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['3~5등급'], position: '일반 내신 개념형', routeTitle: '지구과학I 기본 완성', routeDescription: '백지 복습과 이미지트레이닝 중심 개념 완성', tagline: '단어부터 제대로', intro: '아는 만큼 보입니다.', features: ['꼼꼼한 백지복습', '기본기 탄탄', '내신 필수'] },
  earth_t5: { id: 'earth_t5', subject: 'earth', name: '이민재', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth5.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['2~3등급'], position: '도표/사진 해석형', routeTitle: '그래프/관측 자료 분석', routeDescription: '사진, 그래프가 주어지는 응용 문제 대비반', tagline: '자료 분석 스페셜리스트', intro: '낯선 그림도 당황하지 않습니다.', features: ['자료 분석', '응용 패턴 암기', '함정 탈출'] },
  earth_t6: { id: 'earth_t6', subject: 'earth', name: '최유리', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth6.webp'), schoolLevel: 'high', targetGrades: ['고2'], targetRanks: ['1등급'], position: '천체 킬러 파헤치기', routeTitle: '외계 행성계와 고지자기', routeDescription: '고도의 관측 데이터 해석과 논리 연산 집중반', tagline: '천문 연산 고수', intro: '천체 킬러를 즐기며 풉니다.', features: ['정밀 관측 추론', '별의 물리량 연산', '고난도 N제'] },
  earth_t7: { id: 'earth_t7', subject: 'earth', name: '류재현', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth7.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['3~5등급'], position: '수능 3등급 쾌속형', routeTitle: '개념 지엽 선별반', routeDescription: '수능 빈출 지엽과 핵심 개념을 속성 암기', tagline: '핵심만 파고든다', intro: '최단 시간에 스코어를 끌어올립니다.', features: ['지엽 특강', '빈출 주제 분석', '개념 쾌속 회독'] },
  earth_t8: { id: 'earth_t8', subject: 'earth', name: '김보라', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth8.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['2~3등급'], position: '기출 실전 자료형', routeTitle: '평가원 자료 분석', routeDescription: '수능, 모평의 오답률 상위 자료 완벽 분석반', tagline: '오답의 함정을 피해가다', intro: '왜 낚이는지 알면 안 낚입니다.', features: ['오답 선지 분석', '신유형 대비 자료해석', '실전 문제'] },
  earth_t9: { id: 'earth_t9', subject: 'earth', name: '백건우', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth9.webp'), schoolLevel: 'high', targetGrades: ['고3'], targetRanks: ['1등급'], position: '만점 종결 지과 킬러', routeTitle: '킬러 통찰 1등급 모의고사', routeDescription: '가장 난해한 지엽과 복합 추론 자료 모의고사 훈련', tagline: '지구과학 1%의 여유', intro: '어떤 난제라도 정석대로 부서집니다.', features: ['초고난도 복합 추론', '허를 찌르는 지엽', '만점 파이널 모의'] }
};
