import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HOMEWORK_UNITS, getHomeworkRange, getHomeworkProgress, STAGE_ACCESS, WRONG_REVIEW_ID } from '@/data/homeworkSSOT';
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Target, TrendingUp, AlertTriangle, Zap, ArrowLeft, BookOpen, CheckCircle, BookA, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRecentResults, getMistakePatterns, getStudyLogs } from '@/services/lessonResultStore';
import { getStudyMode } from '@/data/curriculumSSOT';
import { updateSession, loadSession, SESSION_STATUS, formatTime, getDaysUntilTest, getNextTestDate, advanceRegistrationDateForDemo } from '@/engine/sessionEngine';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import { processHomeworkSubmission } from '@/engine/homeworkEngine';
import { progressToNextUnit, initTrial, TEACHER_ASSIGNMENT } from '@/engine/gradeFlowSSOT';
import { analyzeMathWeakness, generateFortnightlyTestProblems, gradeFortnightlyTest, sendFortnightlyParentPush } from '@/engine/math/mathWeaknessReporter';
import { getCompletions } from '@/services/homeworkCompletion';
import '@/pages/Dashboard.css';

const parseSubject = (subj) => {
  const map = { 'physics': '물리', 'chemistry': '화학', 'biology': '생명과학', 'earth': '지구과학', 'math': '수학', 'english': '영어', 'eng': '영어' };
  return map[subj] || subj;
};

const GRADE_PROGRESS_MAP = {
  '고1': [
    '다항식의 연산',
    '항등식과 나머지정리',
    '인수분해',
    '복소수',
    '이차방정식',
    '이차방정식과 이차함수',
    '고차방정식',
    '일차부등식',
    '이차부등식',
    '경우의 수',
    '행렬',
    '점과좌표',
    '직선의방정식',
    '원의방정식',
    '도형의이동'
  ],
  '고2': [
    // 수학1
    '지수',
    '로그',
    '지수함수',
    '로그함수',
    '삼각함수성질',
    '삼각함수그래프',
    '삼각함수활용',
    '등차등비',
    '시그마용법',
    '귀납적정의',
    // 수학2
    '함수의 극한',
    '함수의 연속',
    '미분계수',
    '도함수의 활용',
    '부정적분과 정적분',
    '정적분의 활용'
  ],
  '고3': [
    // 미적분
    '[미적분] 수열의 극한',
    '[미적분] 급수',
    '[미적분] 지수로그함수의극한',
    '[미적분] 삼각함수합성과미분',
    '[미적분] 여러가지미분법',
    '[미적분] 도함수의활용',
    '[미적분] 여러가지적분',
    '[미적분] 정적분',
    // 확률과통계
    '[확통] 순열',
    '[확통] 중복조합',
    '[확통] 이항정리',
    '[확통] 확률의뜻',
    '[확통] 덧셈정리·조건부확률',
    '[확통] 확률변수와이항분포',
    '[확통] 연속확률분포와정규분포',
    '[확통] 표본평균과모평균'
  ]
};

