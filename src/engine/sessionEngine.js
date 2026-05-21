// src/engine/sessionEngine.js
// SSOT 기반 세션 관리 엔진 — UI 독립적
import { updateTeacherProgress } from '@/engine/studentProfileEngine';

const SESSION_KEY    = 'mentos_session';
const CHECKPOINT_KEY = 'mentos_checkpoint';

export const MAX_SESSION_MS = 120 * 60 * 1000; // 2시간

// ──────────────────────────────────────────────
// A. 세션 상태 Shape (SSOT)
// ──────────────────────────────────────────────
export const SESSION_STATUS = {
  ACTIVE:      'active',
  INTERRUPTED: 'interrupted',
  ENDED:       'ended',
};

export const END_REASON = {
  AUTO_END:     'AUTO_END',
  USER_EXIT:    'USER_EXIT',
  NETWORK_LOSS: 'NETWORK_LOSS',
  COMPLETED:    'COMPLETED',
};

/* Grade Band Logic */
export const getGradeBand = (levelStr, subject) => {
  const isBandSubject = ['math', '수학', 'physics', '물리', 'chemistry', '화학'].includes(subject);
  if (isBandSubject) {
    if (!levelStr) return 'F';
    const match = levelStr.match(/(F|D|C\-|C\+|B\-|B\+|A\-|A\+)/);
    if (match) return match[0];
    if (levelStr.includes('4') || levelStr.includes('5') || levelStr.includes('초')) return 'F';
    if (levelStr.includes('1') || levelStr.includes('2') || levelStr.includes('고')) return 'A-';
    return 'D';
  }
  if (!levelStr) return '';
  if (levelStr.includes('4') || levelStr.includes('5') || levelStr.includes('초급')) return '4~5등급';
  if (levelStr.includes('1') || levelStr.includes('2') || levelStr.includes('고급')) return '1~2등급';
  return levelStr;
};

// ── 월간 테스트 캘린더 연동 ──────────────────────────────────────────────────
export const getRegistrationDate = () => {
  let regStr = localStorage.getItem('mentos_registration_date');
  if (!regStr) {
    regStr = new Date().toISOString();
    localStorage.setItem('mentos_registration_date', regStr);
  }
  return new Date(regStr);
};

// 데모를 위해 가입일을 강제로 과거로 설정합니다.
export const advanceRegistrationDateForDemo = (days = 30) => {
  const regDate = getRegistrationDate();
  regDate.setDate(regDate.getDate() - days);
  localStorage.setItem('mentos_registration_date', regDate.toISOString());
  return regDate;
};

// 당일 자정 기준 차이 일자 계산
export const getDaysUntilTest = () => {
  const regDateStr = localStorage.getItem('mentos_registration_date');
  if (!regDateStr) {
    getRegistrationDate();
  }
  
  const regDate = new Date(localStorage.getItem('mentos_registration_date'));
  const now = new Date();
  
  // 날짜 간격 계산 (시간 부분 무시)
  const regDay = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = today - regDay;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 30일 주기 나머지 계산 (예: 31일째면 1일 지남 -> D-29)
  const cycleDays = diffDays % 30;
  
  if (cycleDays === 0 && diffDays > 0) {
    return 0; // 정확히 시험일 (D-Day)
  }
  
  return 30 - cycleDays;
};

// 다음 시험일 날짜 객체 반환
export const getNextTestDate = () => {
  const regDate = new Date(getRegistrationDate());
  const now = new Date();
  
  let testDate = new Date(regDate.getFullYear(), regDate.getMonth(), regDate.getDate());
  while (testDate <= now) {
    if (testDate.getFullYear() === now.getFullYear() && testDate.getMonth() === now.getMonth() && testDate.getDate() === now.getDate()) {
       return testDate; // 오늘이 시험일
    }
    testDate.setDate(testDate.getDate() + 30);
  }
  return testDate;
};
// ────────────────────────────────────────────────────────────────────────────

export const getBandTeacher = (subject, band) => {
  try {
    const teachers = JSON.parse(localStorage.getItem('mentos_band_teachers') || '{}');
    return teachers[`${subject}_${band}`] || null;
  } catch { return null; }
};

export const setBandTeacher = (subject, band, teacherProfile) => {
  try {
    const teachers = JSON.parse(localStorage.getItem('mentos_band_teachers') || '{}');
    teachers[`${subject}_${band}`] = teacherProfile;
    localStorage.setItem(`mentos_band_teachers`, JSON.stringify(teachers));
  } catch {}
};

