// src/services/lessonResultStore.js
// 수업 결과 저장/조회/푸시 구조
// 현재는 localStorage 기반 MVP. 나중에 API 교체 시 saveResult() 내부만 바꾸면 됨.

const STORAGE_KEY = 'mentos_lesson_results';

// 수업 결과 저장
export const saveResult = (result) => {
  const entry = {
    id: `lesson_${Date.now()}`,
    date: new Date().toISOString(),
    grade: result.grade,
    subject: result.subject,
    unit: result.unit,
    teacher: result.teacher?.name || 'AI 선생님',
    inferredLevel: result.inferredLevel,
    totalQuestions: result.totalQuestions,
    correctCount: result.correctCount,
    accuracy: result.totalQuestions > 0
      ? Math.round((result.correctCount / result.totalQuestions) * 100)
      : 0,
    wrongQuestions: result.wrongQuestions || [],
    mistakeTags: result.mistakeTags || [],
    answerHistory: result.answerHistory || [],
    solveTime: result.solveTime || null,
    summary: result.summary || '',
    nextLessonFocus: result.nextLessonFocus || '',
  };

  const existing = getResults();
  existing.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  console.log('[LessonResult] Saved:', entry);

  // 푸시 트리거 (구조 준비)
  triggerPush(entry);

  return entry;
};

// 전체 결과 조회
export const getResults = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

// 최근 N개 조회
export const getRecentResults = (n = 5) => {
  return getResults().slice(-n).reverse();
};

// 결과 초기화 (개발용)
export const clearResults = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// 푸시 구조 (나중에 FCM/APNs 등으로 교체)
const triggerPush = (entry) => {
  const accuracy = entry.accuracy;
  const studentMsg = accuracy >= 80
    ? `🎉 오늘 ${entry.subject} 수업 완료! 정확도 ${accuracy}%. 잘 했어요!`
    : `📚 오늘 ${entry.subject} 수업 완료. 정확도 ${accuracy}%. ${entry.nextLessonFocus || '다음 수업 전 복습 추천'}`;

  const parentMsg = `[멘토스 학습 리포트] ${entry.grade} ${entry.subject} 수업 완료. 정확도: ${accuracy}%, 틀린 유형: ${entry.mistakeTags.join(', ') || '없음'}`;

  // 현재는 콘솔에 출력 (실제 서비스에서는 API 호출로 교체)
  console.log('[PUSH → 학생]', studentMsg);
  console.log('[PUSH → 학부모]', parentMsg);

  // 브라우저 Notification API (사용자가 권한 허용 시)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('[멘토스 OS]', { body: studentMsg, icon: '/favicon.ico' });
  }
};

// 반복 실수 유형 집계
export const getMistakePatterns = () => {
  const results = getResults();
  const tagMap = {};
  results.forEach(r => {
    r.mistakeTags.forEach(tag => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });
  return Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
};

// 브라우저 알림 권한 요청
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// 캘린더용 학습 기록 집계
export const getStudyLogs = () => {
  const results = getResults();
  const logMap = {};

  results.forEach(r => {
    const d = new Date(r.date);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    if (!logMap[dateKey]) {
      logMap[dateKey] = {
        date: dateKey,
        totalDuration: 0,
        subjects: [],
        timestamp: d.getTime()
      };
    }
    
    // Test solveTime is in seconds, but we want full class duration (mock ~ 120m if not specified)
    const classDuration = r.duration || 120; 
    
    logMap[dateKey].totalDuration += classDuration;
    logMap[dateKey].subjects.push({
      subject: r.subject,
      unit: r.unit,
      duration: classDuration,
      testResult: r.accuracy
    });
  });

  return Object.values(logMap).sort((a,b) => b.timestamp - a.timestamp);
};