export default function Dashboard() {
  console.log("DASHBOARD_RENDER");
  const navigate = useNavigate();
  
  // 퀵스타트 추천 진도 폼 상태
  const [selectedGrade, setSelectedGrade] = React.useState(() => {
    return localStorage.getItem('studentGrade') || '고1';
  });
  const [selectedProgress, setSelectedProgress] = React.useState(() => {
    return localStorage.getItem('studentProgress') || '이차방정식과 이차함수';
  });
  const [selectedRank, setSelectedRank] = React.useState(() => {
    return localStorage.getItem('studentLevel') || '4~5등급';
  });

  React.useEffect(() => {
    // 학년 변경 시 → localStorage에 저장된 진도가 해당 학년 것이면 유지, 아니면 기본값
    const savedGrade = localStorage.getItem('studentGrade');
    const savedProgress = localStorage.getItem('studentProgress');
    const options = GRADE_PROGRESS_MAP[selectedGrade] || [];

    if (savedGrade === selectedGrade && savedProgress && options.includes(savedProgress)) {
      setSelectedProgress(savedProgress);
    } else if (options.length > 0) {
      if (selectedGrade === '고1') {
        setSelectedProgress('이차방정식과 이차함수');
      } else if (selectedGrade === '고2') {
        setSelectedProgress('지수함수');
      } else {
        setSelectedProgress('[미적분] 삼각함수합성과미분');
      }
    }
  }, [selectedGrade]);

  const handleQuickStart = () => {
    const nextUnit = progressToNextUnit(selectedGrade, selectedProgress);
    
    let phaseIndexOverride = 2; // 4~5등급 -> 2단계
    if (selectedRank === '1~2등급') {
      phaseIndexOverride = 3; // 1~2등급 -> 3단계
    }
    
    const teacherAssignmentInfo = TEACHER_ASSIGNMENT[selectedRank];
    if (!teacherAssignmentInfo) return;
    const assignedTeacherId = teacherAssignmentInfo.defaultTeacherIds[selectedGrade];
    const teacherObj = Object.values(HIGH_TEACHER_PROFILES).find(t => t.id === assignedTeacherId);
    
    if (!teacherObj) {
      console.error('Teacher profile not found:', assignedTeacherId);
      return;
    }
    
    initTrial(selectedGrade, selectedRank);

    // 선택한 진도를 localStorage에 저장 (GradeSelect과 동기화)
    localStorage.setItem('studentGrade', selectedGrade);
    localStorage.setItem('studentProgress', selectedProgress);
    localStorage.setItem('studentLevel', selectedRank);
    
    navigate(`/class/math/${assignedTeacherId}`, {
      state: {
        subject: 'math',
        teacher: teacherObj,
        unitOverride: nextUnit,
        phaseIndexOverride: phaseIndexOverride,
        v2Mode: true
      }
    });
  };
  
  React.useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#ffffff';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    // mentos_manual_seen은 유지 — 매뉴얼은 최초 1회만 표시
    try {
      await signOut();
    } catch (e) {
      console.warn('Supabase signout failed, clearing local mock session anyway', e);
      localStorage.removeItem('mentos_mock_user');
      localStorage.removeItem('mentos_is_paid');
    }
    navigate('/login');
  };

  const recentResults = getRecentResults(5);
  const mistakePatterns = getMistakePatterns().slice(0, 4);
  const rawStudyLogs = getStudyLogs();
  
  // Inject Simulation into studyLogs for today's date
  const studyLogs = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasToday = rawStudyLogs.some(l => l.date === todayStr);
    if (!hasToday) {
      return [...rawStudyLogs, {
        date: todayStr,
        totalDuration: 45,
        subjects: [{
          subject: '수학',
          unit: '고차방정식 2단계 (1~20번)',
          duration: 45,
          testResult: 70
        }]
      }];
    }
    return rawStudyLogs;
  }, [rawStudyLogs]);
  
  const activeSessionV1 = loadSession();
  const hasActiveSessionV1 = activeSessionV1 && activeSessionV1.status === SESSION_STATUS.ACTIVE;

  // Load V2 Sessions
  const v2Sessions = React.useMemo(() => {
    const sessions = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('eng_progress_') || key.startsWith('sci_progress_') || key.startsWith('math_progress_'))) { 
        const parts = key.split('_');
        const teacherId = parts.slice(3).join('_');
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const teacherObj = Object.values(HIGH_TEACHER_PROFILES).find(t => t.id === teacherId);
          if (teacherObj) {
            sessions.push({ teacherId, teacherObj, ...data, key });
          }
        } catch (e) {}
      }
    }
    return sessions.sort((a,b) => (b.lastAccess || 0) - (a.lastAccess || 0));
  }, []);
  const [daysUntilTest, setDaysUntilTest] = React.useState(() => getDaysUntilTest());
  const [nextTestDate, setNextTestDate] = React.useState(() => getNextTestDate());

  const handleDemoAdvance = () => {
    advanceRegistrationDateForDemo(30);
    setDaysUntilTest(getDaysUntilTest());
    setNextTestDate(getNextTestDate());
  };

  const [selectedDateKey, setSelectedDateKey] = React.useState(null);

  // Homework State
  const [hwFile, setHwFile] = React.useState(null);
  const [hwUploading, setHwUploading] = React.useState(false);
  const [hwResult, setHwResult] = React.useState(null);

  const handleHomeworkChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setHwFile(e.target.files[0]);
      setHwResult(null);
    }
  };

  const handleHomeworkSubmit = async () => {
    if (!hwFile) return;
    setHwUploading(true);
    try {
      const result = await processHomeworkSubmission({
        studentId: 'student_001',
        teacherId: activeSession?.teacherProfile?.id || 'unknown',
        subject: activeSession?.subject || '영어',
        homeworkId: 'hw_' + Date.now(),
        imageFile: hwFile
      });
      setHwResult(result.grading);
    } catch(e) {
      console.error(e);
    } finally {
      setHwUploading(false);
    }
  };

  // ── [Real Data Integration with Simulation Fallback] ──
  const wrongReviewCount = React.useMemo(
    () => getActiveWrongAnswers().filter(e => !e.resolved).length,
    []
  );
  const completionEvents = React.useMemo(() => getCompletions(), []);
  const trialState = React.useMemo(() => JSON.parse(localStorage.getItem('mentos_free_trial') || '{}'), []);
  const weaknessHistory = React.useMemo(() => JSON.parse(localStorage.getItem('mentos_weakness_history') || '[]'), []);
  
  // Dynamic Data Integration
  const lessonHistory = React.useMemo(() => {
    const realHistory = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
    if (realHistory.length > 0) {
      // Map properties to match what Dashboard views expect
      return realHistory.map(lh => ({
        id: lh.id,
        date: lh.date,
        subject: lh.subject,
        grade: lh.grade,
        unit: lh.unit,
        accuracy: lh.accuracy,
        correctCount: lh.correctCount,
        totalQuestions: lh.totalQuestions,
        wrongIndices: lh.wrongQuestions?.map(q => q.problemId || q.id) || [],
        nextLessonFocus: lh.nextLessonFocus || '복습 및 개념 강화',
        core: { correctCount: lh.correctCount, totalQuestions: lh.totalQuestions }
      })).reverse(); // Show newest first
    }

    // 1일차 수업현황 시뮬레이션 데이터 주입 (고차방정식 2단계) - 학습 이력이 없을 경우의 데모용
    return [{
      id: 'sim_001',
      date: new Date().toISOString(),
      subject: '수학',
      grade: '고1',
      unit: '고차방정식 2단계',
      accuracy: 70, // 14/20 = 70%
      correctCount: 14,
      totalQuestions: 20,
      wrongIndices: [1, 5, 8, 12, 15, 17],
      nextLessonFocus: '복이차방정식 및 상반방정식 심화 보강',
      core: { correctCount: 14, totalQuestions: 20 }
    }];
  }, []);
  
  // SSOT 기반 숙제 목록 (학생 등급별 필터)
  const studentLevel = localStorage.getItem('studentLevel') || '4~5등급';
  const homeworkList = React.useMemo(() => {
    const progressList = GRADE_PROGRESS_MAP[selectedGrade] || [];
    const currentIdx = progressList.indexOf(selectedProgress);

    return HOMEWORK_UNITS.filter(hw => {
      const subject = hw.subject || '수학상';
      if (selectedGrade === '고1') {
        return subject === '수학상';
      } else if (selectedGrade === '고2') {
        return subject === '수학1' || subject === '수학2';
      } else if (selectedGrade === '고3') {
        return subject === '미적분' || subject === '확률과통계';
      }
      return true;
    }).map(hw => {
      const range = getHomeworkRange(hw, studentLevel);
      const totalProblems = range.end - range.start + 1;
      const progress = getHomeworkProgress(hw.id);
      const answeredCount = Object.keys(progress).length;
      const isComplete = answeredCount >= totalProblems;
      const progressPercent = totalProblems > 0 ? Math.round((answeredCount / totalProblems) * 100) : 0;
      
      // Calculate closeness index to current progress
      let hwIdx = -1;
      const candidates = [hw.relatedUnit, hw.parentUnit, hw.title];
      for (const cand of candidates) {
        if (!cand) continue;
        const idx = progressList.indexOf(cand);
        if (idx !== -1) {
          hwIdx = idx;
          break;
        }
      }
      
      // Perform partial matching if direct match fails
      if (hwIdx === -1) {
        candidates.forEach(cand => {
          if (!cand || hwIdx !== -1) return;
          const matchedIdx = progressList.findIndex(p => cand.includes(p) || p.includes(cand));
          if (matchedIdx !== -1) {
            hwIdx = matchedIdx;
          }
        });
      }

      // Calculate distance weight
      let distance = 999;
      if (currentIdx !== -1 && hwIdx !== -1) {
        if (hwIdx === currentIdx) {
          distance = 0; // Current unit has priority
        } else if (hwIdx > currentIdx) {
          distance = hwIdx - currentIdx; // Future units are prioritized in chronological order
        } else {
          distance = 100 + (currentIdx - hwIdx); // Past units are pushed to the back
        }
      } else if (hwIdx !== -1) {
        distance = hwIdx;
      }

      return {
        id: hw.id,
        title: hw.title,
        problemCount: totalProblems,
        isComplete,
        progressPercent,
        answeredCount,
        sequence: hw.sequence,
        distance,
      };
    })
    .filter(hw => !hw.isComplete)
    .sort((a, b) => a.distance - b.distance) // Sort by proximity (current/future progress first)
    .slice(0, 5); // Show top 5 incomplete homeworks
  }, [studentLevel, selectedGrade, selectedProgress]);

  // 완료된 숙제 목록 (정답률 및 오답 번호 집계)
  const completedHomeworkList = React.useMemo(() => {
    return HOMEWORK_UNITS.filter(hw => {
      const subject = hw.subject || '수학상';
      if (selectedGrade === '고1') {
        return subject === '수학상';
      } else if (selectedGrade === '고2') {
        return subject === '수학1' || subject === '수학2';
      } else if (selectedGrade === '고3') {
        return subject === '미적분' || subject === '확률과통계';
      }
      return true;
    }).map(hw => {
      const range = getHomeworkRange(hw, studentLevel);
      const totalProblems = range.end - range.start + 1;
      const progress = getHomeworkProgress(hw.id);
      const answeredCount = Object.keys(progress).length;
      const isComplete = answeredCount >= totalProblems && totalProblems > 0;
      
      const correctCount = Object.values(progress).filter(p => p.isCorrect).length;
      const accuracy = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0;
      
      // 오답 문항 번호 추출 ("001" -> 1)
      const wrongIndices = Object.entries(progress)
        .filter(([pid, data]) => !data.isCorrect)
        .map(([pid]) => parseInt(pid, 10))
        .sort((a, b) => a - b);

      return {
        id: hw.id,
        title: hw.title,
        problemCount: totalProblems,
        isComplete,
        accuracy,
        correctCount,
        wrongIndices,
        sequence: hw.sequence,
      };
    }).filter(hw => hw.isComplete);
  }, [studentLevel]);

  const mathWeakness = React.useMemo(() => analyzeMathWeakness(), [lessonHistory, completedHomeworkList]);
  const topWeakUnits = mathWeakness.top3.length > 0 
    ? mathWeakness.top3.map(w => `${w.unit} (${w.tag})`)
    : ["이차함수와 이차방정식 (개념 결손)", "다항식의 연산 (연산 실수)", "항등식과 나머지정리 (응용 부족)"];

  // 격주 테스트 시간 제어 상태 변수 정의
  const [fortnightlyDays, setFortnightlyDays] = React.useState(() => {
    return parseInt(localStorage.getItem('fortnightly_days_elapsed') || '0', 10);
  });

  const [fortnightlyTestStatus, setFortnightlyTestStatus] = React.useState(() => {
    return localStorage.getItem('fortnightly_test_status') || 'pending'; // 'pending' | 'pre_assigned' | 'active' | 'completed'
  });

  const [assignedFortProblems, setAssignedFortProblems] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fortnightly_assigned_problems') || '[]');
    } catch { return []; }
  });

  const [fortTestResults, setFortTestResults] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fortnightly_test_results') || '[]');
    } catch { return []; }
  });

  const [activeReportTab, setActiveReportTab] = React.useState('weekly');
  const [showFortTestModal, setShowFortTestModal] = React.useState(false);
  const [fortAnswers, setFortAnswers] = React.useState({});
  const [fortGradingResult, setFortGradingResult] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('fortnightly_days_elapsed', String(fortnightlyDays));
  }, [fortnightlyDays]);

  React.useEffect(() => {
    localStorage.setItem('fortnightly_test_status', fortnightlyTestStatus);
  }, [fortnightlyTestStatus]);

  React.useEffect(() => {
    // 13일째 예약 시점: 자동으로 문제 5개 선정하여 로컬 저장
    if (fortnightlyDays === 13 && fortnightlyTestStatus === 'pending') {
      const problems = generateFortnightlyTestProblems(studentLevel);
      setAssignedFortProblems(problems);
      localStorage.setItem('fortnightly_assigned_problems', JSON.stringify(problems));
      setFortnightlyTestStatus('pre_assigned');
      console.log('[Fortnightly Test] Problems pre-assigned for Day 13:', problems);
    }
    // 14일째 활성화 시점
    if (fortnightlyDays >= 14 && (fortnightlyTestStatus === 'pending' || fortnightlyTestStatus === 'pre_assigned')) {
      let problems = assignedFortProblems;
      if (problems.length === 0) {
        problems = generateFortnightlyTestProblems(studentLevel);
        setAssignedFortProblems(problems);
        localStorage.setItem('fortnightly_assigned_problems', JSON.stringify(problems));
      }
      setFortnightlyTestStatus('active');
    }
  }, [fortnightlyDays, fortnightlyTestStatus, studentLevel]);

  const handleFortDayJump = (days) => {
    setFortnightlyDays(days);
    if (days === 13) {
      setFortnightlyTestStatus('pending'); // 리셋하여 13일차 예약 가동 유도
      setAssignedFortProblems([]);
      localStorage.removeItem('fortnightly_assigned_problems');
    } else if (days === 14) {
      setFortnightlyTestStatus('pending');
      setAssignedFortProblems([]);
      localStorage.removeItem('fortnightly_assigned_problems');
    } else {
      setFortnightlyTestStatus('pending');
      setAssignedFortProblems([]);
      localStorage.removeItem('fortnightly_assigned_problems');
    }
  };
  
  const todayProblems = trialState.problemsSolvedToday || 20; // 시뮬레이션용 20개
  const accuracy = React.useMemo(() => {
    if (lessonHistory.length === 0) return 0;
    const totalCorrect = lessonHistory.reduce((acc, l) => acc + (l.core?.correctCount || 0) + (l.step?.correctCount || 0), 0);
    const totalQuestions = lessonHistory.reduce((acc, l) => acc + (l.core?.totalQuestions || 0) + (l.step?.totalQuestions || 0), 0);
    return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  }, [lessonHistory]);

  // Calendar Helpers
  const today = new Date();
  const getDaysInMonth = () => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for(let i=0; i<firstDay.getDay(); i++) days.push(null);
    for(let d=1; d<=lastDay.getDate(); d++) {
        const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        days.push({ day: d, dateKey });
    }
    return days;
  };
  const calendarDays = getDaysInMonth();
  
  const SUBJECT_COLORS = { 
    '물리': '#3b82f6', '화학': '#a855f7', '생명과학': '#10b981', 
    '지구과학': '#f59e0b', '영어': '#ec4899', '수학': '#6366f1', '과학': '#10b981',
    'physics': '#3b82f6', 'chemistry': '#a855f7', 'biology': '#10b981', 'earth_science': '#f59e0b', 'earth': '#f59e0b', 'eng': '#ec4899'
  };

  const streakCount = studyLogs.length; // Simplified streak
  const examModeActive = getStudyMode(today).startsWith("EXAM");

  // Dynamic Recharts Graph Aggregations
  const weeklyData = React.useMemo(() => {
    const defaultData = [
      { day: '월', 개념이해도: 65, 오답률: 35, 푼문제수: 20 },
      { day: '화', 개념이해도: 70, 오답률: 30, 푼문제수: 25 },
      { day: '수', 개념이해도: 68, 오답률: 32, 푼문제수: 15 },
      { day: '목', 개념이해도: 75, 오답률: 25, 푼문제수: 30 },
      { day: '금', 개념이해도: 82, 오답률: 18, 푼문제수: 40 },
      { day: '토', 개념이해도: 88, 오답률: 12, 푼문제수: 50 },
      { day: '오늘', 개념이해도: 70, 오답률: 30, 푼문제수: 20 }
    ];

    const realHistory = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
    if (realHistory.length === 0) return defaultData;

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dataByDay = {};

    // Initialize last 7 days of the calendar leading up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayName = i === 0 ? '오늘' : days[d.getDay()];
      dataByDay[dateStr] = {
        day: dayName,
        totalCorrect: 0,
        totalQuestions: 0,
        count: 0
      };
    }

    // Populate with real history
    realHistory.forEach(lh => {
      const d = new Date(lh.date);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      if (dataByDay[dateStr]) {
        dataByDay[dateStr].totalQuestions += lh.totalQuestions || 0;
        dataByDay[dateStr].totalCorrect += lh.correctCount || 0;
        dataByDay[dateStr].count += 1;
      }
    });

    return Object.keys(dataByDay).map((dateStr, index) => {
      const dayData = dataByDay[dateStr];
      if (dayData.count === 0) {
        // Fallback to a realistic baseline if there's no learning recorded for this day
        // This keeps the chart beautiful but allows "오늘" to update dynamically when solved!
        const dayIndex = (new Date().getDay() - 6 + index + 7) % 7;
        const baseAccuracy = 60 + (dayIndex * 4) % 20;
        return {
          day: dayData.day,
          개념이해도: baseAccuracy,
          오답률: 100 - baseAccuracy,
          푼문제수: 10 + (dayIndex * 5) % 25
        };
      }

      const accuracy = dayData.totalQuestions > 0 
        ? Math.round((dayData.totalCorrect / dayData.totalQuestions) * 100)
        : 70;

      return {
        day: dayData.day,
        개념이해도: accuracy,
        오답률: Math.max(0, 100 - accuracy),
        푼문제수: dayData.totalQuestions
      };
    });
  }, [lessonHistory]);

  const monthlyData = React.useMemo(() => {
    const defaultData = [
      { week: '1주차', 개념: 60, 적용: 45, 속도: 50, 등급: 4.5 },
      { week: '2주차', 개념: 75, 적용: 55, 속도: 55, 등급: 4.0 },
      { week: '3주차', 개념: 85, 적용: 70, 속도: 65, 등급: 3.5 },
      { week: '4주차', 개념: 95, 적용: 85, 속도: 80, 등급: 2.8 }
    ];

    const realHistory = JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]');
    if (realHistory.length === 0) return defaultData;

    // Dynamically calculate cumulative stats for the current learning session
    const totalCorrect = realHistory.reduce((acc, l) => acc + (l.correctCount || 0), 0);
    const totalQs = realHistory.reduce((acc, l) => acc + (l.totalQuestions || 0), 0);
    const avgAccuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 70;

    // Predict dynamic grade based on accuracy (e.g. 90%+ is ~1.5 grade, 50% is ~5.0 grade)
    const predictedGrade = Math.max(1.0, parseFloat((5.5 - (avgAccuracy / 25)).toFixed(1)));

    return [
      { week: '1주차', 개념: 60, 적용: 45, 속도: 50, 등급: 4.5 },
      { week: '2주차', 개념: 72, 적용: 55, 속도: 58, 등급: 4.0 },
      { week: '3주차', 개념: 80, 적용: 68, 속도: 66, 등급: 3.4 },
      { week: '현재', 개념: avgAccuracy, 적용: Math.round(avgAccuracy * 0.88), 속도: Math.round(avgAccuracy * 0.82), 등급: predictedGrade }
    ];
  }, [lessonHistory]);

  const mockExamReport = {
    examName: "2025학년도 6월 모의평가 (1회)",
    score: 84,
    weakUnits: ["삼각함수의 활용", "합성함수의 미분", "등비급수"],
    analysisAndAction: "공통과목 15번(수열)과 미적분 28번(합성함수 미분), 30번(극값 추론)에서 오답이 발생했습니다. 수식 전개 과정에서 부등식 조건을 놓치거나 합성함수 연쇄법칙 적용에서 실수가 발견되었습니다. 오답이 발생한 각 취약 단원에 대해 1:1 매칭되는 5문제 집중 하드 트레이닝 드릴(Drill)을 즉시 자동 배정했습니다.",
    aiCommentary: "최근 배정된 '합성함수 미분' 5문제 드릴에서 정답률 100%를 기록하며 완벽하게 약점을 극복해냈습니다! 반면 '등비급수' 단원은 계산 실수가 1건 남아있어, 다음 주차에 2차 보강 훈련이 진행될 예정입니다. 이 페이스대로 드릴을 소화한다면 다음 모의고사 1등급(92점 이상) 진입이 확실시됩니다."
  };

  return (
    <div className="dashboard-page-wrapper">
      <div className="dashboard-container">
        {/* ── Header ── */}
        <div className="dash-header">
          <button className="back-btn" onClick={handleLogout}><LogOut size={16}/> 로그아웃</button>
          <h1 className="dash-title">Mentos AI Learning OS</h1>
          <p className="dash-subtitle">AI가 분석한 나만의 학습 대시보드</p>
        </div>

      {/* ═══ 1. Hero — 오늘의 학습 ═══ */}
      <div className="hero-card animate-fade-in">
        <div className="hero-content">
          <span className="hero-badge">🧠 AI 추천</span>
          <h2 className="hero-title">오늘의 학습</h2>
          <p className="hero-subtitle">
            오늘은 <strong>{topWeakUnits[0]}</strong> 집중 학습입니다.
          </p>
          <div className="hero-stats">
            <div className="hero-stat-chip">
              <span className="chip-icon">📝</span>
              <span>추천 5문제</span>
            </div>
            <div className="hero-stat-chip">
              <span className="chip-icon">🔄</span>
              <span>오답 복습 {lessonHistory[0]?.wrongIndices?.length || 0}개</span>
            </div>
            <div className="hero-stat-chip">
              <span className="chip-icon">👁️</span>
              <span>AVS 추천 1개</span>
            </div>
          </div>
          <button className="hero-cta" onClick={() => navigate('/grade-select')}>
            학습 시작 →
          </button>
        </div>
      </div>

      {/* ═══ [신규] 오늘의 단원 퀵스타트 AI 매칭 폼 ═══ */}
      <div className="quick-start-card glass-panel animate-fade-in" style={{ animationDelay: '0.02s' }}>
        <div className="quick-start-header">
          <BookOpen size={20} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3>오늘의 단원을 어디까지 배우셨나요? 🎯</h3>
            <p>최근 배운 진도를 입력하면 AI 선생님이 다음 단원의 최적 맞춤 단계 문제를 즉시 출제합니다!</p>
          </div>
        </div>
        <div className="quick-start-form">
          <div className="form-group">
            <label>학년 선택</label>
            <div className="segmented-control">
              {['고1', '고2', '고3'].map(g => (
                <button
                  key={g}
                  type="button"
                  className={`segment-btn ${selectedGrade === g ? 'active' : ''}`}
                  onClick={() => setSelectedGrade(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>최근 배운 단원</label>
            <select 
              value={selectedProgress} 
              onChange={e => setSelectedProgress(e.target.value)}
              className="quick-select"
            >
              {(GRADE_PROGRESS_MAP[selectedGrade] || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>목표/현재 등급</label>
            <div className="segmented-control">
              {['1~2등급', '3등급', '4~5등급'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`segment-btn ${selectedRank === r ? 'active' : ''}`}
                  onClick={() => setSelectedRank(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="quick-start-footer">
          <div className="matching-preview-badge">
            ⚡ AI 추천 단계: {selectedRank === '1~2등급' ? '3단계 (심화)' : '2단계 (실전)'} 시작
          </div>
          <button className="quick-start-cta" onClick={handleQuickStart}>
            맞춤 학습 즉시 시작 🚀
          </button>
        </div>
      </div>

      {/* ═══ 2. 수학 클래스 선택 그리드 ═══ */}
      <div className="course-section animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="course-section-header">
          <BookOpen size={20} color="#3b82f6" />
          <div>
            <h3>수학 클래스 선택</h3>
            <p>AI 튜터와 함께 학습할 과목을 선택하세요</p>
          </div>
        </div>
        <div className="course-grid">
          {[
            { name: '수학(상)', desc: '고1 수학(상/하)', icon: '📐', color: '#3b82f6' },
            { name: '수학1', desc: '수학1 (대수)', icon: '📊', color: '#8b5cf6' },
            { name: '수학2', desc: '미적분 기초', icon: '📈', color: '#06b6d4' },
            { name: '미적분', desc: '미적분 (심화)', icon: '🔥', color: '#ef4444' },
            { name: '확률과통계', desc: '확률과 통계', icon: '🎲', color: '#f59e0b' },
            { name: '모의고사', desc: '멘토스 실전 모의고사', icon: '📝', color: '#10b981' },
          ].map(course => (
            <button
              key={course.name}
              className="course-card"
              onClick={() => {
                if (course.name === '모의고사') {
                  navigate('/grade-select', { state: { subjectOverride: '모의고사' } });
                } else {
                  navigate('/grade-select', { state: { subjectOverride: course.name } });
                }
              }}
              style={{
                background: `linear-gradient(135deg, ${course.color}12, ${course.color}06)`,
                borderColor: `${course.color}30`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${course.color}25`; e.currentTarget.style.borderColor = `${course.color}60`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${course.color}30`; }}
            >
              <span className="course-icon">{course.icon}</span>
              <span className="course-name">{course.name}</span>
              <span className="course-desc">{course.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 3. AI 성장 리포트 ═══ */}
      <div className="ai-report-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="ai-report-header">
          <TrendingUp size={20} color="#818cf8" />
          <h3>AI 성장 리포트</h3>
          <span className="ai-badge">AI</span>
        </div>
        <div className="ai-report-grid">
          <div className="ai-metric">
            <div className="ai-metric-label">최근 성장률</div>
            <div className="ai-metric-value growth">+15%</div>
          </div>
          <div className="ai-metric">
            <div className="ai-metric-label">종합 정답률</div>
            <div className="ai-metric-value accuracy-val">{accuracy}%</div>
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
          <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#fca5a5' }} />
          취약 단원 TOP 3
        </div>
        <div className="ai-weak-units">
          {topWeakUnits.map(unit => (
            <span key={unit} className="ai-weak-tag">{unit}</span>
          ))}
        </div>
        <div className="ai-comment">
          <strong>AI 분석: </strong>
          함수 단원 이해도가 빠르게 상승 중입니다. 복이차방정식 심화 보강을 추천합니다.
        </div>
      </div>

      {/* ═══ 4. AVS 추천 카드 ═══ */}
      <div className="avs-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <div className="avs-header">
          <Zap size={20} color="#34d399" />
          <h3>AI Vision Solution 추천</h3>
        </div>
        <p className="avs-desc">오늘 가장 많이 막힌 문제 유형을 AI가 분석했습니다</p>
        <div className="avs-types">
          {topWeakUnits.slice(0, 2).map(unit => (
            <span key={unit} className="avs-type-tag">{unit}</span>
          ))}
        </div>
        <button className="avs-cta" onClick={() => navigate('/grade-select')}>
          AVS 풀이 보기 →
        </button>
      </div>

      {/* ═══ 5. 오답 복습 ═══ */}
      {mistakePatterns.length > 0 && (
        <div className="mistake-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mistake-header">
            <AlertTriangle size={18} color="#ef4444" />
            <h3>반복 실수 유형</h3>
          </div>
          <div className="mistake-tags">
            {mistakePatterns.map(([tag, count]) => (
              <div key={tag} className="mistake-tag">
                {tag} ({count}회)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 6. 퀘스트 / 출석 / 게임화 ═══ */}
      <div className="quest-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <div className="quest-header">
          <Target size={20} color="#f59e0b" />
          <h3>퀘스트 & 성장</h3>
        </div>
        <div className="quest-stats-row">
          <div className="quest-stat">
            <div className="quest-stat-icon">🔥</div>
            <div className="quest-stat-value">{streakCount}일</div>
            <div className="quest-stat-label">연속 출석</div>
          </div>
          <div className="quest-stat">
            <div className="quest-stat-icon">⭐</div>
            <div className="quest-stat-value" style={{ color: '#fbbf24' }}>2,450</div>
            <div className="quest-stat-label">XP 포인트</div>
          </div>
          <div className="quest-stat">
            <div className="quest-stat-icon">📈</div>
            <div className="quest-stat-value" style={{ color: '#10b981' }}>+15%</div>
            <div className="quest-stat-label">성장률</div>
          </div>
          <div className="quest-stat">
            <div className="quest-stat-icon">🏆</div>
            <div className="quest-stat-value" style={{ color: '#60a5fa' }}>12%</div>
            <div className="quest-stat-label">상위</div>
          </div>
        </div>
        <div className="quest-item">
          <div className="quest-item-check">
            <CheckCircle size={16} color="#64748b" />
          </div>
          <span className="quest-item-text">오답 3문제 복습하기</span>
          <span className="quest-xp-badge">+50 XP</span>
        </div>
        <div className="quest-item">
          <div className="quest-item-check">
            <CheckCircle size={16} color="#64748b" />
            <CheckCircle size={16} color="var(--text-muted)" />
          </div>
          <span className="quest-item-text">AI 추천 문제 5개 풀기</span>
          <span className="quest-xp-badge">+100 XP</span>
        </div>
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            <span>오늘의 진행률</span>
            <span>33%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: '33%' }}></div>
          </div>
        </div>
      </div>

      {/* ═══ Summary Stats ═══ */}
      <div className="stats-cards animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="glass-panel stat-card">
          <Target className="stat-icon purple" />
          <div className="stat-info">
            <h4>오늘 푼 문제</h4>
            <div className="stat-value">{todayProblems} <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>/ 60</span></div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <TrendingUp className="stat-icon blue" />
          <div className="stat-info">
            <h4>종합 정답률</h4>
            <div className="stat-value">{accuracy}% <span className="trend up">+5%</span></div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <Zap className="stat-icon teal" />
          <div className="stat-info">
            <h4>풀이 속도</h4>
            <div className="stat-value">상위 15% <span className="trend up">빨라짐</span></div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <AlertTriangle className="stat-icon red" />
          <div className="stat-info">
            <h4>오답 패턴</h4>
            <div className="stat-value">감소 <span className="trend up">-30%</span></div>
          </div>
        </div>
      </div>

      {/* ═══ 7. V2/V1 세션 이어하기 (기존 보존) ═══ */}
      <div className="session-section">
        {v2Sessions.map((v2s, idx) => (
          <div key={`v2-${v2s.teacherId}`} className="glass-panel session-card animate-fade-in" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)', border: '1px solid rgba(16, 185, 129, 0.15)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)', animationDelay: `${0.35 + 0.05 * idx}s` }}>
            <div>
              <h3>
                <Zap size={18} color="#10b981" /> 이어하기 — [V2] 수업
              </h3>
              <div className="session-meta">
                <span><strong style={{color: 'var(--text-main)'}}>{parseSubject(v2s.teacherObj.subject)}</strong></span>
                <span>•</span>
                <span>{v2s.teacherObj.name} 선생님</span>
                <span>•</span>
                <span>{v2s.teacherObj.targetGrades.join(', ')} {v2s.teacherObj.targetRanks.join(', ')}</span>
                <span>•</span>
                <span style={{color: '#10b981'}}>{v2s.round}주차 ({v2s.currentPhaseIndex}/5 단계)</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              onClick={() => {
                const isScience = ['physics', 'chemistry', 'biology', 'earth_science', 'earth'].includes(v2s.teacherObj.subject);
                const isMath = v2s.teacherObj.subject === 'math';
                const targetPath = isScience ? '/class/science' : (isMath ? '/class/math' : '/class/english');
                navigate(targetPath, { 
                  state: { 
                    subject: v2s.teacherObj.subject,
                    teacher: v2s.teacherObj,
                    isResume: true,
                    v2Mode: true
                  } 
                });
              }}
            >
              이어서 하기 →
            </button>
          </div>
        ))}

        {hasActiveSessionV1 && (
          <div className="glass-panel session-card animate-fade-in" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #e0f2fe 100%)', border: '1px solid rgba(139, 92, 246, 0.15)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)', animationDelay: '0.4s' }}>
            <div>
              <h3>
                <Zap size={18} color="#a855f7" /> 이어하기 — [V1] 수업
              </h3>
              <div className="session-meta">
                <span><strong style={{color: 'var(--text-main)'}}>{parseSubject(activeSessionV1.subject)}</strong> ({activeSessionV1.unit})</span>
                <span>•</span>
                <span>{activeSessionV1.teacher} 선생님</span>
                <span>•</span>
                <span>등급: {activeSessionV1.band || activeSessionV1.level || ''}</span>
                <span>•</span>
                <span style={{color: '#a855f7'}}>{activeSessionV1.lessonPhase} 단계</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
              onClick={() => {
                navigate('/teacher', { 
                  state: { 
                    subject: activeSessionV1.subject,
                    unit: activeSessionV1.unit,
                    grade: activeSessionV1.grade,
                    level: activeSessionV1.level,
                    studyMode: activeSessionV1.studyMode,
                    teacher: activeSessionV1.teacherProfile,
                    isResume: true 
                  } 
                });
              }}
            >
              이어서 하기 →
            </button>
          </div>
        )}
      </div>

      {/* ═══ 8. 월간 테스트 (기존 보존) ═══ */}
      <div className="glass-panel monthly-test-card animate-fade-in" style={{ background: daysUntilTest === 0 ? 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: daysUntilTest === 0 ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)', animationDelay: '0.45s' }}>
        <h3 style={{ color: daysUntilTest === 0 ? '#ef4444' : 'var(--text-main)' }}>
          <BookA size={20} color={daysUntilTest === 0 ? "#ef4444" : "#94a3b8"} /> 
          {daysUntilTest === 0 ? '오늘은 월간 등급 테스트 날입니다!' : '다음 월간 테스트 일정'}
        </h3>
        <div className="monthly-test-meta">
          <span>예정일: <strong>{nextTestDate.toLocaleDateString('ko-KR')}</strong></span>
          <span>•</span>
          {daysUntilTest === 0 ? (
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>등급 유지/승급 결정</span>
          ) : (
            <span>D-{daysUntilTest}일 남음</span>
          )}
        </div>
        <div className="monthly-test-actions">
          <button className="demo-btn" onClick={handleDemoAdvance}>[데모] 30일 경과</button>
          <button 
            className="btn-primary"
            disabled={daysUntilTest !== 0}
            onClick={() => { navigate('/diagnosis', { state: { isMonthlyTest: true } }); }}
          >
            등급 테스트 시작 →
          </button>
        </div>
      </div>

      {/* 오답 복습 노트 */}
      <div className="glass-panel homework-card animate-fade-in" style={{ animationDelay: '0.48s' }}>
        <h3><AlertTriangle size={20} color="#ef4444" /> 오답 복습 노트</h3>
        <p>최근 30일간 틀린 문제 <strong>{wrongReviewCount}</strong>개가 누적되어 있습니다. 푼 문제도 한 달간 다시 노출됩니다.</p>
        <button className="btn-primary" onClick={() => navigate(`/homework/math/${WRONG_REVIEW_ID}`)}>
          오답 복습 시작 →
        </button>
      </div>

      {/* ═══ 9. 조교 숙제 검사함 (기존 보존) ═══ */}
      <div className="glass-panel homework-card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h3><CheckCircle size={20} /> 조교 숙제 검사함</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          선생님이 내주신 숙제를 조교 선생님에게 다이렉트로 검사받고 피드백을 확인하세요.
        </p>
        <button className="btn-primary" onClick={() => navigate('/homework')}>
          숙제함으로 이동 →
        </button>
      </div>

      {/* ═══ 10. 수업 현황 리포트 (기존 보존) ═══ */}
      {(lessonHistory.length > 0) && (
        <div className="lesson-report-card glass-panel animate-fade-in" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid rgba(16, 185, 129, 0.15)', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)', animationDelay: '0.55s' }}>
          <h3><BookOpen size={22} /> 1일차 수업 현황 (학습 리포트)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {lessonHistory.map(r => (
              <div key={r.id} className="lesson-item">
                <div className="lesson-item-header">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(r.date).toLocaleDateString('ko-KR')} • {r.grade} {r.subject}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '3px' }}>{r.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: r.accuracy >= 70 ? '#10b981' : '#ef4444' }}>{r.accuracy}%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.correctCount}/{r.totalQuestions} 정답</div>
                  </div>
                </div>
                <div className="lesson-wrong-box">
                  <div className="lesson-wrong-header">
                    <AlertTriangle size={14} /> 오답 발생 번호 (집중 보강 대상)
                  </div>
                  <div className="lesson-wrong-tags">
                    {(r.wrongIndices || []).map(idx => (
                      <span key={idx} className="lesson-wrong-tag">{idx}번</span>
                    ))}
                  </div>
                </div>
                <div className="lesson-ai-note">
                  <strong>AI 분석: </strong>{r.nextLessonFocus}
                </div>
              </div>
            ))}
          </div>
          <div className="parent-notification">
            <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><Zap size={16} /> 학부모 실시간 알림 (Push)</span>
              <button onClick={() => navigate('/push-settings')} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#6b7280', cursor: 'pointer' }}>⚙️ 설정</button>
            </h4>
            {(() => {
              const pushQueue = JSON.parse(localStorage.getItem('pushQueue') || '[]');
              const recentPushes = pushQueue.slice(-3).reverse();
              const latestLesson = lessonHistory[lessonHistory.length - 1];
              if (recentPushes.length > 0) {
                return recentPushes.map((p, i) => (
                  <p key={i} style={{ fontSize: '0.82rem', marginBottom: '0.4rem', padding: '0.4rem 0.6rem', background: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    {p.message?.substring(0, 150)}{p.message?.length > 150 ? '...' : ''}
                    <span style={{ color: p.status === 'sent' ? '#10b981' : '#f59e0b', marginLeft: '6px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      [{p.status === 'sent' ? '전송 완료' : p.status === 'failed' ? '전송 실패' : '대기 중'}]
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '0.68rem', marginLeft: '4px' }}>{new Date(p.timestamp).toLocaleTimeString('ko-KR')}</span>
                  </p>
                ));
              } else if (latestLesson) {
                return (
                  <p style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem', background: '#f8fafc', borderRadius: '6px', color: '#64748b' }}>
                    최근 수업: <b>{latestLesson.unit}</b> (정답률 {latestLesson.accuracy}%) — 수업 종료 시 자동 발송됩니다.
                    <span style={{ color: '#94a3b8', marginLeft: '6px' }}>[설정에서 SMS/카카오톡 연동 가능]</span>
                  </p>
                );
              } else {
                return <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>아직 발송된 알림이 없습니다. 수업/테스트 완료 시 자동 발송됩니다.</p>;
              }
            })()}
          </div>
        </div>
      )}

      {/* ═══ 10-2. 숙제 완료 현황 (학습 리포트) ═══ */}
      {completedHomeworkList.length > 0 && (
        <div className="lesson-report-card glass-panel animate-fade-in" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid rgba(59, 130, 246, 0.15)', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.05)', animationDelay: '0.58s', marginTop: '1.5rem' }}>
          <h3><CheckCircle size={22} color="#3b82f6" /> 숙제 완료 현황 (오답 분석 리포트) · 누적 {completionEvents.length}건</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {completedHomeworkList.map(hw => (
              <div key={hw.id} className="lesson-item" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="lesson-item-header">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>통합 숙제 완료 세션 • {studentLevel}</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '3px' }}>{hw.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: '900', color: hw.accuracy >= 70 ? '#10b981' : hw.accuracy >= 40 ? '#f59e0b' : '#ef4444' }}>{hw.accuracy}%</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hw.correctCount}/{hw.problemCount} 정답</div>
                  </div>
                </div>
                {hw.wrongIndices.length > 0 ? (
                  <div className="lesson-wrong-box" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <div className="lesson-wrong-header" style={{ color: '#2563eb' }}>
                      <AlertTriangle size={14} color="#3b82f6" /> 숙제 오답 발생 문항 (복습 권장)
                    </div>
                    <div className="lesson-wrong-tags">
                      {hw.wrongIndices.map(idx => (
                        <span key={idx} className="lesson-wrong-tag" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.15)' }}>{idx}번</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="lesson-ai-note" style={{ background: 'rgba(16, 185, 129, 0.05)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    🎉 <strong>퍼펙트!</strong> 오답 없이 모든 문제를 완벽하게 맞혔습니다.
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                  <div className="lesson-ai-note" style={{ margin: 0, flex: 1 }}>
                    <strong>AI 처방: </strong>{hw.wrongIndices.length > 0 ? '틀린 문제를 다시 풀어보고 해설 동영상(AVS)을 재시청하는 것을 권장합니다.' : '해당 단원의 개념을 완벽하게 마스터했습니다. 다음 단계로 나아가세요!'}
                  </div>
                  {hw.wrongIndices.length > 0 && (
                    <button 
                      onClick={() => navigate(`/homework/math/${hw.id}`, { state: { studentLevel } })}
                      style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)' }}
                    >
                      오답 노트 풀기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 10-3. 주간 & 월간 성취도 분석 리포트 (수학 전용 신설) ═══ */}
      <div className="lesson-report-card glass-panel animate-fade-in" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid rgba(148, 163, 184, 0.15)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', animationDelay: '0.59s', marginTop: '1.5rem', padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.8rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <TrendingUp size={22} color="#4f46e5" /> 수학 주간 & 월간 성취도 분석 리포트
          </h3>
          <div style={{ display: 'flex', background: '#cbd5e1', padding: '2px', borderRadius: '8px', gap: '2px' }}>
            <button 
              onClick={() => setActiveReportTab('weekly')}
              style={{ padding: '0.4rem 0.8rem', border: 'none', background: activeReportTab === 'weekly' ? '#fff' : 'transparent', color: activeReportTab === 'weekly' ? '#1e293b' : '#64748b', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            >
              주간 리포트
            </button>
            <button 
              onClick={() => setActiveReportTab('monthly')}
              style={{ padding: '0.4rem 0.8rem', border: 'none', background: activeReportTab === 'monthly' ? '#fff' : 'transparent', color: activeReportTab === 'monthly' ? '#1e293b' : '#64748b', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
            >
              월간 리포트
            </button>
          </div>
        </div>

        {activeReportTab === 'weekly' ? (
          <div>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.2rem 0', lineHeight: 1.5 }}>
              최근 1주일간의 수업과 숙제 데이터를 정밀 스캔하여 <strong>가장 취약한 취약단원 TOP 3</strong>를 실시간으로 노출합니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {mathWeakness.top3.length > 0 ? (
                mathWeakness.top3.map((w, idx) => (
                  <div key={w.unit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#1e293b' }}>{w.unit}</div>
                        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px', fontWeight: '600' }}>⚠️ 발견된 취약점: {w.tag}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>오답 빈도</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ef4444' }}>{w.wrong}회 <span style={{ fontSize: '0.78rem', fontWeight: 'normal', color: '#94a3b8' }}>({w.errorRate}%)</span></div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  🎉 최근 7일 동안 발생한 수학 오답이 전혀 없습니다! 개념을 훌륭히 마스터하고 있습니다.
                </div>
              )}
            </div>
            <div style={{ marginTop: '1.2rem', padding: '0.8rem 1rem', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: '10px', fontSize: '0.82rem', color: '#4338ca', lineHeight: 1.5 }}>
              💡 <strong>AI 처방전:</strong> 취약 단원 TOP 3에 대해 매주 개인 보강용 2배수 변형 드릴 문항을 정밀 배포 중입니다. 꾸준히 오답 노트를 학습해 주십시오.
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.2rem' }}>
              <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.6rem 0', color: '#1e293b', fontSize: '0.85rem' }}>종합 성취 개선 통계</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>+15%</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>이해도 상승</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>지난 30일 대비 오답률 30% 감소 추세</div>
              </div>
              <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.6rem 0', color: '#1e293b', fontSize: '0.85rem' }}>격주 단원테스트 극복률</h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#4f46e5' }}>80%</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>취약 단원 격파율</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>테스트 완료 단원의 4/5 개선 성공</div>
              </div>
            </div>
            
            <h4 style={{ margin: '0 0 0.6rem 0', color: '#1e293b', fontSize: '0.88rem', fontWeight: '800' }}>격주 단원점검테스트 이력 (실력 극복 기록)</h4>
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '0.8rem 1rem' }}>점검 단원</th>
                    <th style={{ padding: '0.8rem 1rem' }}>격주 테스트 점수</th>
                    <th style={{ padding: '0.8rem 1rem' }}>극복 여부 진단</th>
                  </tr>
                </thead>
                <tbody>
                  {fortTestResults.length > 0 ? (
                    fortTestResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: i === fortTestResults.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: '700', color: '#1e293b' }}>{res.unitDiagnoses?.[0]?.unit || '수학 핵심 단원'}</td>
                        <td style={{ padding: '0.8rem 1rem', fontWeight: '800', color: '#4f46e5' }}>{res.accuracy}% ({res.correctCount}/{res.totalCount})</td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold', background: res.accuracy >= 80 ? '#d1fae5' : '#fef3c7', color: res.accuracy >= 80 ? '#065f46' : '#92400e' }}>
                            {res.accuracy >= 80 ? '실력 개선됨 (나아짐! ✅)' : '개념 보강 필요 (그대로임 ⚠️)'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                        수행 완료된 격주 단원점검테스트가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ═══ 10-4. 격주 2주 단원점검테스트 (수학 전용 신설) ═══ */}
      <div className="lesson-report-card glass-panel animate-fade-in" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)', border: '1px solid rgba(168, 162, 158, 0.2)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', animationDelay: '0.6s', marginTop: '1.5rem', padding: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1c1917' }}>
            <Target size={22} color="#d97706" /> 2주 수학 단원점검테스트 (격주 오답 완벽 격파)
          </h3>
          <span style={{ fontSize: '0.78rem', fontWeight: 'bold', padding: '0.2rem 0.6rem', borderRadius: '12px', background: fortnightlyDays >= 14 ? '#fef3c7' : '#e7e5e4', color: fortnightlyDays >= 14 ? '#b45309' : '#57534e' }}>
            {fortnightlyDays >= 14 ? '🔥 테스트 개시됨' : `D-${Math.max(1, 14 - fortnightlyDays)}일 후 생성`}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#44403c', margin: '0 0 1.2rem 0', lineHeight: 1.5 }}>
          최근 2주간 틀렸던 수학 오답 문항 및 미풀이 개념들을 분석 스캔하여 <strong>하루 전에 20문항 시험지가 백그라운드 예약 출제</strong>되며, 14일째에 정식으로 활성화됩니다.
        </p>

        {/* 현재 상태 정보 패널 */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem', border: '1px solid #e7e5e4', marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: '#57534e' }}>진행 경과일</span>
            <strong style={{ color: '#1c1917' }}>{fortnightlyDays}일 / 14일</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e7e5e4', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, Math.round((fortnightlyDays / 14) * 100))}%`, height: '100%', background: fortnightlyDays >= 14 ? '#f59e0b' : '#78716c', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: fortnightlyDays === 13 ? 'rgba(217, 119, 6, 0.05)' : '#fcfcfb', border: fortnightlyDays === 13 ? '1px solid rgba(217, 119, 6, 0.2)' : '1px solid #f5f5f4', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', color: '#57534e', marginTop: '0.3rem' }}>
            {fortnightlyDays < 13 && (
              <span>📝 최근 오답 단원을 스캔하여 2주 단위 오답 극복 시험을 준비하고 있습니다.</span>
            )}
            {fortnightlyDays === 13 && (
              <span style={{ color: '#b45309' }}>
                📢 <strong>시험 하루 전 출제 예약 완료!</strong> 최근 오답인 <strong>{assignedFortProblems.map(p => p.unit).filter((v, i, self) => self.indexOf(v) === i).join(', ')}</strong> 단원에서 기출 20문항 배정 완료. 내일 정식으로 테스트가 개시됩니다.
              </span>
            )}
            {fortnightlyDays >= 14 && (
              <span style={{ color: '#166534', fontWeight: 'bold' }}>
                ✅ <strong>테스트 활성화 완료!</strong> 검증된 기출 20문항 출제되었습니다. 오답을 완벽 격파하여 학부모 알림 보고서를 발송하세요!
              </span>
            )}
          </div>
        </div>

        {/* 조작 버튼 영역 */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            disabled={fortnightlyDays < 14}
            onClick={() => {
              setFortAnswers({});
              setFortGradingResult(null);
              setShowFortTestModal(true);
            }}
            style={{
              flex: 1, padding: '0.9rem',
              background: fortnightlyDays >= 14 ? 'linear-gradient(135deg, #d97706, #b45309)' : '#e7e5e4',
              color: fortnightlyDays >= 14 ? '#white' : '#a8a29e',
              border: 'none', borderRadius: '10px',
              fontWeight: 'bold', fontSize: '0.95rem',
              cursor: fortnightlyDays >= 14 ? 'pointer' : 'not-allowed',
              boxShadow: fortnightlyDays >= 14 ? '0 4px 14px rgba(217, 119, 6, 0.3)' : 'none',
              transition: 'all 0.2s', color: '#fff'
            }}
          >
            {fortnightlyDays >= 14 ? '🔥 단원점검테스트 시작하기 →' : '⏱️ 대기 중 (14일차 활성화)'}
          </button>

          {/* 개발자용 데모 타임워프 판넬 */}
          <div style={{ display: 'flex', background: '#e7e5e4', borderRadius: '10px', padding: '3px', gap: '3px' }}>
            <button onClick={() => handleFortDayJump(13)} style={{ padding: '0.35rem 0.6rem', border: 'none', background: fortnightlyDays === 13 ? '#fff' : 'transparent', color: '#44403c', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }} title="13일차 점프 (예고 상태)">[데모] 13일</button>
            <button onClick={() => handleFortDayJump(14)} style={{ padding: '0.35rem 0.6rem', border: 'none', background: fortnightlyDays === 14 ? '#fff' : 'transparent', color: '#44403c', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }} title="14일차 점프 (테스트 활성화)">[데모] 14일</button>
            <button onClick={() => handleFortDayJump(0)} style={{ padding: '0.35rem 0.6rem', border: 'none', background: fortnightlyDays === 0 ? '#fff' : 'transparent', color: '#44403c', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }} title="경과일 초기화">초기화</button>
          </div>
        </div>
      </div>

      {/* ═══ 11. 자동 생성 숙제 (기존 보존) ═══ */}
      <div className="auto-hw-card glass-panel animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3><CheckCircle size={20} /> 통합 숙제 ({STAGE_ACCESS[studentLevel] || '2단계'})</h3>
        {homeworkList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>🎉 모든 숙제를 완료했습니다!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {homeworkList.map(hw => (
              <div key={hw.id} className="auto-hw-item">
                <div className="auto-hw-item-info">
                  <div className="auto-hw-title">{hw.title} {hw.sequence ? `(${hw.sequence}회차)` : ''}</div>
                  <div className="auto-hw-meta">
                    {hw.problemCount}문제 | 진행률 {hw.progressPercent}% ({hw.answeredCount}/{hw.problemCount})
                  </div>
                </div>
                <button className="auto-hw-btn" onClick={() => navigate(`/homework/math/${hw.id}`, { state: { studentLevel } })}>
                  {hw.answeredCount > 0 ? '이어풀기' : '풀기 시작'}
                </button>
              </div>
            ))}
          </div>
        )}
        <button className="btn-primary" style={{ marginTop: '0.8rem', width: '100%' }} onClick={() => navigate('/homework')}>
          전체 숙제함 보기 →
        </button>
      </div>

      {/* ═══ Mock Exam Analysis (Hidden) ═══ */}
      {false && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                <Target size={18} /> 실전 모의고사 분석 리포트
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{mockExamReport.examName}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{mockExamReport.score}점</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>예상 등급: 2등급 (상위 12%)</div>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={14}/> 취약 단원 TOP 3 (AI 분석)
            </h4>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
              {topWeakUnits.map(unit => (
                <span key={unit} style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.25rem 0.6rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.3)' }}>{unit} (보강 배정됨)</span>
              ))}
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{mockExamReport.analysisAndAction}</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h4 style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={14}/> AI 보강 추적 코멘트
            </h4>
            <p style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>{mockExamReport.aiCommentary}</p>
          </div>
        </div>
      )}

      {/* ═══ 12. 차트 (기존 보존) ═══ */}
      <div className="charts-grid animate-fade-in" style={{ animationDelay: '0.65s' }}>
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>📊 일주일 학습 성장 흐름</h3>
            <span className="chart-desc">이해도 상승과 오답 감소율</span>
          </div>
          <div className="chart-wrapper">
            {weeklyData && weeklyData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false}/>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-main)' }} />
                  <Line type="monotone" dataKey="개념이해도" stroke="#a855f7" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="정답률" stroke="#10b981" strokeWidth={2} dot={{r: 4}} />
                  <Line type="monotone" dataKey="오답률" stroke="#ef4444" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="푼문제수" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-legend">
            <span className="leg-item"><span className="dot" style={{background: '#a855f7'}}></span>이해도</span>
            <span className="leg-item"><span className="dot" style={{background: '#10b981'}}></span>정답률</span>
            <span className="leg-item"><span className="dot" style={{background: '#ef4444'}}></span>오답률</span>
            <span className="leg-item"><span className="dot" style={{background: '#3b82f6'}}></span>문제수</span>
          </div>
        </div>

        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>📈 한 달 등급/능력 변화</h3>
            <span className="chart-desc">종합적인 실력 향상 추이</span>
          </div>
          <div className="chart-wrapper">
            {monthlyData && monthlyData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorConcept" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false}/>
                  <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" yAxisId="left" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" reversed stroke="#fbbf24" domain={[1, 5]} ticks={[1,2,3,4,5]} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--text-main)' }} />
                  <Area yAxisId="left" type="monotone" dataKey="개념" stroke="#14b8a6" fillOpacity={1} fill="url(#colorConcept)" strokeWidth={2}/>
                  <Line yAxisId="left" type="monotone" dataKey="적용" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="속도" stroke="#a855f7" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="등급" stroke="#fbbf24" strokeWidth={3} dot={{r: 5}} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-legend">
            <span className="leg-item"><span className="dot" style={{background: '#14b8a6'}}></span>개념</span>
            <span className="leg-item"><span className="dot" style={{background: '#3b82f6'}}></span>적용</span>
            <span className="leg-item"><span className="dot" style={{background: '#a855f7'}}></span>속도</span>
            <span className="leg-item"><span className="dot" style={{background: '#fbbf24'}}></span>등급</span>
          </div>
        </div>
      </div>

      {/* ═══ 13. 달력 (기존 보존) ═══ */}
      <div className="glass-panel calendar-card animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <h3>
          📅 학습 기록 달력 {examModeActive && <span style={{fontSize:'0.7rem', background:'#f59e0b', color:'#fff', padding:'0.15rem 0.4rem', borderRadius:'8px'}}>시험기간</span>}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', marginTop: '0.2rem' }}>
          연속 학습 {streakCount}일째! 꾸준한 성장이 보입니다.
        </p>

        <div className="calendar-weekdays">
          <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
        </div>

        <div className="calendar-grid">
          {calendarDays.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} className="calendar-cell" />;
            
            const logEntry = studyLogs.find(l => l.date === item.dateKey);
            const isToday = item.dateKey === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            const isTestDate = item.dateKey === `${nextTestDate.getFullYear()}-${String(nextTestDate.getMonth()+1).padStart(2,'0')}-${String(nextTestDate.getDate()).padStart(2,'0')}`;
            
            return (
              <div 
                key={item.dateKey} 
                onClick={() => logEntry && setSelectedDateKey(item.dateKey)}
                className={`calendar-cell ${logEntry ? 'calendar-cell-active' : ''} ${isToday ? 'calendar-cell-today' : ''} ${isTestDate ? 'calendar-cell-test' : ''}`}
                style={{ cursor: logEntry ? 'pointer' : 'default' }}
              >
                <div className="calendar-day-num" style={{ color: isToday ? '#c084fc' : isTestDate ? '#ef4444' : 'var(--text-main)' }}>
                  {item.day}
                  {isTestDate && <span style={{ fontSize: '0.55rem', background: '#ef4444', color: '#fff', padding: '0.05rem 0.2rem', borderRadius: '3px' }}>TEST</span>}
                </div>
                {logEntry && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    {logEntry.subjects.slice(0, 2).map((sub, i) => (
                      <div key={i} className="calendar-subject-entry">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span className="calendar-subject-dot" style={{ background: SUBJECT_COLORS[sub.subject] || '#fff' }}></span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>{sub.subject}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.unit}</div>
                      </div>
                    ))}
                    {logEntry.subjects.length > 2 && <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'right' }}>+{logEntry.subjects.length - 2}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 날짜 클릭 상세 모달 */}
      {selectedDateKey && (
        <div className="calendar-detail-modal animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>{selectedDateKey} 학습 상세</h3>
            <button onClick={() => setSelectedDateKey(null)} style={{ background: 'rgba(15, 23, 42, 0.05)', border: '1px solid rgba(15, 23, 42, 0.1)', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.8rem' }}>닫기 ✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {studyLogs.find(l => l.date === selectedDateKey)?.subjects.map((sub, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '12px', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: SUBJECT_COLORS[sub.subject] || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.7rem', flexShrink: 0 }}>
                    {sub.subject.substring(0, 2)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.unit}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.duration}분</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: '800', color: sub.testResult >= 80 ? '#10b981' : sub.testResult >= 60 ? '#f59e0b' : '#ef4444' }}>
                    {sub.testResult}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ 10-5. 수학 격주 단원점검테스트 풀이 모달 보드 (신설) ═══ */}
      {showFortTestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '24px', maxWidth: '1000px', width: '95%', height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            
            {/* 모달 헤더 */}
            <div style={{ padding: '1.2rem 2rem', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={22} color="#fbbf24" />
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>
                  2주 수학 단원점검테스트 (실시간 오답 격파 클리닉)
                </h3>
              </div>
              {!fortGradingResult && (
                <button 
                  onClick={() => setShowFortTestModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* 모달 본문 (좌측 시험지, 우측 OMR 보드) */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              
              {!fortGradingResult ? (
                <>
                  {/* 좌측: 기출 시험지 뷰어 */}
                  <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: '#f8fafc', borderRight: '1px solid #334155' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {assignedFortProblems.map((prob, idx) => (
                        <div key={prob.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '900', color: '#4f46e5', fontSize: '1.1rem' }}>Q{idx + 1}. {prob.unit}</span>
                            <span style={{ fontSize: '0.72rem', background: prob.isWrongHistory ? '#fee2e2' : '#eff6ff', color: prob.isWrongHistory ? '#ef4444' : '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 'bold' }}>
                              {prob.isWrongHistory ? '⚠️ 오답 극복 대상' : '기출 변형 검증'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                            <img 
                              src={prob.imagePath} 
                              alt={`문제 ${prob.numStr}`}
                              style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px' }}
                              onError={(e) => {
                                e.target.src = '/icons/default-math-problem.webp';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 우측: OMR 정답 기입 및 마킹 판넬 */}
                  <div style={{ width: '320px', background: '#0f172a', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', color: '#cbd5e1', fontSize: '0.95rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>🎯 OMR 마킹 보드</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: 'calc(85vh - 240px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {assignedFortProblems.map((prob, idx) => (
                          <div key={prob.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9rem' }}>Q{idx + 1}번 정답</span>
                            <input 
                              type="text" 
                              placeholder="번호 또는 정답"
                              value={fortAnswers[prob.id] || ''}
                              onChange={(e) => setFortAnswers({ ...fortAnswers, [prob.id]: e.target.value })}
                              style={{ width: '120px', padding: '0.6rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const grading = gradeFortnightlyTest(fortAnswers, assignedFortProblems);
                        setFortGradingResult(grading);
                        
                        const prevResults = JSON.parse(localStorage.getItem('fortnightly_test_results') || '[]');
                        prevResults.push(grading);
                        localStorage.setItem('fortnightly_test_results', JSON.stringify(prevResults));
                        setFortTestResults(prevResults);

                        sendFortnightlyParentPush('멘토스 학생', grading);
                      }}
                      style={{
                        width: '100%', padding: '1rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', border: 'none', borderRadius: '12px',
                        fontWeight: '900', fontSize: '1rem', cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        marginTop: '2rem'
                      }}
                    >
                      🗳️ 마킹 제출 및 채점하기
                    </button>
                  </div>
                </>
              ) : (
                /* 제출 결과 화면 */
                <div style={{ flex: 1, padding: '3rem', background: '#090d16', color: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-fade-in">
                  <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>🎉</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', margin: '1rem 0 0.5rem 0' }}>오답 완벽 격파!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>2주 단원점검테스트 완료 및 실시간 분석이 종료되었습니다.</p>

                    {/* 성적 보드 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>종합 성취도 점수</div>
                        <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fbbf24', marginTop: '0.5rem' }}>{fortGradingResult.accuracy}%</div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.3rem' }}>{fortGradingResult.correctCount} / {fortGradingResult.totalCount} 문제 정답</div>
                      </div>
                      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>학부모 실시간 알림</div>
                        <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#4ade80', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          📬 Push 전송 완료
                        </span>
                      </div>
                    </div>

                    {/* 세부 단원 극복 진단 */}
                    <h4 style={{ color: '#cbd5e1', textAlign: 'left', margin: '0 0 0.8rem 0', fontWeight: '800' }}>📈 단원별 실력 극복 상태 진단</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.5rem' }}>
                      {fortGradingResult.unitDiagnoses.map(diag => (
                        <div key={diag.unit} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{diag.unit}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>이전 오답률: {diag.prevErrorRate}% → 이번 테스트 성취도: {diag.testAccuracy}%</div>
                          </div>
                          <span style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', background: diag.isImproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(217, 119, 6, 0.15)', color: diag.isImproved ? '#4ade80' : '#fbbf24', border: diag.isImproved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(217, 119, 6, 0.3)' }}>
                            {diag.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setShowFortTestModal(false);
                        setFortGradingResult(null);
                        setFortnightlyTestStatus('completed');
                        setFortnightlyDays(0);
                      }}
                      style={{
                        padding: '1rem 3rem', background: '#4f46e5', color: '#white',
                        border: 'none', borderRadius: '12px', fontWeight: 'bold',
                        fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                        transition: '0.2s', color: '#fff'
                      }}
                    >
                      확인 및 대시보드로 복귀
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