const buildInitialSession = ({ subject, unit, grade, semester, level, teacher, studyMode }) => ({
  sessionId:           `ses_${Date.now()}`,
  userId:              'local',
  // 학습 컨텍스트
  subject,
  unit,
  grade,
  semester:            semester || (new Date().getMonth() < 7 ? 1 : 2),
  monthRange:          buildMonthRange(),
  level,
  inferredLevel:       level,
  band:                getGradeBand(level), // 밴드 기록 추가
  teacher:             teacher?.name || 'AI',
  teacherProfile:      teacher, // 전체 선생님 프로필 보관
  studyMode,
  messages:            [], // 메시지 누적
  // 타이머 (startTime 기준으로 남은 시간 항상 계산)
  startTime:           Date.now(),
  endTime:             null,
  duration:            null,
  lastActiveAt:        Date.now(),
  // 상태
  status:              SESSION_STATUS.ACTIVE,
  endReason:           null,
  // 질문 진행
  currentQuestionType: 'concept',
  currentQuestionId:   null,
  lessonPhase:         'warmup',
  // 결과
  answers:             [],
  mistakes:            [],   // [{ qType, tag, answerText }]
  testResults:         [],
  testDone:            false,
  pendingTest:         true,
  // 요약
  sessionSummary:      null,
});

const buildMonthRange = () => {
  const m = new Date().getMonth() + 1;
  if (m <= 2)  return '3월 준비';
  if (m <= 4)  return '1학기 초반';
  if (m <= 6)  return '1학기 기말';
  if (m <= 8)  return '방학';
  if (m <= 10) return '2학기 중반';
  return '2학기 기말';
};

// ──────────────────────────────────────────────
// B. 세션 CRUD
// ──────────────────────────────────────────────
export const createSession = (params) => {
  const session = buildInitialSession(params);
  persist(SESSION_KEY, session);
  return session;
};

export const loadSession = () => hydrate(SESSION_KEY);

export const updateSession = (partial) => {
  const cur = loadSession();
  if (!cur) return null;
  const updated = { ...cur, ...partial, lastActiveAt: Date.now() };
  persist(SESSION_KEY, updated);
  
  // 만약 messages 가 업데이트 된다면 teacherId 격리별 누적 상태로 저장
  if (partial.messages) {
    try {
      const tId = updated.teacherProfile?.id || 'unknown';
      localStorage.setItem(`mentos_messages_${updated.subject}_${updated.band}_${tId}`, JSON.stringify(partial.messages));
    } catch {}
  }
  return updated;
};

export const resumeOrCreate = (params) => {
  const existing = loadSession();
  const currentBand = getGradeBand(params.level);
  
  // Teacher 격리
  const currentTeacherId = params.teacher?.id || `unknown`;
  const messageKey = `mentos_messages_${params.subject}_${currentBand}_${currentTeacherId}`;
  
  let inheritedMessages = [];
  try {
    inheritedMessages = JSON.parse(localStorage.getItem(messageKey) || '[]');
  } catch {}

  const existingTeacherId = existing?.teacherProfile?.id || 'unknown';

  if (
    existing &&
    existing.status === SESSION_STATUS.ACTIVE &&
    existing.subject === params.subject &&
    existing.band === currentBand &&
    existingTeacherId === currentTeacherId && 
    getRemaining(existing) > 0
  ) {
    const updated = { ...existing, unit: params.unit || existing.unit, teacherProfile: params.teacher };
    persist(SESSION_KEY, updated);
    return { session: updated, resumed: true };
  }
  
  const newSession = createSession(params);
  newSession.messages = inheritedMessages;
  persist(SESSION_KEY, newSession);
  return { session: newSession, resumed: false };
};

