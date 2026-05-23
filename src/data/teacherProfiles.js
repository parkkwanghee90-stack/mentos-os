/**
 * TEACHER_PROFILES — serializable teacher data
 * 
 * New Schema:
 * - id: string
 * - subject: string
 * - name: string
 * - image: string
 * - tagline: string
 * - intro: string
 * - features: string[]
 * - target: string
 */
import { URL_PREFIX } from '../config/assets';
import { MIDDLE_TEACHER_PROFILES } from './mTeacherProfiles';
import { HIGH_TEACHER_PROFILES } from './hTeacherProfiles';


export const TEACHER_PROFILES = {
  // ── 고등 수학은 hTeacherProfiles.js에서 중앙 관리됩니다. ──



  // ── 영어 (8명) ──
  eng1: { 
    id: 'eng1', subject: 'eng', name: '백도진', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1', '고2'], targetRanks: ['4~6등급'],
    mode: 'interest_reading',
    routeId: 'eng_high_story', routeTitle: '고등 기초 스토리 독해 루트', routeDescription: '짧고 재미있는 일상 스토리로 영어의 흥미와 기초 해석력을 되찾는 과정입니다.',
    contentProfile: 'story_life_interest',
    recommendedTextType: ['친구와의 약속 이야기', '늦잠으로 지각한 날', '학교에서 있었던 일'],
    contentRules: [
      "[핵심] 문장 만들기 중심 수업 불가. go/went 같은 패턴 시제 반복 금지.",
      "[수업구조 강제] 0. 흥미 유발 오프닝 -> 1. 아주 짧은 일상 스토리(한국어 설명 포함) 제공 -> 2. 스토리 내 핵심 단어 쉽게 풀이 -> 3. 가벼운 느낌의 리액션(간단 질문)",
      "영어 문장을 작문(영작)하라고 시키는 것 완벽 금지."
    ],
    tagline: '영어가 읽히는 놀라운 스토리', intro: '단순 반복 영작 금지. 쉽고 재밌는 스토리로 영어를 이해합니다.', features: ['짧은 일상 스토리 독해', '스토리 기반 맥락 이해', '영작 없는 편안한 해석'] 
  },
  eng2: { 
    id: 'eng2', subject: 'eng', name: '설윤아', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng2.webp'), 
    schoolLevel: 'middle', track: 'advanced', targetGrades: ['중2', '중3'], targetRanks: ['1~2등급'],
    mode: 'exam_reading',
    routeId: 'eng_mid_adv', routeTitle: '중등 심화 수능 선행 루트', routeDescription: '중학교 때 이미 수능 영어 핵심을 마스터하는 템포 빠른 선행 과정.',
    contentProfile: 'advanced_reading_prep',
    recommendedTextType: ['고1 학력평가 기출 변형', '철학/과학/사회 논리 지문', '고등 필수 구문 포함 지문'],
    contentRules: [
      "[핵심 수칙] 절대 '주어 동사 찾기', 'I eat apples' 수준 기초 문법 설명 금지! 이 학생들은 1~2등급 최상위권입니다.",
      "1. 첫 발화 시, 분위기를 잡고 바로 고등학교 수능 모의고사 수준의 실전 비문학 지문을 하나 제공하라.",
      "2. 지문을 해석하지 말고, '이 첫 번째 문장이 뒤의 어떤 내용을 암시할까?'와 같은 논리적 추론형 난제 질문을 던져라.",
      "3. 기초 문법 용어를 나열하지 말고, 수능 빈출 어려운 구문(도치, 관계사 생략 등)에 대해서만 정밀 타격 해설을 진행하라.",
      "4. 절대 학생 수준을 낮춰보지 마라. 기초 단어, 쉬운 예시는 전부 차단하라."
    ],
    tagline: '예비 고등을 위한 단단한 영어', intro: '수능 모의고사를 두려움 없이 풀 수 있는 실력.', features: ['고등 문법/구문 선행', '장문 독해 훈련', '수능 기출맛보기'] 
  },
  eng3: { 
    id: 'eng3', subject: 'eng', name: '한시우', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng3.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고1', '고2'], targetRanks: ['4~6등급'],
    mode: 'subject_specific',
    routeId: 'eng_high_found', routeTitle: '고등 영포자 구원 루트', routeDescription: '포기하기 직전의 영어를 끌어올려 필수 등급을 방어하는 단기 완성 루트.',
    tagline: '마지막으로 영어를 믿어봐', intro: '문법 용어 없이 이해시키는 구문 독해.', features: ['필수 영단어 매일 반복', '문장 끊어 읽기 공식', '해석의 감 유지'] 
  },
  eng4: { 
    id: 'eng4', subject: 'eng', name: '정유나', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng4.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고1', '고2'], targetRanks: ['1~2등급'],
    mode: 'logic_advanced',
    routeId: 'eng_high_gpa', routeTitle: '고등 내신 1등급 방어 루트', routeDescription: '교과서 본문과 부교재의 지엽적인 변형까지 완벽하게 소화하는 내신 대비반.',
    tagline: '빈틈없는 내신 1등급 로드맵', intro: '서술형 영작부터 지문 변형까지 대비.', features: ['지문 구조화 암기법', '서술형 영작 패턴 훈련', '어법 함정 돌파'] 
  },
  eng5: { 
    id: 'eng5', subject: 'eng', name: '신지훈', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng5.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2', '고3'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'eng_high_adv', routeTitle: '고등 심화 구문 독해 루트', routeDescription: '복잡한 수식과 기나긴 문장을 한국어처럼 자연스럽게 처리하는 심화 과정.',
    tagline: '복잡한 문장도 한 눈에', intro: '번역이 아닌 진정한 이해로 이끕니다.', features: ['초장문 구조 분석', 'EBS 연계 심층 분석', '고난도 주제 완벽 정리'] 
  },
  eng6: { 
    id: 'eng6', subject: 'eng', name: '임하민', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng6.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['4~5등급'],
    mode: 'subject_specific',
    routeId: 'eng_exam_found', routeTitle: '수능 절대평가 3등급 보장 루트', routeDescription: '딱 필요한 빈출 유형(주제, 제목, 목적 등)만 맞춰서 3등급 컷을 넘기는 전략.',
    tagline: '효율로 승부하는 수능 3등급', intro: '들을 것 듣고 맞출 것 맞추는 콤팩트 강의.', features: ['듣기 만점 방어', '쉬운 유형 절대 방어', '어려운 문항 버리기 전략'] 
  },
  eng7: { 
    id: 'eng7', subject: 'eng', name: '류지호', gender: 'male', image: window.resolveAsset('/hteachers/eng/eng7.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'eng_exam_prac', routeTitle: '수능 빈칸/순서/삽입 마스터 루트', routeDescription: '영어에서 가장 오답률이 높은 논리 파트를 기계적인 공식으로 풀어내는 실전 반.',
    tagline: '답의 근거를 찾는 엑스레이', intro: '느낌이 아닌 오답 소거법과 명확한 근거 잡기.', features: ['논리 전개 공식 적용', '매력적인 오답 소거법', '실전 모의고사 멘탈 관리'] 
  },
  eng8: { 
    id: 'eng8', subject: 'eng', name: '송채린', gender: 'female', image: window.resolveAsset('/hteachers/eng/eng8.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고1', '고2', '고3'], targetRanks: ['1등급 일부', '2등급', '3등급'],
    mode: 'subject_specific',
    routeId: 'eng_logic_reading', routeTitle: '논리 독해 심화 루트', routeDescription: '한두 문제 차이로 흔들리지 않는 압도적인 1등급을 위한 초정밀 훈련 루트.',
    contentProfile: 'logic_structure_reading',
    recommendedTextType: ['주장형 글', '비교/대조 구조', '인과 관계 설명문', '수능형 비문학 지문'],
    contentRules: [
      "[핵심 철학] '해석'이 아니라 '이유'를 읽게 만든다. 문단 역할을 보며 '왜 이 문장이 여기 나왔을까?' 질문",
      "0~5분: (오프닝) 오늘 글의 구조(예: 문제 제기 -> 해결 -> 결론) 설명. 시작 강제 문장: '오늘은 글을 해석하는 게 아니라, 이 글이 왜 이렇게 전개되는지를 같이 볼게요.'",
      "5~15분: (논리 연결어 훈련 - 10분) however, therefore 등 단순 뜻이 아니라 논리적 역할 설명",
      "15~35분: (핵심 독해 - 20분) 지문 1개(수능형 비문학). 문단 역할 파악, 핵심 문장 찾기, 앞뒤 연결 이해",
      "35~45분: (최소 문법 - 10분) 논리 이해에 필요한 수식 구조/접속사/분사구문 등 독해 연결 중심 (단편적 문법 설명 금지)",
      "45~55분: (문제 적용 - 15분) 빈칸/순서/문장 삽입 등 풀이. 정답인 이유와 오답인 이유 논리 분석",
      "55~60분: (정리 - 5분) 오늘 글 한 줄 요약 및 논리 흐름 정리 마무리",
      "[금지 사항] 단어 암기 중심 금지. 문장 하나씩 번역만 하는 것 금지. 질문으로 첫 발화 시작 금지. 수능형 지문인데 구조 설명 없이 해석만 하는 것 절대 금지."
    ],
    listeningRouteId: 'eng_listening_logic',
    listeningRouteTitle: '논리 듣기 루트',
    listeningRules: [
      "[공통 규칙] 총 30분 집중 코스. 예측 → 듣기 → 확인 → 스크립트 분석 → 재청취 → 말하기/쉐도잉 → 정리 순서. 목적 선공지. 최소 2회 청취. 마지막 스피킹 강제.",
      "0~3분: 듣게 될 대화나 지문의 거시적 논리 구조(ex. 문제상황-해결) 사전 안내 및 듣기 목적(근거찾기) 설명",
      "3~10분: 1차 듣기 진행 (들으며 why 찾기 집중)",
      "10~15분: 단순 해석이 아닌 지문 내 연결고리와 논리 흐름 분석 검증",
      "15~20분: 논리 흐름을 전환하는 핵심 지시어 및 문장 역할 정밀 분석",
      "20~25분: 논리 지도(Map)를 그리며 2차 재청취 및 근거 문장 쉐도잉",
      "25~30분: 대화의 논리 전개도 요약 및 입 밖으로 말해보기",
      "[포인트] 단순 청취가 아닌 Why 중심의 맥락/흐름 파악 훈련"
    ],
    tagline: '1등급의 품격을 지키는 영어', intro: '어떤 불수능에도 끄떡없는 실력 완성.', features: ['원어민 수준 뉘앙스 파악', '고난도 철학/과학 지문 대비', '최강 모의고사 훈련'] 
  },

  // ── 물리 (4명) ──
  physics1: { 
    id: 'physics1', subject: 'physics', name: '주현우', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고2', '고3'], targetRanks: ['3~5등급'],
    mode: 'subject_specific',
    routeId: 'phys_found', routeTitle: '물리 개념 정상화 루트', routeDescription: '물리가 두렵고 계산이 안 풀리는 학생을 위한 세상에서 가장 편안한 물리 기초.',
    tagline: '눈으로 보는 직관 물리학', intro: '공식 암기를 최소화하고 현상을 이해시킵니다.', features: ['개념 시각화 강의', '역학 기초 반복 훈련', '쉬운 3점 문항 방어'] 
  },
  physics2: { 
    id: 'physics2', subject: 'physics', name: '안세연', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2', '고3'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'phys_gpa', routeTitle: '물리 내신 만점 돌파 루트', routeDescription: '수능형 내신 문제까지 전부 잡아내는 꼼꼼하고 예리한 학교 시험 특화.',
    tagline: '오답의 틈을 없애는 정밀성', intro: '가장 많은 선배들이 검증한 물리 만점 플랜.', features: ['학교 기출 집중 분석', '함정 문항 완벽 대처', '서술형 감점 요소 파악'] 
  },
  physics3: { 
    id: 'physics3', subject: 'physics', name: '신재혁', gender: 'male', image: window.resolveAsset('/hteachers/physics/physics3.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'phys_exam', routeTitle: '수능 물리 실전 가속 루트', routeDescription: '시간이 부족한 물리학 풀이를 위해 최적화된 도구 모음집과 실전 감각 배양.',
    tagline: '1분 컷을 향한 지름길', intro: '역학을 패턴화하여 누구보다 스피디하게 풀어냅니다.', features: ['시간 단축 스킬', '특수 도구 활용 풀이', '타임 어택 실전 모의고사'] 
  },
  physics4: { 
    id: 'physics4', subject: 'physics', name: '오지윤', gender: 'female', image: window.resolveAsset('/hteachers/physics/physics4.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    mode: 'subject_specific',
    routeId: 'phys_top', routeTitle: '수능 물리 역학 정복 루트', routeDescription: '물리의 꽃인 킬러 역학/전자기 문항을 완벽히 부수고 항상 50점을 확보하는 과정.',
    tagline: '최상위를 위한 단 하나의 선택', intro: '가장 낯선 상황에서도 흔들림 없는 킬러 파훼법.', features: ['초고난도 킬러 문항 철거', '이색 문항 다각도 분석', '상위권 N제 융단폭격'] 
  },

  // ── 화학 (4명) ──
  chemistry1: { 
    id: 'chemistry1', subject: 'chemistry', name: '이태준', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고2', '고3'], targetRanks: ['3~5등급'],
    mode: 'subject_specific',
    routeId: 'chem_found', routeTitle: '화학 진입 장벽 분쇄 루트', routeDescription: '양적 관계의 문턱마저 넘지 못한 수험생을 위한 세상에서 가장 명쾌한 입문.',
    tagline: '원리로 통쾌하게 부수는 화학', intro: '복잡한 계산 없이 원리만으로 풀 수 있습니다.', features: ['양적 관계 시작점 코칭', '비킬러 개념 고정화', '화학식 해석 기초 다지기'] 
  },
  chemistry2: { 
    id: 'chemistry2', subject: 'chemistry', name: '강하윤', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2', '고3'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'chem_gpa', routeTitle: '화학 내신 1등급 독점 루트', routeDescription: '내신 특유의 까다로운 화학 개념 검증과 변형 문항을 완벽히 방어하는 코스.',
    tagline: '실망을 모르는 화학 만점반', intro: '예리한 눈으로 함정을 낱낱이 파헤칩니다.', features: ['지엽 개념 완벽 통제', '1등급 결정 문항 대비', '학교별 기출 복원'] 
  },
  chemistry3: { 
    id: 'chemistry3', subject: 'chemistry', name: '선우진', gender: 'male', image: window.resolveAsset('/hteachers/chemistry/chemistry3.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'chem_exam', routeTitle: '수능 화학 킬러 진입 루트', routeDescription: '비킬러를 넘어 양적 관계와 중화 반응 등 본격적인 수능 1등급 장벽을 뚫는 코스.',
    tagline: '점수 급상승의 기폭제', intro: '화학의 뼈대를 완성하고 킬러 유형에 익숙해집니다.', features: ['비킬러 스피드 풀이', '양적관계 공식화 적용', '실전 모의고사 운영 팁'] 
  },
  chemistry4: { 
    id: 'chemistry4', subject: 'chemistry', name: '백서연', gender: 'female', image: window.resolveAsset('/hteachers/chemistry/chemistry4.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    mode: 'subject_specific',
    routeId: 'chem_top', routeTitle: '수능 화학 50점 보장 루트', routeDescription: '최상위권 생존을 위한 시간 단축의 극의. 모든 킬러를 1분 내에 해독합니다.',
    tagline: '화학의 정점에 도달하는 비결', intro: '상위 1%만을 위한 극강의 타임 어택 솔루션.', features: ['초단기 킬러 분석 스킬', '극상위 모의고사 집중', '신경향 완전 분해'] 
  },

  // ── 생명과학 (4명) ──
  bio1: { 
    id: 'bio1', subject: 'bio', name: '정우현', gender: 'male', image: window.resolveAsset('/hteachers/bio/bio1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고2', '고3'], targetRanks: ['3~5등급'],
    mode: 'subject_specific',
    routeId: 'bio_found', routeTitle: '생명과학 비유전 만점 루트', routeDescription: '유전이 두렵더라도 나머지 비유전 파트에서 무조건 만점을 받아 3등급 컷을 확보합니다.',
    tagline: '점수가 차곡차곡 쌓이는 생명', intro: '생명과학의 70%를 확실하게 책임집니다.', features: ['비유전 완벽 암기 코칭', '헷갈리는 개념 일망타진', '쉬운 문항 절대 방어'] 
  },
  bio2: { 
    id: 'bio2', subject: 'bio', name: '이채원', gender: 'female', image: window.resolveAsset('/hteachers/bio/bio2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2', '고3'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'bio_gpa', routeTitle: '생명과학 내신 압도 1위 루트', routeDescription: '내신 시험 고유의 엉뚱한 지엽 함정과 디테일을 완벽하게 잡아내는 꼼꼼반.',
    tagline: '흔들림 없는 생명과학 1번지', intro: '세밀한 곳까지 파고들어 절대 점수를 뺏기지 않습니다.', features: ['지엽 선지 대비 훈련', '교과서 외 개념 방어', '서술형 집중 연습'] 
  },
  bio3: { 
    id: 'bio3', subject: 'bio', name: '김하준', gender: 'male', image: window.resolveAsset('/hteachers/bio/bio3.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'bio_exam', routeTitle: '수능 가계도 첫걸음 루트', routeDescription: '유전의 꽃, 가계도를 더 이상 포기하지 않고 기초부터 차근차근 해석하는 훈련.',
    tagline: '유전의 두려움을 딛고 일어서다', intro: '논리적인 유전 해석법으로 새로운 돌파구를 엽니다.', features: ['유전 확률 단계별 분석', '가계도 기초 해석 규칙', '도표 분석력 향상'] 
  },
  bio4: { 
    id: 'bio4', subject: 'bio', name: '류나연', gender: 'female', image: window.resolveAsset('/hteachers/bio/bio4.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    mode: 'subject_specific',
    routeId: 'bio_top', routeTitle: '수능 생명 킬러 해부 루트', routeDescription: '수능 역사상 가장 어려웠던 가계도와 돌연변이 문항마저 기계적으로 풀어내는 최상위반.',
    tagline: '생명과학 킬러 0.01%의 시선', intro: '가장 빠른 시간 안에 유전을 풀어낼 수직 스킬.', features: ['초극강 가계도 해체기', '복수의 조건 최적화 결합', '상위 1% 모의고사 훈련'] 
  },

  // ── 지구과학 (4명) ──
  earth1: { 
    id: 'earth1', subject: 'earth', name: '장동욱', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth1.webp'), 
    schoolLevel: 'high', track: 'foundation', targetGrades: ['고2', '고3'], targetRanks: ['3~5등급'],
    mode: 'subject_specific',
    routeId: 'earth_found', routeTitle: '지구과학 노베이스 쾌속 진입 루트', routeDescription: '지구과학을 처음 선택하거나 늦게 진입한 학생들을 위한 가장 편안하고 빠른 안착.',
    tagline: '지구과학의 든든한 가이드', intro: '방대한 암기량을 가장 쉽게 소화하게 돕습니다.', features: ['가벼운 개념 시각화', '입문형 모의고사 훈련', '포기 방지 페이스 메이킹'] 
  },
  earth2: { 
    id: 'earth2', subject: 'earth', name: '민하린', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth2.webp'), 
    schoolLevel: 'high', track: 'advanced', targetGrades: ['고2', '고3'], targetRanks: ['1~2등급'],
    mode: 'subject_specific',
    routeId: 'earth_gpa', routeTitle: '지구과학 내신 철벽어 루트', routeDescription: '학교마다 다른 지엽적인 개념과 까다로운 선지 변형을 완벽히 방어합니다.',
    tagline: '교과서를 통째로 먹는 암기력', intro: '학교 쌤의 출제 의도까지 캐치하는 디테일.', features: ['단원별 함정 집중 분석', '학교별 기출 빈출 비교', '빈칸 채우기 하드 트레이닝'] 
  },
  earth3: { 
    id: 'earth3', subject: 'earth', name: '남기주', gender: 'male', image: window.resolveAsset('/hteachers/earth/earth3.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['2~3등급'],
    mode: 'subject_specific',
    routeId: 'earth_exam', routeTitle: '수능 지구과학 자료해석 집중 루트', routeDescription: '지구과학 최대 고비인 도표, 그래프, 천안 사진 등 입체적인 자료 해석 정복 훈련.',
    tagline: '자료를 보면 답이 보인다', intro: '수치와 그림 속에 숨겨진 정답의 열쇠를 찾습니다.', features: ['도표 해석의 알고리즘화', '신경향 자료 완벽 대비', '시간 부족 현상 개선'] 
  },
  earth4: { 
    id: 'earth4', subject: 'earth', name: '성지아', gender: 'female', image: window.resolveAsset('/hteachers/earth/earth4.webp'), 
    schoolLevel: 'high', track: 'exam', targetGrades: ['고3', 'N수'], targetRanks: ['1등급'],
    mode: 'subject_specific',
    routeId: 'earth_top', routeTitle: '수능 천체 및 킬러 돌파 루트', routeDescription: '지구과학 만점으로 향하는 마지막 방해물, 초고난도 천체 좌표와 지질 킬러 타파.',
    tagline: '별과 지층을 지배하는 만점자', intro: '어떤 불수능의 지엽 변형도 이 코스 앞에서는 무의미합니다.', features: ['천체 좌표계 입체 시각화', '오답률 80% 문항 파훼', '극상위 모의 완성'] 
  }
};

// 모든 teacher 필수 숙제 속성 강제 부여 (SSOT 시스템 적용)
Object.values(TEACHER_PROFILES).forEach(teacher => {
  teacher.hasHomework = true;
  teacher.hasHomeworkCheck = true;
  teacher.homeworkEngine = "global";
  
  // Teacher 별 검사 기준 연결 (이름/스타일에 맞춰 분기)
  let strictness = '중간';
  let focusArea = '전반적 완성도';
  let correctionStyle = '표준 채점';
  let feedbackTone = '친절함';

  if (teacher.name === '백도진' || teacher.routeId?.includes('found')) {
    strictness = '낮음';
    focusArea = '이해 중심';
    feedbackTone = '격려와 칭찬';
  } else if (teacher.name === '설윤아' || teacher.name === '안세연' || teacher.routeId?.includes('gpa')) {
    strictness = '높음';
    focusArea = '정확도';
    correctionStyle = '감점 방어 모형';
    feedbackTone = '단호하고 예리함';
  } else if (teacher.name === '정유나' || teacher.name === '오지윤' || teacher.routeId?.includes('top')) {
    strictness = '매우 높음';
    focusArea = '논리/구조';
    correctionStyle = '킬러 분석 모형';
    feedbackTone = '직관적이고 단호함';
  }

  teacher.correctionParams = {
    strictness,
    focusArea,
    correctionStyle,
    feedbackTone
  };
});

/**
 * Look up a teacher profile by id. Returns null if not found.
 * @param {string} id
 * @returns {object|null}
 */

const ALL_TEACHERS = { ...TEACHER_PROFILES, ...MIDDLE_TEACHER_PROFILES, ...HIGH_TEACHER_PROFILES };

export function getTeacherById(id) {
  let t = ALL_TEACHERS[id];
  if (!t) {
    t = Object.values(ALL_TEACHERS).find(teacher => teacher.id === id) ?? null;
  }
  if (t && t.image && typeof t.image === 'string' && !t.image.startsWith('http')) {
    return { ...t, image: window.resolveAsset(t.image) };
  }
  return t;
}

/**
 * Strip non-serializable fields so the object
 * is safe to pass through React Router navigate() state.
 * @param {object} teacher
 * @returns {object}
 */
export function serializeTeacher(teacher) {
  if (!teacher) return null;
  return { ...teacher };
}
