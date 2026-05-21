import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Target, TrendingUp, AlertTriangle, Zap, ArrowLeft, BookOpen, CheckCircle, BookA, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
import { getRecentResults, getMistakePatterns, getStudyLogs } from '@/services/lessonResultStore';
import { getStudyMode } from '@/data/curriculumSSOT';
import { updateSession, loadSession, SESSION_STATUS, formatTime, getDaysUntilTest, getNextTestDate, advanceRegistrationDateForDemo } from '@/engine/sessionEngine';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import { processHomeworkSubmission } from '@/engine/homeworkEngine';
import '@/pages/Dashboard.css';

const parseSubject = (subj) => {
  const map = { 'physics': '물리', 'chemistry': '화학', 'biology': '생명과학', 'earth': '지구과학', 'math': '수학', 'english': '영어', 'eng': '영어' };
  return map[subj] || subj;
};

export default function Dashboard() {
  console.log("DASHBOARD_RENDER");
  const navigate = useNavigate();
  const signOut = async () => { console.log('Mock signout'); };
  
  const handleLogout = async () => {
    await signOut();
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
  const trialState = React.useMemo(() => JSON.parse(localStorage.getItem('mentos_free_trial') || '{}'), []);
  const weaknessHistory = React.useMemo(() => JSON.parse(localStorage.getItem('mentos_weakness_history') || '[]'), []);
  
  // Simulation Injection
  const lessonHistory = React.useMemo(() => {
    // 1일차 수업현황 시뮬레이션 데이터 주입 (고차방정식 2단계)
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
  
  const homeworkList = React.useMemo(() => {
    return [{
      id: 'sim_hw_001',
      title: '[오답 집중 보강] 고차방정식 2단계 유사 유형 드릴',
      dueDate: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString(),
      problemCount: 12, // 6문제 오답 * 2배수
      status: 'pending',
      teacherName: 'AI 튜터'
    }];
  }, []);

  const lastWeakness = weaknessHistory[weaknessHistory.length - 1];
  const topWeakUnits = lastWeakness ? lastWeakness.top3 : ["고차방정식 (인수분해)", "복이차식의 풀이", "방정식의 근과 계수"];
  
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

  // Mock data for graphs
  const weeklyData = [
    { day: '월', 개념이해도: 65, 오답률: 40, 푼문제수: 20 },
    { day: '화', 개념이해도: 70, 오답률: 35, 푼문제수: 25 },
    { day: '수', 개념이해도: 68, 오답률: 30, 푼문제수: 15 },
    { day: '목', 개념이해도: 75, 오답률: 25, 푼문제수: 30 },
    { day: '금', 개념이해도: 82, 오답률: 20, 푼문제수: 40 },
    { day: '토', 개념이해도: 88, 오답률: 15, 푼문제수: 50 },
    { day: '오늘', 정답률: 70, 오답률: 30, 푼문제수: 20 }
  ];

  const monthlyData = [
    { week: '1주차', 개념: 60, 적용: 45, 속도: 50, 등급: 4.5 },
    { week: '2주차', 개념: 75, 적용: 55, 속도: 55, 등급: 4.0 },
    { week: '3주차', 개념: 85, 적용: 70, 속도: 65, 등급: 3.5 },
    { week: '4주차', 개념: 95, 적용: 85, 속도: 80, 등급: 2.8 }
  ];

  const mockExamReport = {
    examName: "2025학년도 6월 모의평가 (1회)",
    score: 84,
    weakUnits: ["삼각함수의 활용", "합성함수의 미분", "등비급수"],
    analysisAndAction: "공통과목 15번(수열)과 미적분 28번(합성함수 미분), 30번(극값 추론)에서 오답이 발생했습니다. 수식 전개 과정에서 부등식 조건을 놓치거나 합성함수 연쇄법칙 적용에서 실수가 발견되었습니다. 오답이 발생한 각 취약 단원에 대해 1:1 매칭되는 5문제 집중 하드 트레이닝 드릴(Drill)을 즉시 자동 배정했습니다.",
    aiCommentary: "최근 배정된 '합성함수 미분' 5문제 드릴에서 정답률 100%를 기록하며 완벽하게 약점을 극복해냈습니다! 반면 '등비급수' 단원은 계산 실수가 1건 남아있어, 다음 주차에 2차 보강 훈련이 진행될 예정입니다. 이 페이스대로 드릴을 소화한다면 다음 모의고사 1등급(92점 이상) 진입이 확실시됩니다."
  };

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <button className="back-btn" onClick={handleLogout}><LogOut size={20}/> 로그아웃</button>
        <h1 className="dash-title">학생 맞춤형 학습 트래킹 (관리모드)</h1>
        <p className="dash-subtitle">실력이 올라가는 흐름을 실시간으로 확인하세요.</p>
      </div>

      <div className="stats-cards animate-fade-in">
        <div className="glass-panel stat-card">
          <Target className="stat-icon purple" />
          <div className="stat-info">
            <h4>오늘 푼 문제 수</h4>
            <div className="stat-value">{todayProblems} <span style={{fontSize: '0.9rem', color: '#94a3b8'}}>/ 60</span></div>
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
            <h4>오답/실수 패턴</h4>
            <div className="stat-value">감소 추세 <span className="trend up">-30%</span></div>
          </div>
        </div>
      </div>

      {/* Mock Exam Analysis Panel (Hidden as user has not taken mock exam) */}
      {false && (
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.05))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
              <Target size={20} /> 실전 모의고사 분석 리포트
            </h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{mockExamReport.examName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{mockExamReport.score}점</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981' }}>예상 등급: 2등급 (상위 12%)</div>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h4 style={{ color: '#fca5a5', fontSize: '0.95rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={16}/> 취약 단원 TOP 3 (AI 분석)
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {topWeakUnits.map(unit => (
              <span key={unit} style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.3)' }}>{unit} (보강 배정됨)</span>
            ))}
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            {mockExamReport.analysisAndAction}
          </p>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
          <h4 style={{ color: '#34d399', fontSize: '0.95rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16}/> AI 보강 추적 코멘트
          </h4>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            {mockExamReport.aiCommentary}
          </p>
        </div>
      </div>
      )}

      {/* Monthly Test Panel */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', background: daysUntilTest === 0 ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))' : 'rgba(255,255,255,0.03)', border: daysUntilTest === 0 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: daysUntilTest === 0 ? '#ef4444' : '#fff' }}>
            <BookA size={20} color={daysUntilTest === 0 ? "#ef4444" : "#94a3b8"} /> 
            {daysUntilTest === 0 ? '오늘은 월간 등급 테스트 날입니다!' : '다음 월간 테스트 일정'}
          </h3>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>예정일: <strong>{nextTestDate.toLocaleDateString('ko-KR')}</strong></span>
            <span>•</span>
            {daysUntilTest === 0 ? (
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>이번 테스트 결과로 등급 유지/승급이 결정됩니다.</span>
            ) : (
              <span>D-{daysUntilTest}일 남음</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={handleDemoAdvance}
            style={{ fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            [데모] 30일 경과
          </button>
          
          <button 
            className="btn-primary"
            disabled={daysUntilTest !== 0}
            style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: 'bold', opacity: daysUntilTest === 0 ? 1 : 0.5 , width: '100%'}}
            onClick={() => {
              navigate('/diagnosis', { state: { isMonthlyTest: true } });
            }}
          >
            등급 테스트 시작 ➔
          </button>
        </div>
      </div>

      {/* Active Session Panel (V2 & V1) */}
      <div style={{ margin: '0 0.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Start New Lesson Button */}
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
              <BookOpen size={20} color="#3b82f6" /> 오늘 공부할 과목을 선택하세요
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              AI 튜터와 함께 성적을 올릴 준비가 되셨나요?
            </p>
          </div>
          <button 
            className="btn-primary"
            style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' , width: '100%'}}
            onClick={() => navigate('/teacher')}
          >
            새로운 과목 학습 ➔
          </button>
        </div>

        
        {/* V2 Sessions (Science, New Math, etc) */}
        {v2Sessions.map((v2s, idx) => (
          <div key={`v2-${v2s.teacherId}`} className="glass-panel animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(16,185,129,0.3)', animationDelay: `${0.1 * idx}s` }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <Zap size={20} color="#10b981" /> 최근 이어서 하던 [V2] 수업이 있어요!
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span><strong style={{color: '#e2e8f0'}}>{parseSubject(v2s.teacherObj.subject)}</strong></span>
                <span>•</span>
                <span>{v2s.teacherObj.name} 선생님</span>
                <span>•</span>
                <span>{v2s.teacherObj.targetGrades.join(', ')} {v2s.teacherObj.targetRanks.join(', ')}</span>
                <span>•</span>
                <span style={{color: '#10b981'}}>{v2s.round}주차 (진도율 {v2s.currentPhaseIndex}/5 단계 진행 중)</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #10b981, #059669)' , width: '100%'}}
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
              이어서 하기 ➔
            </button>
          </div>
        ))}

        {/* V1 Sessions (Legacy English/Math) */}
        {hasActiveSessionV1 && (
          <div className="glass-panel animate-fade-in" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <Zap size={20} color="#a855f7" /> 현재 진행 중인 [V1] 수업이 있어요!
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span><strong style={{color: '#e2e8f0'}}>{parseSubject(activeSessionV1.subject)}</strong> ({activeSessionV1.unit})</span>
                <span>•</span>
                <span>선생님: {activeSessionV1.teacher}</span>
                <span>•</span>
                <span>등급: {activeSessionV1.band || activeSessionV1.level || ''}</span>
                <span>•</span>
                <span style={{color: '#a855f7'}}>{activeSessionV1.lessonPhase} 단계 진행 중</span>
              </div>
            </div>
            <button 
              className="btn-primary"
              style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: 'bold' , width: '100%'}}
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
              이어서 하기 ➔
            </button>
          </div>
        )}
      </div>

      {/* Homework Dashboard Link */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05))', border: '1px dashed #10b981', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
            <CheckCircle size={20} /> 조교 숙제 검사함
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            선생님이 내주신 숙제를 선생님과 유사한 UI에서 조교 선생님에게 다이렉트로 검사받고 피드백을 확인하세요.
          </p>
        </div>
        <button 
          className="btn-primary"
          style={{ borderRadius: '20px', padding: '0.6rem 1.5rem', fontWeight: 'bold' , width: '100%'}}
          onClick={() => navigate('/homework')}
        >
          숙제함으로 이동 ➔
        </button>
      </div>

      {/* Real Lesson Results Panel (Simulation Optimized) */}
      {(lessonHistory.length > 0) && (
        <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(192, 132, 252, 0.3)', background: 'rgba(192, 132, 252, 0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#c084fc' }}>
            <BookOpen size={24} /> 1일차 수업 현황 (학습 리포트)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {lessonHistory.map(r => (
              <div key={r.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{new Date(r.date).toLocaleDateString('ko-KR')} • {r.grade} {r.subject}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#fff', marginTop: '4px' }}>{r.unit}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: r.accuracy >= 70 ? '#10b981' : '#ef4444' }}>{r.accuracy}%</div>
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{r.correctCount} / {r.totalQuestions} 문제 정답</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> 오답 발생 번호 (집중 보강 대상)
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(r.wrongIndices || []).map(idx => (
                      <span key={idx} style={{ background: '#ef4444', color: 'white', padding: '2px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>{idx}번</span>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>AI 분석:</span> {r.nextLessonFocus}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.2rem', background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <h4 style={{ margin: '0 0 0.8rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} /> 학부모 실시간 알림 (Push)
            </h4>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              "자녀분이 방금 <b>고차방정식 2단계</b> 수업을 마쳤습니다. 20문제 중 14문제를 맞혔으며(정답률 70%), 틀린 6문제(1, 5, 8, 12, 15, 17번)를 기반으로 맞춤형 숙제가 자동 배정되었습니다." 
              <span style={{ color: '#10b981', marginLeft: '10px' }}>[전송 완료]</span>
            </div>
          </div>
        </div>
      )}

      {/* Homework Section (Simulation Optimized) */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#10b981' }}>
          <CheckCircle size={24} /> 자동 생성된 맞춤 숙제
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {homeworkList.map(hw => (
            <div key={hw.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>{hw.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>기한: {hw.dueDate} | 문항수: {hw.problemCount}문제 | 출제: {hw.teacherName}</div>
              </div>
              <button 
                onClick={() => navigate(`/homework/math/${hw.id}`)}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                풀기 시작
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Pattern Panel */}
      {mistakePatterns.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#ef4444" /> 반복 실수 유형
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {mistakePatterns.map(([tag, count]) => (
              <div key={tag} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>
                {tag} ({count}회)
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="charts-grid animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Weekly Graph */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>일주일 학습 성장 흐름</h3>
            <span className="chart-desc">이해도 상승과 오답 감소율</span>
          </div>
          <div className="chart-wrapper">
            {weeklyData && weeklyData.length > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false}/>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="개념이해도" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="정답률" stroke="#10b981" strokeWidth={3} dot={{r: 6}} />
                  <Line type="monotone" dataKey="오답률" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="푼문제수" stroke="#3b82f6" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-legend">
            <span className="leg-item"><span className="dot" style={{background: '#a855f7'}}></span>개념 이해도</span>
            <span className="leg-item"><span className="dot" style={{background: '#10b981'}}></span>오늘 정답률</span>
            <span className="leg-item"><span className="dot" style={{background: '#ef4444'}}></span>오답률</span>
            <span className="leg-item"><span className="dot" style={{background: '#3b82f6'}}></span>푼 문제수</span>
          </div>
        </div>

        {/* Monthly Graph */}
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>한 달 등급/능력 변화</h3>
            <span className="chart-desc">종합적인 실력 향상 추이</span>
          </div>
          <div className="chart-wrapper">
            {monthlyData && monthlyData.length > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorConcept" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false}/>
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" reversed stroke="#fbbf24" domain={[1, 5]} ticks={[1,2,3,4,5]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="개념" stroke="#14b8a6" fillOpacity={1} fill="url(#colorConcept)" strokeWidth={2}/>
                  <Line yAxisId="left" type="monotone" dataKey="적용" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="속도" stroke="#a855f7" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="등급" stroke="#fbbf24" strokeWidth={3} dot={{r: 6}} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-legend">
            <span className="leg-item"><span className="dot" style={{background: '#14b8a6'}}></span>개념</span>
            <span className="leg-item"><span className="dot" style={{background: '#3b82f6'}}></span>적용</span>
            <span className="leg-item"><span className="dot" style={{background: '#a855f7'}}></span>속도</span>
            <span className="leg-item"><span className="dot" style={{background: '#fbbf24'}}></span>예상 등급</span>
          </div>
        </div>
      </div>

      {/* 학습 달력 섹션 */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem', animationDelay: '0.3s' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📅 학습 기록 달력 {examModeActive && <span style={{fontSize:'0.75rem', background:'#f59e0b', color:'#fff', padding:'0.2rem 0.5rem', borderRadius:'10px'}}>시험기간</span>}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          연속 학습 {streakCount}일째! 꾸준한 성장이 보입니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {calendarDays.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} style={{ minHeight: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />;
            
            const logEntry = studyLogs.find(l => l.date === item.dateKey);
            const isToday = item.dateKey === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            const isTestDate = item.dateKey === `${nextTestDate.getFullYear()}-${String(nextTestDate.getMonth()+1).padStart(2,'0')}-${String(nextTestDate.getDate()).padStart(2,'0')}`;
            
            return (
              <div 
                key={item.dateKey} 
                onClick={() => logEntry && setSelectedDateKey(item.dateKey)}
                style={{ 
                  minHeight: '80px', background: isToday ? 'rgba(168,85,247,0.1)' : isTestDate ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)', 
                  border: isToday ? '1px solid #a855f7' : isTestDate ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px', padding: '0.4rem', cursor: logEntry ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'transform 0.2s, background 0.2s'
                }}
                className={logEntry ? "calendar-cell-active" : ""}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: isToday ? '#c084fc' : isTestDate ? '#ef4444' : '#e2e8f0', marginBottom: '0.3rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                  {item.day}
                  {isTestDate && <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>TEST</span>}
                </div>
                {logEntry && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {logEntry.subjects.slice(0, 2).map((sub, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', fontSize: '0.65rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: SUBJECT_COLORS[sub.subject] || '#fff' }}></span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' }}>{sub.subject}</span>
                        </div>
                        <div style={{ color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.unit}</div>
                      </div>
                    ))}
                    {logEntry.subjects.length > 2 && <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right' }}>+{logEntry.subjects.length - 2}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 날짜 클릭 상세 모달 (간단 인라인 뷰) */}
      {selectedDateKey && (
        <div style={{ margin: '0 2rem 2rem 2rem', padding: '1.5rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '15px' }} className="animate-fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{selectedDateKey} 학습 상세</h3>
            <button onClick={() => setSelectedDateKey(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>닫기 ✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {studyLogs.find(l => l.date === selectedDateKey)?.subjects.map((sub, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: SUBJECT_COLORS[sub.subject] || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    {sub.subject.substring(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem' }}>{sub.unit}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>공부 시간: {sub.duration}분</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>테스트 성취도</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: sub.testResult >= 80 ? '#10b981' : sub.testResult >= 60 ? '#f59e0b' : '#ef4444' }}>
                    {sub.testResult}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