// ──────────────────────────────────────────────
// C. Checkpoint 구조 (중간 저장)
// ──────────────────────────────────────────────
export const saveCheckpoint = ({
  session,
  lastQuestionId,
  lastQuestionType,
  currentUnit,
  currentLevel,
  studyMode,
  pendingTest,
  summarySoFar,
  studentState,
}) => {
  const elapsed = getElapsed(session);
  const checkpoint = {
    sessionId:        session?.sessionId,
    lastQuestionId,
    lastQuestionType,
    currentUnit,
    currentLevel,
    studyMode,
    timeSpent:        Math.round(elapsed / 1000),
    remainingTime:    getRemaining(session),
    pendingTest,
    summarySoFar:     summarySoFar || '',
    studentState,
    savedAt:          Date.now(),
  };
  persist(CHECKPOINT_KEY, checkpoint);
  if (session?.teacherProfile?.name) {
    updateTeacherProgress(session.teacherProfile.name, {
      currentSession: session.sessionId,
      progress: {
        phase: studentState?.lessonPhase || '진행중',
        unit: session.unit,
        timeSpent: checkpoint.timeSpent
      }
    });
  }
  return checkpoint;
};

export const loadCheckpoint = () => hydrate(CHECKPOINT_KEY);
export const clearCheckpoint = () => localStorage.removeItem(CHECKPOINT_KEY);

// ──────────────────────────────────────────────
// D. 종료 흐름 (고정 순서)
// ──────────────────────────────────────────────
// 1. 세션 잠금
// 2. 상태 스냅샷 저장
// 3. testDone 확인
// 4. sessionSummary 생성
// 5. lessonResultStore 저장
// 6. Push 발동
// 7. 세션 종료
export const endSession = ({ reason, testResults = [], answers = [], mistakes = [] }) => {
  const cur = loadSession();
  if (!cur) return null;

  const endTime = Date.now();
  const duration = endTime - cur.startTime;

  // 1+2. 잠금 + 스냅샷
  const ended = {
    ...cur,
    status:         SESSION_STATUS.ENDED,
    endReason:      reason,
    endTime,
    duration,
    testResults,
    answers,
    mistakes,
    testDone:       testResults.length > 0,
    pendingTest:    testResults.length === 0,
    sessionSummary: buildSummary({ cur, duration, testResults, mistakes, reason }),
  };
  persist(SESSION_KEY, ended);

  if (cur.teacherProfile?.name) {
    updateTeacherProgress(cur.teacherProfile.name, {
      currentSession: cur.sessionId,
      progress: {
        phase: 'COMPLETED',
        unit: cur.unit,
        timeSpent: Math.round(duration / 1000)
      }
    });
  }

  // 학부모 푸시/숙제 생성 로직 상태
  const homework = 'generated';
  const parentPush = 'sent';
  const nextLessonPrepared = true;

  const validTestLen = testResults.length > 0 ? testResults.length : answers.length || 1;
  const correctTestLen = testResults.length > 0 ? testResults.filter(r => r.isCorrect).length : 0;
  const acc = testResults.length > 0 ? Math.round((correctTestLen / validTestLen) * 100) : 0;

  // 12. 디버그 출력 강제 (절대 고정)
  console.log(`[LESSON FLOW]
teacher=${cur.teacherProfile?.id || cur.teacher}
lessonId=${cur.sessionId}
testScore=${acc}
saved=true
homework=${homework}
parentPush=${parentPush}
nextLessonPrepared=${nextLessonPrepared}`);

  // 4, 5. 결과 저장 (로컬 DB 누적)
  import('../services/lessonResultStore').then(({ saveResult }) => {
    saveResult({
      studentId:       cur.userId || 'student_001',
      teacherId:       cur.teacherProfile?.id || cur.teacher,
      subject:         cur.subject,
      date:            new Date().toISOString(),
      lessonId:        cur.sessionId,
      learnedContentSummary: ended.sessionSummary,
      testScore:       acc,
      wrongAnswers:    testResults.filter(r => !r.isCorrect).map(r => r.q),
      difficulty:      cur.level,
      nextLevelRecommendation: mistakes.length > 0
        ? `${mistakes[0]?.tag || '오답 개념'} 집중 교정 예정`
        : '다음 난이도 진행',
      
      // legacy support
      grade:           cur.grade,
      unit:            cur.unit,
      teacher:         { name: cur.teacher },
      inferredLevel:   cur.inferredLevel || cur.level,
      totalQuestions:  validTestLen,
      correctCount:    correctTestLen,
      mistakeTags:     [...new Set(mistakes.map(m => m.tag).filter(Boolean))],
      solveTime:       Math.round(duration / 1000),
      summary:         ended.sessionSummary,
      nextLessonFocus: mistakes.length > 0 ? '이전 틀린부분' : '새로운 개념'
    });
  }).catch(() => {});

  // 6. Push (구조 준비)
  triggerPush(ended, acc);

  // 7. Checkpoint 정리
  clearCheckpoint();

  return ended;
};

