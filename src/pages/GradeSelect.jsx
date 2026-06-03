import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GRADE_FLOWS, TEACHER_ASSIGNMENT, initTrial, progressToNextUnit, getStartLevel } from '@/engine/gradeFlowSSOT';
import { getTeacherById } from '@/data/teacherProfiles';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import { ChevronRight, GraduationCap, Target, Zap, BookOpen, Star, Award } from 'lucide-react';
import LessonManual from '@/components/LessonManual';

const GRADE_ICONS = { '고1': '🎓', '고2': '📐', '고3': '🚀' };
const GRADE_COLORS = { '고1': '#3b82f6', '고2': '#8b5cf6', '고3': '#ef4444' };
const RANK_ICONS = { '4~5등급': '📖', '3등급': '⚡', '1~2등급': '🔥' };

export default function GradeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const subjectOverride = location.state?.subjectOverride;
  const [step, setStep] = useState(() => {
    return localStorage.getItem('mentos_manual_seen') === 'true' ? 'grade' : 'manual';
  }); // manual → grade → scope → rank → confirm
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);

  // Dashboard에서 과목 선택 후 진입 시 자동 학년+과목 프리셋
  useEffect(() => {
    if (!subjectOverride) return;
    const SUBJECT_GRADE_MAP = {
      '수학(상)': { grade: '고1', scope: null },
      '수학1':   { grade: '고2', scope: null },
      '수학2':   { grade: '고2', scope: '함수의 극한' },
      '미적분':  { grade: '고3', scope: '[미적분] 수열의 극한' },
      '확률과통계': { grade: '고3', scope: '[확통] 순열' },
    };
    const preset = SUBJECT_GRADE_MAP[subjectOverride];
    if (preset) {
      setSelectedGrade(preset.grade);
      if (preset.scope) {
        // 과목이 특정되면 바로 scope 선택 화면으로
        setStep('scope');
      } else {
        setStep('scope');
      }
    }
  }, [subjectOverride]);

  const flow = selectedGrade ? GRADE_FLOWS[selectedGrade] : null;

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setStep('scope');
  };

  const handleScopeSelect = (scope) => {
    setSelectedScope(scope);
    setStep('rank');
  };

  const handleRankSelect = (rank) => {
    setSelectedRank(rank);
    setStep('confirm');
  };

  const handleStart = (specificTeacher = null) => {
    localStorage.setItem("studentGrade", selectedGrade || '');
    localStorage.setItem("studentProgress", selectedScope || '');
    localStorage.setItem("studentLevel", selectedRank || '');

    if (selectedScope === '모의고사') {
      // 고3 모의고사: 모의고사 페이지로 바로 이동
      navigate('/class/mock-exam', { state: {
        title: '제 1회 고3 6월 모의고사 (2025)',
        isFreeTrial: true,
        gradeFlow: selectedGrade
      }});
      return;
    }

    // 고1/고2: 선생님 배정 (넘겨받은 선생님이 있으면 우선 사용, 없으면 자동 배정)
    let teacher = specificTeacher;
    if (!teacher) {
      const assignment = TEACHER_ASSIGNMENT[selectedRank];
      const teacherId = assignment?.defaultTeacherIds?.[selectedGrade];
      teacher = teacherId ? getTeacherById(teacherId) : null;
    }

    if (!teacher) {
      alert('선생님 배정 중 오류가 발생했습니다.');
      return;
    }

    localStorage.setItem("selectedMathTeacher", JSON.stringify(teacher));

    const startUnit = progressToNextUnit(selectedGrade, selectedScope);
    const startLevel = getStartLevel(selectedRank);
    const hasNumberedPrefix = /^\d{2}\./.test(startUnit);
    const unitOverride = hasNumberedPrefix ? startUnit : `${startUnit}/${startLevel}단계`;

    // subjectOverride 또는 selectedScope에서 elective 결정
    const electiveMap = {
      '수1': '수1', '수학1': '수학1', '수학(상)': '수학상',
      '수2': '수2', '수학2': '수2',
      '미적분': '미적분', '확률과통계': '확률과통계', '모의고사': '모의고사',
    };
    const electiveValue = electiveMap[subjectOverride] || electiveMap[selectedScope] || undefined;

    navigate('/class/math/' + teacher.id, { state: {
      teacher,
      isFreeTrial: true,
      freeTrialMinutes: flow?.freeTrialMinutes || 20,
      gradeFlow: selectedGrade,
      rank: selectedRank,
      scope: selectedScope,
      unitOverride: unitOverride,
      elective: electiveValue
    }});
  };

  // scope 리스트에 섹션 구분 헤더를 삽입
  const renderScopeList = () => {
    const options = flow?.progressOptions || [];
    console.log("📊 [DEBUG] GradeSelect Scope Render. Grade:", selectedGrade, "Options:", options);
    const items = [];

    options.forEach((scope, idx) => {
      // 고2: 수학2 섹션 헤더
      if (selectedGrade === '고2' && scope === '함수의 극한') {
        items.push(
          <div key="header-math2" style={{ padding: '0.6rem 1rem', color: '#60a5fa', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(96,165,250,0.2)', marginTop: '0.5rem' }}>
            📈 수학2 단원
          </div>
        );
      }
      // 고3: 미적분/확통 헤더
      if (selectedGrade === '고3' && scope === '[미적분] 수열의 극한') {
        items.push(
          <div key="header-calc" style={{ padding: '0.6rem 1rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(239,68,68,0.2)', marginTop: '0.5rem' }}>
            🔥 미적분 단원
          </div>
        );
      }
      if (selectedGrade === '고3' && scope === '[확통] 순열') {
        items.push(
          <div key="header-stat" style={{ padding: '0.6rem 1rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(245,158,11,0.2)', marginTop: '0.5rem' }}>
            🎲 확률과통계 단원
          </div>
        );
      }

      // 표시 이름 정리 (대괄호 prefix 제거)
      const displayName = scope.replace(/^\[(미적분|확통)\]\s*/, '');

      items.push(
        <button
          key={scope}
          onClick={() => handleScopeSelect(scope)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.9rem 1.2rem', borderRadius: '14px',
            background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 10px 30px rgba(99,102,241,0.1)', backdropFilter: 'blur(16px)',
            color: '#0f172a', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{displayName}</span>
          <ChevronRight size={20} color="#64748b" />
        </button>
      );
    });

    return items;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f1f5f9 0%, #eff6ff 50%, #f5f3ff 100%)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: '700px', animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            멘토스 AI 수학
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>나에게 맞는 학습 플랜을 설계합니다</p>
        </div>

        {/* Step 0: Manual */}
        {step === 'manual' && (
          <LessonManual onComplete={() => {
            localStorage.setItem('mentos_manual_seen', 'true');
            navigate('/login', { state: { from: { pathname: '/dashboard' } } });
          }} />
        )}

        {/* Step 1: Grade Selection */}
        {step === 'grade' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>학년을 선택하세요</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(GRADE_FLOWS).map(grade => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    padding: '1.5rem 2rem', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.7)', border: `1px solid ${GRADE_COLORS[grade]}30`,
                    boxShadow: '0 10px 30px rgba(99,102,241,0.1)', backdropFilter: 'blur(16px)',
                    color: '#0f172a', cursor: 'pointer', transition: 'all 0.3s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${GRADE_COLORS[grade]}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{GRADE_ICONS[grade]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{grade}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                      {grade === '고1' && '수학(상/하) · 내신 대비 · 20분 무료 체험'}
                      {grade === '고2' && '수1·수2 · 내신+수능 · 20분 무료 체험'}
                      {grade === '고3' && '모의고사 진단 → 취약 분석 → 보강 · 무료 진단 1회'}
                    </div>
                  </div>
                  <ChevronRight size={24} color={GRADE_COLORS[grade]} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Scope (진도/범위) */}
        {step === 'scope' && flow && (
          <div>
            <button onClick={() => setStep('grade')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem' }}>← 학년 다시 선택</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
              {selectedGrade === '고3' ? '학습할 단원을 선택하세요' : '학교에서 어디 단원까지 배웠습니까?'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {renderScopeList()}
            </div>
          </div>
        )}

        {/* Step 3: Rank (고1/고2) */}
        {step === 'rank' && flow && (
          <div>
            <button onClick={() => setStep('scope')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem' }}>← 범위 다시 선택</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>현재 등급을 선택하세요</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {flow.rankOptions.map(rank => {
                const assignment = TEACHER_ASSIGNMENT[rank];
                return (
                  <button
                    key={rank}
                    onClick={() => handleRankSelect(rank)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1.2rem 1.5rem', borderRadius: '16px',
                      background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,23,42,0.08)',
                      boxShadow: '0 10px 30px rgba(99,102,241,0.1)', backdropFilter: 'blur(16px)',
                      color: '#0f172a', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{RANK_ICONS[rank]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{rank}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        {assignment?.style} — {assignment?.description}
                      </div>
                    </div>
                    <ChevronRight size={20} color="#64748b" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation & Teacher Reveal */}
        {step === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => selectedGrade === '고3' ? setStep('grade') : setStep('rank')} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1rem' }}>← 이전으로</button>
            
            {selectedScope === '모의고사' ? (
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 10px 30px rgba(99,102,241,0.1)', backdropFilter: 'blur(16px)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{GRADE_ICONS[selectedGrade]}</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>모의고사 진단 평가</h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  최적의 선생님 배정을 위해<br/>현재 실력을 파악하는 <b>진단 평가</b>를 진행합니다.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
                  <span style={{ color: '#475569', fontWeight: 'bold' }}>무료 혜택</span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>모의고사 1회 + 취약분석 + 보강</span>
                </div>
                <button
                  onClick={handleStart}
                  style={{
                    width: '100%', padding: '1.2rem', borderRadius: '16px', border: 'none',
                    background: `linear-gradient(135deg, ${GRADE_COLORS[selectedGrade] || '#3b82f6'}, #f59e0b)`,
                    color: 'white', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer',
                    boxShadow: `0 8px 25px ${GRADE_COLORS[selectedGrade] || '#3b82f6'}40`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🚀 무료 진단 모의고사 시작
                </button>
              </div>
            ) : (() => {
              const mathTeachers = Object.values(HIGH_TEACHER_PROFILES).filter(t => t.subject === 'math' && t.targetGrades.includes(selectedGrade));
              const assignment = TEACHER_ASSIGNMENT[selectedRank];
              const recommendedId = assignment?.defaultTeacherIds?.[selectedGrade];
              const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

              return (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                    <h2 style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>멘토스 수학 1타 라인업</h2>
                    <p style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '1rem' }}>{selectedGrade} {selectedRank} 수준에 최적화된 AI 선생님을 확인하세요</p>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: isMobile ? '1rem' : '1.5rem', 
                    marginBottom: '3rem',
                    maxHeight: isMobile ? '60vh' : 'none',
                    overflowY: isMobile ? 'auto' : 'visible',
                    paddingRight: isMobile ? '4px' : '0'
                  }}>
                    {mathTeachers.map(teacher => {
                      const isRecommended = teacher.id === recommendedId;
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => handleStart(teacher)}
                          style={{
                            background: isRecommended ? 'linear-gradient(145deg, rgba(239,246,255,0.9), rgba(255,255,255,0.7))' : 'rgba(255,255,255,0.7)',
                            borderRadius: isMobile ? '16px' : '24px',
                            padding: isMobile ? '1rem' : '1.5rem',
                            border: isRecommended ? '2px solid #3b82f6' : '1px solid rgba(15,23,42,0.08)',
                            backdropFilter: 'blur(16px)',
                            cursor: 'pointer', transition: 'all 0.3s',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: isRecommended ? '0 10px 40px -10px rgba(59,130,246,0.4)' : '0 10px 30px rgba(99,102,241,0.1)',
                            display: 'flex', flexDirection: isMobile ? 'row' : 'column',
                            alignItems: 'center', textAlign: isMobile ? 'left' : 'center',
                            gap: isMobile ? '1rem' : '0'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                          }}
                        >
                          {isRecommended && (
                            <div style={{ position: 'absolute', top: isMobile ? '0.5rem' : '1rem', right: isMobile ? '0.5rem' : '1rem', background: '#3b82f6', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900' }}>
                              추천
                            </div>
                          )}
                          <img 
                            src={teacher.image} 
                            alt={teacher.name} 
                            style={{ 
                              width: isMobile ? '64px' : '120px', 
                              height: isMobile ? '64px' : '120px', 
                              borderRadius: '50%', 
                              border: isRecommended ? '3px solid #3b82f6' : '2px solid rgba(15,23,42,0.1)',
                              marginBottom: isMobile ? '0' : '1rem', 
                              objectFit: 'cover',
                              flexShrink: 0
                            }} 
                            onError={(e) => { e.target.src = '/icons/default-avatar.webp'; }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: isMobile ? '1rem' : '1.3rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.2rem' }}>{teacher.name} 선생님</h3>
                            <p style={{ color: isRecommended ? '#3b82f6' : '#64748b', fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold', marginBottom: isMobile ? '0.5rem' : '1rem' }}>{teacher.tagline}</p>
                            
                            {!isMobile && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                {teacher.features?.slice(0, 2).map((feat, idx) => (
                                  <span key={idx} style={{ background: 'rgba(15,23,42,0.05)', color: '#64748b', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>#{feat}</span>
                                ))}
                              </div>
                            )}

                            <div style={{ marginTop: isMobile ? '0' : 'auto', width: '100%' }}>
                              {!isMobile && (
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', borderTop: '1px solid rgba(15,23,42,0.08)', paddingTop: '1rem', textAlign: 'left' }}>
                                  <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '4px' }}>[{teacher.routeTitle}]</strong>
                                  <span style={{ fontSize: '0.8rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {teacher.routeDescription}
                                  </span>
                                </div>
                              )}
                              <button style={{
                                width: '100%', padding: isMobile ? '0.5rem' : '0.8rem', borderRadius: '12px', border: 'none',
                                background: isRecommended ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(99,102,241,0.1)',
                                color: isRecommended ? 'white' : '#4f46e5', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.95rem', pointerEvents: 'none'
                              }}>
                                수업 시작하기
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
