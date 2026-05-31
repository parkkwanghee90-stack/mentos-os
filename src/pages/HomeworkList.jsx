import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Lock, CheckCircle, ChevronRight, Zap, Flame, Sparkles } from 'lucide-react';
import { HOMEWORK_UNITS, STAGE_ACCESS, getHomeworkRange, getHomeworkProgress, isSequenceUnlocked } from '@/data/homeworkSSOT';

export default function HomeworkList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [dynamicHomeworks, setDynamicHomeworks] = useState([]);

  // 학생 등급 (GradeSelect에서 저장)
  const studentLevel = localStorage.getItem('studentLevel') || '4~5등급';
  const studentStage = STAGE_ACCESS[studentLevel] || '2단계';

  // 1. 동적 배정 숙제 로드
  useEffect(() => {
    const loadDynamicHomeworks = () => {
      const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
      const localHwDb = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
      
      const mapped = localHwList.map(hw => {
        const dbDetail = localHwDb.find(d => d.homeworkId === hw.homeworkId);
        const totalProblems = dbDetail?.problems?.length || 0;
        
        const progress = getHomeworkProgress(hw.homeworkId);
        const answeredCount = Object.keys(progress).length;
        const correctCount = Object.values(progress).filter(p => p.isCorrect).length;
        const wrongCount = Object.values(progress).filter(p => p.isCorrect === false).length;
        const isComplete = totalProblems > 0 && answeredCount >= totalProblems;
        
        return {
          ...hw,
          id: hw.homeworkId,
          totalProblems,
          answeredCount,
          correctCount,
          wrongCount,
          isComplete,
          progressPercent: totalProblems > 0 ? Math.round((answeredCount / totalProblems) * 100) : 0,
          unlocked: true,
          isDynamic: true,
        };
      });
      setDynamicHomeworks(mapped);
    };

    loadDynamicHomeworks();
    // 로컬 스토리지 감지 이벤트 등록
    window.addEventListener('storage', loadDynamicHomeworks);
    return () => window.removeEventListener('storage', loadDynamicHomeworks);
  }, [studentLevel]);

  // 2. 정적 단원별 코스 진행도 계산
  const staticHomeworkStatus = useMemo(() => {
    return HOMEWORK_UNITS.map(hw => {
      const range = getHomeworkRange(hw, studentLevel);
      const totalProblems = range.end - range.start + 1;
      const progress = getHomeworkProgress(hw.id);
      const answeredCount = Object.keys(progress).length;
      const correctCount = Object.values(progress).filter(p => p.isCorrect).length;
      const wrongCount = Object.values(progress).filter(p => p.isCorrect === false).length;
      const isComplete = answeredCount >= totalProblems;
      const unlocked = isSequenceUnlocked(hw);

      return {
        ...hw,
        totalProblems,
        answeredCount,
        correctCount,
        wrongCount,
        isComplete,
        unlocked,
        progressPercent: totalProblems > 0 ? Math.round((answeredCount / totalProblems) * 100) : 0,
        isDynamic: false,
      };
    });
  }, [studentLevel]);

  // 필터링 적용
  const filteredDynamicList = useMemo(() => {
    return dynamicHomeworks.filter(hw => {
      if (filter === 'pending') return !hw.isComplete;
      if (filter === 'completed') return hw.isComplete;
      return true;
    });
  }, [dynamicHomeworks, filter]);

  const filteredStaticList = useMemo(() => {
    return staticHomeworkStatus.filter(hw => {
      if (filter === 'pending') return !hw.isComplete && hw.unlocked;
      if (filter === 'completed') return hw.isComplete;
      return true;
    });
  }, [staticHomeworkStatus, filter]);

  const completedCount = useMemo(() => {
    const dynComplete = dynamicHomeworks.filter(h => h.isComplete).length;
    const statComplete = staticHomeworkStatus.filter(h => h.isComplete).length;
    return dynComplete + statComplete;
  }, [dynamicHomeworks, staticHomeworkStatus]);

  const totalCount = dynamicHomeworks.length + staticHomeworkStatus.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #09090b 0%, #0f172a 50%, #1e1b4b 100%)',
      color: 'white',
      fontFamily: "'Outfit', 'Inter', 'Noto Sans KR', sans-serif",
      padding: '0 0 2rem 0',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.2rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', color: '#94a3b8',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'
        }}>
          <ArrowLeft size={18} /> 대시보드
        </button>
        <h1 style={{ fontSize: '1.1rem', fontWeight: '900', margin: 0,
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>📚 통합 숙제함</h1>
        <div style={{ width: '80px' }} />
      </div>

      {/* 등급 + 진행도 요약 */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)', padding: '1rem 1.2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>내 등급</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#60a5fa' }}>{studentLevel}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>접근 단계</div>
            <div style={{
              fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981',
              background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>{studentStage}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>완료</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fbbf24' }}>{completedCount}/{totalCount}</div>
          </div>
        </div>
      </div>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 1.5rem', marginBottom: '1rem' }}>
        {[
          { key: 'all', label: '전체' },
          { key: 'pending', label: '미완료' },
          { key: 'completed', label: '완료' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s',
            background: filter === tab.key ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'rgba(255,255,255,0.05)',
            color: filter === tab.key ? 'white' : '#94a3b8',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 개인 맞춤 보강 과제 섹션 (동적 생성 숙제) */}
      {filteredDynamicList.length > 0 && (
        <div style={{ padding: '0 1.5rem', marginBottom: '1.8rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem',
            paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Flame size={16} color="#ef4444" className="animate-pulse" />
            <span style={{
              fontSize: '0.9rem', fontWeight: '900', letterSpacing: '0.5px',
              background: 'linear-gradient(to right, #f87171, #f472b6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>🔥 실시간 AI 맞춤형 과제</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              ({filteredDynamicList.length}개 과제)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filteredDynamicList.map((hw, idx) => (
              <button
                key={hw.id}
                onClick={() => navigate(`/homework/math/${hw.id}`, { state: { studentLevel } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.1rem 1.3rem', borderRadius: '16px',
                  background: hw.isComplete 
                    ? 'rgba(16,185,129,0.08)' 
                    : 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.1) 100%)',
                  border: hw.isComplete 
                    ? '1px solid rgba(16,185,129,0.2)' 
                    : '1px solid rgba(139,92,246,0.3)',
                  color: 'white', cursor: 'pointer',
                  transition: 'all 0.2s', textAlign: 'left', width: '100%',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
                  position: 'relative', overflow: 'hidden',
                  animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                }}
                className="hover-premium"
              >
                {/* 배경 반사 하이라이트 */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.03), transparent)',
                  transform: 'skewX(-20deg)', pointerEvents: 'none'
                }} />

                {/* 아이콘 */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: hw.isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.2)',
                  border: `1px solid ${hw.isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.4)'}`,
                }}>
                  {hw.isComplete ? <CheckCircle size={18} color="#10b981" /> : <Sparkles size={18} color="#c084fc" />}
                </div>

                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '900', fontSize: '0.98rem', color: '#f3e8ff' }}>{hw.title}</span>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px',
                      borderRadius: '6px', background: 'rgba(239,68,68,0.15)',
                      color: '#f87171', border: '1px solid rgba(239,68,68,0.25)'
                    }}>AI 복습</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      flex: 1, height: '4px', borderRadius: '2px',
                      background: 'rgba(255,255,255,0.08)', overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${hw.progressPercent}%`, height: '100%', borderRadius: '2px',
                        background: hw.isComplete ? '#10b981' : 'linear-gradient(to right, #a855f7, #6366f1)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#c084fc', flexShrink: 0, fontWeight: 'bold' }}>
                      {hw.answeredCount}/{hw.totalProblems}문제
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} color="#a78bfa" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. 정규 코스 과제 섹션 (정적 대단원 목록) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0 1.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem',
          paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <BookOpen size={16} color="#60a5fa" />
          <span style={{
            fontSize: '0.9rem', fontWeight: '900', letterSpacing: '0.5px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>📐 정규 교육과정 과제</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            ({filteredStaticList.length}개 코스)
          </span>
        </div>

        {(() => {
          let lastSubject = '';
          return filteredStaticList.map((hw, idx) => {
            const isLocked = !hw.unlocked;
            const subject = hw.subject || '수학(상)';
            const showHeader = subject !== lastSubject;
            lastSubject = subject;

            return (
              <React.Fragment key={hw.id}>
                {showHeader && (
                  <div style={{
                    marginTop: idx > 0 ? '1.2rem' : '0',
                    marginBottom: '0.3rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <Zap size={14} color={subject === '수학2' ? '#10b981' : subject === '수학1' ? '#f59e0b' : '#60a5fa'} />
                    <span style={{
                      fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.5px',
                      background: subject === '수학2' ? 'linear-gradient(to right, #10b981, #06b6d4)' : subject === '수학1' ? 'linear-gradient(to right, #f59e0b, #ef4444)' : 'linear-gradient(to right, #60a5fa, #a78bfa)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>{subject}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ({filteredStaticList.filter(h => (h.subject || '수학(상)') === subject).length}개 단원)
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (isLocked) return;
                    navigate(`/homework/math/${hw.id}`, { state: { hwUnit: hw, studentLevel } });
                  }}
                  disabled={isLocked}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.2rem', borderRadius: '16px',
                    background: isLocked ? 'rgba(255,255,255,0.02)' :
                      hw.isComplete ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
                    border: isLocked ? '1px solid rgba(255,255,255,0.04)' :
                      hw.isComplete ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.08)',
                    color: 'white', cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    opacity: isLocked ? 0.4 : 1,
                    animation: `fadeIn 0.3s ease ${idx * 0.03}s both`,
                  }}
                >
                  {/* 아이콘 */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isLocked ? 'rgba(255,255,255,0.05)' :
                      hw.isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)',
                    border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' :
                      hw.isComplete ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`,
                  }}>
                    {isLocked ? <Lock size={18} color="#64748b" /> :
                     hw.isComplete ? <CheckCircle size={18} color="#10b981" /> :
                     <BookOpen size={18} color="#60a5fa" />}
                  </div>

                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{hw.title}</span>
                      {hw.sequence && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px',
                          borderRadius: '6px', background: 'rgba(251,191,36,0.1)',
                          color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)'
                        }}>{hw.sequence}회차</span>
                      )}
                    </div>
                    {isLocked ? (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {hw.sequence ? `${hw.sequence - 1}회차 완료 후 해금` : `${studentStage} 전용`}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* 프로그레스 바 */}
                        <div style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: 'rgba(255,255,255,0.08)', overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${hw.progressPercent}%`, height: '100%', borderRadius: '2px',
                            background: hw.isComplete ? '#10b981' : 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>
                          {hw.answeredCount}/{hw.totalProblems}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 화살표 */}
                  {!isLocked && <ChevronRight size={18} color="#64748b" />}
                </button>
              </React.Fragment>
            );
          });
        })()}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hover-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(139, 92, 246, 0.25) !important;
          border-color: rgba(167, 139, 250, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