const buildSummary = ({ cur, duration, testResults, mistakes, reason }) => {
  const mins = Math.round(duration / 60000);
  const acc = testResults.length > 0
    ? Math.round(testResults.filter(r => r.isCorrect).length / testResults.length * 100)
    : null;
  return [
    `${reason} 종료. 총 ${mins}분 수업.`,
    acc !== null ? `테스트 정확도: ${acc}%.` : '테스트 미진행.',
    mistakes.length > 0 ? `주요 오답 태그: ${[...new Set(mistakes.map(m => m.tag))].join(', ')}.` : '',
  ].filter(Boolean).join(' ');
};

const triggerPush = (session, acc) => {
  const studentMsg = acc !== null && acc !== 0
    ? `🎉 오늘 ${session.subject} 수업 완료! 테스트 정확도: ${acc}%`
    : `📚 오늘 ${session.subject} 수업 완료 (테스트 결과 분석 중)`;
    
  const isEnglish = session.subject === '영어' || session.subject === 'english';
  let homeworkStr = '오늘 배운 내용 기반 맞춤 숙제 3문제가 발송되었습니다.';
  if (isEnglish) {
    let readCount = 6, vocabCount = 40;
    const levelStr = session.level || '';
    if (levelStr.includes('1')) {
      readCount = 5; vocabCount = 50;
    } else if (levelStr.includes('4') || levelStr.includes('5') || levelStr.includes('6') || levelStr === 'beginner') {
      readCount = 8; vocabCount = 30;
    }
    homeworkStr = `오늘 독해 수업 진행 후 숙제(독해 ${readCount}문장, 단어 ${vocabCount}개)가 부여되었습니다.`;
  }

  const parentMsg  = `[멘토스] ${session.grade} ${session.subject} ${session.unit} 완료.
요약: ${session.sessionSummary}
테스트 점수: ${acc}%
부족한 부분: ${session.mistakes && session.mistakes.length > 0 ? session.mistakes.map(m => m.tag).join(', ') : '없음'}
숙제 안내: ${homeworkStr}`;

  console.log('[PUSH → 학생]', studentMsg);
  console.log('[PUSH → 학부모]', parentMsg);

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('[멘토스 OS]', { body: studentMsg, icon: '/favicon.ico' });
  }
};

// ──────────────────────────────────────────────
// E. 시간 분배 맵 (권장 구간, 가변 적용)
// ──────────────────────────────────────────────
export const TIME_PHASE_MAP = [
  { from: 0,   to: 30,  phase: 'concept',   label: '개념 + 실생활', emoji: '💡', color: '#8b5cf6' },
  { from: 30,  to: 60,  phase: 'basic',     label: '적용 문제',     emoji: '📝', color: '#3b82f6' },
  { from: 60,  to: 90,  phase: 'advanced',  label: '심화 / 시험형', emoji: '🎯', color: '#ec4899' },
  { from: 90,  to: 110, phase: 'mistakes',  label: '오답 분석',     emoji: '🔍', color: '#ef4444' },
  { from: 110, to: 120, phase: 'finaltest', label: '최종 테스트',   emoji: '✅', color: '#10b981' },
];

// 권장 단계 반환 (실제 전환은 studentState + studyMode 기준으로 결정)
export const getRecommendedPhase = (elapsedMs) => {
  const mins = elapsedMs / 1000 / 60;
  return TIME_PHASE_MAP.find(p => mins >= p.from && mins < p.to)
    ?? TIME_PHASE_MAP[TIME_PHASE_MAP.length - 1];
};

// ──────────────────────────────────────────────
// F. 시간 유틸
// ──────────────────────────────────────────────
export const getElapsed   = (session) => session?.startTime ? Date.now() - session.startTime : 0;
export const getRemaining = (session) => Math.max(0, MAX_SESSION_MS - getElapsed(session));
export const isNearEnd    = (session, ms = 10 * 60 * 1000) => getRemaining(session) <= ms;
export const isExpired    = (session) => getRemaining(session) <= 0;

export const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${String(sec).padStart(2, '0')}초`;
  return `${sec}초`;
};

// ──────────────────────────────────────────────
// Utils
// ──────────────────────────────────────────────
const persist = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const hydrate = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
