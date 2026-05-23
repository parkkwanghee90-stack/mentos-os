// src/data/mTeacherProfiles.js
export const MIDDLE_TEACHER_PROFILES = {
  // ── 중등 수학 (6명) ──
  math1: { 
    id: 'm_math1', subject: 'math', name: '최민재', gender: 'male', image: '/mteachers/math/math1.webp', 
    schoolLevel: 'middle', track: 'foundation', targetGrades: ['중1', '중2'], targetRanks: ['기초', '수포자'],
    mode: 'subject_specific',
    routeId: 'm_math_fnd', routeTitle: '중등 기초 개념 복구 루트', routeDescription: '수학의 뼈대를 다시 세우는 기초 공사. 수포자 탈출을 위한 필수 과정입니다.',
    tagline: '개념부터 묻고 더블로 가', intro: '중학 수학의 기본기를 완벽히 다져줍니다.', features: ['눈높이 맞춤 설명', '쉬운 연산 반복 훈련', '기초 개념 완전 정복'] 
  },
  math2: { 
    id: 'm_math2', subject: 'math', name: '안지은', gender: 'female', image: '/mteachers/math/math2.webp', 
    schoolLevel: 'middle', track: 'advanced', targetGrades: ['중2', '중3'], targetRanks: ['최상위', '선행'],
    mode: 'subject_specific',
    routeId: 'm_math_adv', routeTitle: '중등 심화 최상위 루트', routeDescription: '고교 수학을 여유롭게 대비하는 심화 사고력 훈련 과정입니다.',
    tagline: '한계를 넘어서는 논리력', intro: '단순 계산을 넘어선 사고력 확장을 약속합니다.', features: ['고난도 심화 문제풀이', '서술형 완벽 대비', '고등 선행 브릿지'] 
  },
  // TODO: Add remaining 4 math teachers
  math3: { id: 'm_math3', subject: 'math', name: '박태윤', gender: 'male', image: '/mteachers/math/math3.webp', schoolLevel: 'middle', track: 'intermediate', targetGrades: ['중1','중2'], targetRanks: ['중위권'],
    mode: 'subject_specific', routeId: 'm_math_3', routeTitle: '중위권 도약반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  math4: { id: 'm_math4', subject: 'math', name: '윤소율', gender: 'female', image: '/mteachers/math/math4.webp', schoolLevel: 'middle', track: 'intermediate', targetGrades: ['중2','중3'], targetRanks: ['중위권'],
    mode: 'subject_specific', routeId: 'm_math_4', routeTitle: '기출 분석반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  math5: { id: 'm_math5', subject: 'math', name: '송준혁', gender: 'male', image: '/mteachers/math/math5.webp', schoolLevel: 'middle', track: 'advanced', targetGrades: ['중3'], targetRanks: ['상위권'],
    mode: 'subject_specific', routeId: 'm_math_5', routeTitle: '특목자사대비반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  math6: { id: 'm_math6', subject: 'math', name: '이다은', gender: 'female', image: '/mteachers/math/math6.webp', schoolLevel: 'middle', track: 'foundation', targetGrades: ['중1','중2','중3'], targetRanks: ['하위권'],
    mode: 'subject_specific', routeId: 'm_math_6', routeTitle: '연산 집중반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },

  // ── 중등 영어 (6명) ──
  eng1: { 
    id: 'm_eng1', subject: 'eng', name: '윤재현', gender: 'male', image: '/mteachers/eng/eng1.webp', 
    schoolLevel: 'middle', track: 'foundation', targetGrades: ['중1', '중2'], targetRanks: ['기초'],
    mode: 'subject_specific',
    routeId: 'm_eng_fnd', routeTitle: '중등 기초 어휘/구문 루트', routeDescription: '영어의 읽기 자체를 두려워하는 학생들을 위한 파닉스/기초 독해 뼈대 세우기.',
    tagline: '영어가 읽히는 놀라운 마법', intro: '알파벳 조합부터 단문 구조까지 편안하게.', features: ['재미있는 어휘 암기법', '단문 해석 구조 파악', '영어 울렁증 극복'] 
  },
  eng2: { 
    id: 'm_eng2', subject: 'eng', name: '서수아', gender: 'female', image: '/mteachers/eng/eng2.webp', 
    schoolLevel: 'middle', track: 'advanced', targetGrades: ['중2', '중3'], targetRanks: ['최상위'],
    mode: 'exam_reading',
    routeId: 'm_eng_adv', routeTitle: '중등 심화 수능 선행 루트', routeDescription: '중학교 때 이미 수능 영어 핵심을 마스터하는 템포 빠른 선행 과정.',
    contentProfile: 'advanced_reading_prep',
    recommendedTextType: ['고1 학력평가 기출 변형', '철학/과학/사회 논리 지문', '고등 필수 구문 포함 지문'],
    contentRules: [
      "[핵심 수칙] 절대 '주어 동사 찾기', 'I eat apples' 수준 기초 문법 설명 금지! 이 학생들은 최상위권입니다.",
      "1. 첫 발화 시, 분위기를 잡고 바로 고등학교 수능 모의고사 수준의 실전 비문학 지문을 하나 제공하라.",
      "2. 지문을 해석하지 말고, '이 첫 번째 문장이 뒤의 어떤 내용을 암시할까?'와 같은 논리적 추론형 의문을 던져라.",
      "3. 기초 문법 용어를 나열하지 말고, 어려운 구문에 대해서만 정밀 타격 해설을 진행하라.",
      "4. 절대 학생 수준을 낮춰보지 마라. 기초 단어 점검은 배제하라."
    ],
    tagline: '예비 고등을 위한 단단한 영어', intro: '수능 모의고사를 두려움 없이 풀 수 있는 실력.', features: ['고등 문법/구문 선행', '장문 독해 훈련', '수능 기출맛보기'] 
  },
  // TODO: Add remaining 4 english teachers
  eng3: { id: 'm_eng3', subject: 'eng', name: '신은우', gender: 'male', image: '/mteachers/eng/eng3.webp', schoolLevel: 'middle', track: 'intermediate', targetGrades: ['중1','중2'], targetRanks: ['중위권'],
    mode: 'subject_specific', routeId: 'm_eng_3', routeTitle: '내신 문법반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  eng4: { id: 'm_eng4', subject: 'eng', name: '배지유', gender: 'female', image: '/mteachers/eng/eng4.webp', schoolLevel: 'middle', track: 'intermediate', targetGrades: ['중2','중3'], targetRanks: ['중위권'],
    mode: 'subject_specific', routeId: 'm_eng_4', routeTitle: '내신 독해반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  eng5: { id: 'm_eng5', subject: 'eng', name: '조예준', gender: 'male', image: '/mteachers/eng/eng5.webp', schoolLevel: 'middle', track: 'advanced', targetGrades: ['중3'], targetRanks: ['상위권'],
    mode: 'subject_specific', routeId: 'm_eng_5', routeTitle: '특목자사 대비반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  eng6: { id: 'm_eng6', subject: 'eng', name: '유해린', gender: 'female', image: '/mteachers/eng/eng6.webp', schoolLevel: 'middle', track: 'foundation', targetGrades: ['중1','중2','중3'], targetRanks: ['하위권'],
    mode: 'subject_specific', routeId: 'm_eng_6', routeTitle: '듣기/말하기반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },

  // ── 중등 과학 (4명) ──
  // TODO: Add 4 science teachers
  science1: { id: 'm_sci1', subject: 'science', name: '강건우', gender: 'male', image: '/mteachers/science/science1.webp', schoolLevel: 'middle', track: 'foundation', targetGrades: ['중1','중2'], targetRanks: ['기초'],
    mode: 'subject_specific', routeId: 'm_sci_1', routeTitle: '통합과학 입문반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  science2: { id: 'm_sci2', subject: 'science', name: '정아윤', gender: 'female', image: '/mteachers/science/science2.webp', schoolLevel: 'middle', track: 'intermediate', targetGrades: ['중1','중2'], targetRanks: ['중위권'],
    mode: 'subject_specific', routeId: 'm_sci_2', routeTitle: '통합과학 개념반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  science3: { id: 'm_sci3', subject: 'science', name: '문시윤', gender: 'male', image: '/mteachers/science/science3.webp', schoolLevel: 'middle', track: 'advanced', targetGrades: ['중2','중3'], targetRanks: ['상위권'],
    mode: 'subject_specific', routeId: 'm_sci_3', routeTitle: '통합과학 선행반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] },
  science4: { id: 'm_sci4', subject: 'science', name: '김시은', gender: 'female', image: '/mteachers/science/science4.webp', schoolLevel: 'middle', track: 'advanced', targetGrades: ['중3'], targetRanks: ['상위권', '최상위'],
    mode: 'subject_specific', routeId: 'm_sci_4', routeTitle: '물화생지 심화반', routeDescription: '준비 중입니다.', tagline: '준비 중', intro: '준비 중', features: ['준비 중'] }
};
