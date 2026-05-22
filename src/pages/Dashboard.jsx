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
  
  React.useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#f8fafc';
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

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
              onClick={() => navigate('/grade-select')}
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
          <div key={`v2-${v2s.teacherId}`} className="glass-panel session-card animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.25)', animationDelay: `${0.35 + 0.05 * idx}s` }}>
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
          <div className="glass-panel session-card animate-fade-in" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(168,85,247,0.25)', animationDelay: '0.4s' }}>
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
      <div className="glass-panel monthly-test-card animate-fade-in" style={{ background: daysUntilTest === 0 ? 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(245,158,11,0.12))' : 'var(--panel-bg)', border: daysUntilTest === 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--panel-border)', animationDelay: '0.45s' }}>
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
        <div className="lesson-report-card glass-panel animate-fade-in" style={{ animationDelay: '0.55s' }}>
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
            <h4><Zap size={16} /> 학부모 실시간 알림 (Push)</h4>
            <p>
              "자녀분이 방금 <b>고차방정식 2단계</b> 수업을 마쳤습니다. 20문제 중 14문제를 맞혔으며(정답률 70%), 틀린 6문제(1, 5, 8, 12, 15, 17번)를 기반으로 맞춤형 숙제가 자동 배정되었습니다." 
              <span style={{ color: '#10b981', marginLeft: '6px' }}>[전송 완료]</span>
            </p>
          </div>
        </div>
      )}

      {/* ═══ 11. 자동 생성 숙제 (기존 보존) ═══ */}
      <div className="auto-hw-card glass-panel animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3><CheckCircle size={20} /> 자동 생성된 맞춤 숙제</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {homeworkList.map(hw => (
            <div key={hw.id} className="auto-hw-item">
              <div className="auto-hw-item-info">
                <div className="auto-hw-title">{hw.title}</div>
                <div className="auto-hw-meta">기한: {hw.dueDate} | {hw.problemCount}문제 | {hw.teacherName}</div>
              </div>
              <button className="auto-hw-btn" onClick={() => navigate(`/homework/math/${hw.id}`)}>
                풀기 시작
              </button>
            </div>
          ))}
        </div>
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
    </div>
    </div>
  );
}
