import React, { createContext, useContext, useState } from 'react';
import { detectStudyMode } from '@/services/examModeEngine';
import { INITIAL_STUDENT_STATE, LEVEL_FROM_REPORT } from '@/engine/ssot';
import { updateStateOnAnswer, advancePhase } from '@/engine/studentState';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [subject, setSubject] = useState('수학');
  const [level, setLevel] = useState('3등급');
  const [teacher, setTeacher] = useState(null);
  const [messages, setMessagesState] = useState([]);
  const [diagnosisResult, setDiagnosisResultState] = useState(null);

  const [examInfo, setExamInfo] = useState(() => detectStudyMode());
  const [studyModeOverride, setStudyModeOverride] = useState(null);

  const [weakUnits, setWeakUnits] = useState([]);
  const [repeatMistakes, setRepeatMistakes] = useState([]);

  // SSOT: 학생 상태
  const [studentState, setStudentState] = useState(INITIAL_STUDENT_STATE);

  const setTeacherSelection = (t, s) => {
    setTeacher(t);
    setSubject(s);
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: `안녕! 난 ${s} 전담 ${t.name}이야. ${t.quote} 시작해볼까?`
    }]);
  };

  const setMessages = (msgsOrUpdater) => {
    setMessagesState(msgsOrUpdater);
  };

  const setDiagnosisResult = (result) => {
    setDiagnosisResultState(result);
    if (result?.subject) setSubject(result.subject);
    if (result?.level)   setLevel(result.level);

    // ── studyMode는 캘린더 날짜가 아니라 grade 기반으로 계산 ──────────────────────
    // 고3 수능 대비: 연간 항상 EXAM.
    // 고1/고2/중등: 날짜 기반 fallback 유지.
    const g = result?.grade;
    const isHigh3 = (g === '고3' || g === 'high3');
    const isHigh2 = (g === '고2' || g === 'high2');

    if (isHigh3) {
      setStudyModeOverride('EXAM');
      setExamInfo(prev => ({ ...prev, mode: 'EXAM', label: '수능 대비 모드', examType: 'csat' }));
    } else if (isHigh2) {
      // 고2는 날짜 기반 시험 모드 그대로 적용
      const fallback = detectStudyMode();
      setStudyModeOverride(fallback.mode);
      setExamInfo(fallback);
    } else {
      // 중1~고1: 날짜 기반 fallback
      const fallback = detectStudyMode();
      setStudyModeOverride(fallback.mode);
      setExamInfo(fallback);
    }

    // Init studentState from diagnosisResult
    const lvKey = LEVEL_FROM_REPORT[result?.level] || 'intermediate';
    setStudentState(prev => ({
      ...INITIAL_STUDENT_STATE,
      currentUnit: result?.unit || null,
      currentLevel: lvKey,
      studyMode: (teacher && teacher.mode) ? teacher.mode : (isHigh3 ? 'EXAM' : detectStudyMode().mode),
    }));
  };

  // SSOT: 학생 답변 처리 → 상태 전이
  const handleStudentAnswer = (answerText, tag = null) => {
    setStudentState(prev => updateStateOnAnswer(prev, { answerText, tag }));
  };

  // SSOT: 수업 단계 전환
  const advanceLessonPhase = (newPhase) => {
    setStudentState(prev => advancePhase(prev, newPhase));
  };

  const resetClassroomSession = () => {
    setMessagesState([]);
    setStudentState(prev => ({
      ...INITIAL_STUDENT_STATE,
      currentUnit: diagnosisResult?.unit || null,
      currentLevel: LEVEL_FROM_REPORT[diagnosisResult?.level] || 'intermediate',
      studyMode: (teacher && teacher.mode) ? teacher.mode : (studyModeOverride || (examInfo && examInfo.mode) || 'GROWTH'),
    }));
  };

  const addWeakUnit = (unit) => setWeakUnits(prev => [...new Set([...prev, unit])]);
  const addRepeatMistake = (tag) => {
    setRepeatMistakes(prev => [...new Set([...prev, tag])]);
    setStudentState(prev => ({ ...prev, recentMistakeTag: tag }));
  };

  // 1순위: teacher.mode (절대 우선)
  // 2순위: grade-based override
  // 3순위: date-based fallback (detectStudyMode)
  let finalMode = examInfo.mode;
  if (teacher && teacher.mode) {
    finalMode = teacher.mode;
  } else if (studyModeOverride) {
    finalMode = studyModeOverride;
  }
  
  const isEng = teacher && (teacher.subject === 'eng' || teacher.subject === 'english' || teacher.subject === '영어');
  const hasSSOT = teacher && (teacher.routeTitle || teacher.unitTitle || teacher.contentRules || teacher.listeningRules || teacher.features || teacher.sessionQueue);
  if (isEng && hasSSOT && (!finalMode || finalMode === 'BASE' || finalMode === 'GROWTH')) {
    finalMode = 'ENG_SSOT';
  }

  if (teacher) {
    console.log(`[MODE FIXED]
teacher=${teacher.name}
teacherMode=${teacher.mode || 'N/A'}
finalMode=${finalMode}`);
  }

  const effectiveStudyMode = finalMode;

  return (
    <AppContext.Provider value={{
      subject, level, teacher, messages, diagnosisResult,
      studyMode: effectiveStudyMode,   // teacher.mode가 절대 우선

      examInfo,
      weakUnits, repeatMistakes,
      studentState,
      setLevel, setTeacherSelection, setMessages, setDiagnosisResult,
      handleStudentAnswer, advanceLessonPhase, resetClassroomSession,
      addWeakUnit, addRepeatMistake
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
