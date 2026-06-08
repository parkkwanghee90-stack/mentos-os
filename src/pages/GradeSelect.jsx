import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GRADE_FLOWS, TEACHER_ASSIGNMENT, initTrial, progressToNextUnit, getStartLevel } from '@/engine/gradeFlowSSOT';
import { getTeacherById } from '@/data/teacherProfiles';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import { ChevronRight, GraduationCap, Target, Zap, BookOpen, Star, Award } from 'lucide-react';
import LessonManual from '@/components/LessonManual';
import { useAuth } from '@/context/AuthContext';

// 홈(.home-v4) 디자인 토큰 미러 — src/styles/home.css 와 동일 값 (다크 네이비 + 바이올렛)
const T = {
  title: '#ffffff',                    // --on-dark-title
  body: '#aeb6df',                     // --on-dark
  soft: '#7a82ad',                     // --on-dark-soft
  surface: 'rgba(20, 26, 68, 0.55)',   // --surface-2 글래스
  surfaceHover: 'rgba(34, 42, 96, 0.78)',
  line: 'rgba(255, 255, 255, 0.08)',   // --surface-line
  violet: '#6f5bff',                   // --violet
  violet600: '#5b46ee',                // --violet-600
  violetSoft: 'rgba(111, 91, 255, 0.14)',
  blue: '#3f7fff',                     // --blue
  cyan: '#43c7ff',                     // --cyan
  gold: '#f5b301',                     // --gold
  cardShadow: '0 18px 50px -22px rgba(0, 0, 0, 0.6)', // --shadow-card
};

const GRADE_ICONS = { '고1': '🎓', '고2': '📐', '고3': '🚀' };
const GRADE_COLORS = { '고1': '#3f7fff', '고2': '#6f5bff', '고3': '#ff5c8a' };
const RANK_ICONS = { '4~5등급': '📖', '3등급': '⚡', '1~2등급': '🔥' };

export default function GradeSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
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
          <div key="header-math2" style={{ padding: '0.6rem 1rem', color: '#7aa2ff', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(63,127,255,0.28)', marginTop: '0.5rem' }}>
            📈 수학2 단원
          </div>
        );
      }
      // 고3: 미적분/확통 헤더
      if (selectedGrade === '고3' && scope === '[미적분] 수열의 극한') {
        items.push(
          <div key="header-calc" style={{ padding: '0.6rem 1rem', color: '#ff8aa6', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(255,92,138,0.28)', marginTop: '0.5rem' }}>
            🔥 미적분 단원
          </div>
        );
      }
      if (selectedGrade === '고3' && scope === '[확통] 순열') {
        items.push(
          <div key="header-stat" style={{ padding: '0.6rem 1rem', color: '#ffd27a', fontSize: '0.85rem', fontWeight: '900', borderBottom: '1px solid rgba(245,179,1,0.28)', marginTop: '0.5rem' }}>
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
            background: T.surface, border: `1px solid ${T.line}`,
            boxShadow: T.cardShadow, backdropFilter: 'blur(14px)',
            color: T.title, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.violetSoft; e.currentTarget.style.borderColor = 'rgba(111,91,255,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.line; }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{displayName}</span>
          <ChevronRight size={20} color={T.soft} />
        </button>
      );
    });

    return items;
  };

  return (
    <div className="home-v4" style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(900px 480px at 80% 0%, rgba(63,127,255,0.16), transparent 60%), radial-gradient(820px 460px at 12% 100%, rgba(111,91,255,0.18), transparent 60%), linear-gradient(180deg, #0b1030 0%, #070a1c 100%)',
      color: T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0'
    }}>
      {/* 배경 글로우 (히어로 톤) */}
      <div aria-hidden style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(111,91,255,0.35)', filter: 'blur(70px)', opacity: 0.55, top: -90, right: '12%', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(63,127,255,0.3)', filter: 'blur(70px)', opacity: 0.5, top: '38%', left: '4%', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '90%', maxWidth: '700px', animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(90deg, #8b9bff, #43c7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            멘토스 AI 수학
          </h1>
          <p style={{ color: T.soft, marginTop: '0.5rem' }}>나에게 맞는 학습 플랜을 설계합니다</p>
        </div>

        {/* Step 0: Manual */}
        {step === 'manual' && (
          <LessonManual onComplete={() => {
            localStorage.setItem('mentos_manual_seen', 'true');
            // 이미 로그인(또는 슈퍼패스)된 경우 재로그인 요구하지 않고 학년 선택으로 이어감
            const loggedIn = !!user || localStorage.getItem('mentos_super_pass') === 'true';
            if (loggedIn) {
              setStep('grade');
            } else {
              navigate('/login', { state: { from: { pathname: '/dashboard' } } });
            }
          }} />
        )}

        {/* Step 1: Grade Selection */}
        {step === 'grade' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: T.title }}>학년을 선택하세요</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.keys(GRADE_FLOWS).map(grade => (
                <button
                  key={grade}
                  onClick={() => handleGradeSelect(grade)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    padding: '1.5rem 2rem', borderRadius: '20px',
                    background: T.surface, border: `1px solid ${GRADE_COLORS[grade]}55`,
                    boxShadow: T.cardShadow, backdropFilter: 'blur(14px)',
                    color: T.title, cursor: 'pointer', transition: 'all 0.3s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${GRADE_COLORS[grade]}22`; e.currentTarget.style.borderColor = `${GRADE_COLORS[grade]}aa`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = `${GRADE_COLORS[grade]}55`; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{GRADE_ICONS[grade]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: T.title }}>{grade}</div>
                    <div style={{ fontSize: '0.85rem', color: T.soft, marginTop: '4px' }}>
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
            <button onClick={() => setStep('grade')} style={{ background: 'transparent', border: 'none', color: T.soft, cursor: 'pointer', marginBottom: '1rem' }}>← 학년 다시 선택</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: T.title }}>
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
            <button onClick={() => setStep('scope')} style={{ background: 'transparent', border: 'none', color: T.soft, cursor: 'pointer', marginBottom: '1rem' }}>← 범위 다시 선택</button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: T.title }}>현재 등급을 선택하세요</h2>
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
                      background: T.surface, border: `1px solid ${T.line}`,
                      boxShadow: T.cardShadow, backdropFilter: 'blur(14px)',
                      color: T.title, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.violetSoft; e.currentTarget.style.borderColor = 'rgba(111,91,255,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.borderColor = T.line; }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{RANK_ICONS[rank]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: T.title }}>{rank}</div>
                      <div style={{ fontSize: '0.8rem', color: T.soft, marginTop: '2px' }}>
                        {assignment?.style} — {assignment?.description}
                      </div>
                    </div>
                    <ChevronRight size={20} color={T.soft} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Confirmation & Teacher Reveal */}
        {step === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => selectedGrade === '고3' ? setStep('grade') : setStep('rank')} style={{ background: 'transparent', border: 'none', color: T.soft, cursor: 'pointer', marginBottom: '1rem' }}>← 이전으로</button>

            {selectedScope === '모의고사' ? (
              <div style={{ background: T.surface, borderRadius: '24px', padding: '2rem', border: `1px solid ${T.line}`, boxShadow: T.cardShadow, backdropFilter: 'blur(14px)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{GRADE_ICONS[selectedGrade]}</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem', color: T.title }}>모의고사 진단 평가</h2>
                <p style={{ color: T.body, marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  최적의 선생님 배정을 위해<br/>현재 실력을 파악하는 <b style={{ color: T.title }}>진단 평가</b>를 진행합니다.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.5rem' }}>
                  <span style={{ color: T.body, fontWeight: 'bold' }}>무료 혜택</span>
                  <span style={{ fontWeight: 'bold', color: '#34d399' }}>모의고사 1회 + 취약분석 + 보강</span>
                </div>
                <button
                  onClick={handleStart}
                  style={{
                    width: '100%', padding: '1.2rem', borderRadius: '16px', border: 'none',
                    background: `linear-gradient(135deg, ${GRADE_COLORS[selectedGrade] || T.blue}, ${T.gold})`,
                    color: 'white', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer',
                    boxShadow: `0 12px 28px -10px ${GRADE_COLORS[selectedGrade] || T.blue}aa`,
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
                    <h2 style={{ fontSize: isMobile ? '1.3rem' : '2rem', fontWeight: '900', color: T.title, marginBottom: '0.5rem' }}>멘토스 수학 1타 라인업</h2>
                    <p style={{ color: T.soft, fontSize: isMobile ? '0.8rem' : '1rem' }}>{selectedGrade} {selectedRank} 수준에 최적화된 AI 선생님을 확인하세요</p>
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
                            background: isRecommended ? 'linear-gradient(145deg, rgba(111,91,255,0.2), rgba(20,26,68,0.6))' : T.surface,
                            borderRadius: isMobile ? '16px' : '24px',
                            padding: isMobile ? '1rem' : '1.5rem',
                            border: isRecommended ? `2px solid ${T.violet}` : `1px solid ${T.line}`,
                            backdropFilter: 'blur(14px)',
                            cursor: 'pointer', transition: 'all 0.3s',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: isRecommended ? '0 10px 40px -10px rgba(111,91,255,0.5)' : T.cardShadow,
                            display: 'flex', flexDirection: isMobile ? 'row' : 'column',
                            alignItems: 'center', textAlign: isMobile ? 'left' : 'center',
                            gap: isMobile ? '1rem' : '0'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            if (!isRecommended) e.currentTarget.style.background = T.surfaceHover;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            if (!isRecommended) e.currentTarget.style.background = T.surface;
                          }}
                        >
                          {isRecommended && (
                            <div style={{ position: 'absolute', top: isMobile ? '0.5rem' : '1rem', right: isMobile ? '0.5rem' : '1rem', background: T.violet, color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900' }}>
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
                              border: isRecommended ? `3px solid ${T.violet}` : '2px solid rgba(255,255,255,0.12)',
                              marginBottom: isMobile ? '0' : '1rem',
                              objectFit: 'cover',
                              flexShrink: 0
                            }}
                            onError={(e) => { e.target.src = '/icons/default-avatar.webp'; }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: isMobile ? '1rem' : '1.3rem', fontWeight: '900', color: T.title, marginBottom: '0.2rem' }}>{teacher.name} 선생님</h3>
                            <p style={{ color: isRecommended ? '#b9acff' : T.soft, fontSize: isMobile ? '0.75rem' : '0.85rem', fontWeight: 'bold', marginBottom: isMobile ? '0.5rem' : '1rem' }}>{teacher.tagline}</p>

                            {!isMobile && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                {teacher.features?.slice(0, 2).map((feat, idx) => (
                                  <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', color: T.body, padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>#{feat}</span>
                                ))}
                              </div>
                            )}

                            <div style={{ marginTop: isMobile ? '0' : 'auto', width: '100%' }}>
                              {!isMobile && (
                                <div style={{ fontSize: '0.85rem', color: T.soft, marginBottom: '1rem', borderTop: `1px solid ${T.line}`, paddingTop: '1rem', textAlign: 'left' }}>
                                  <strong style={{ color: '#8b9bff', display: 'block', marginBottom: '4px' }}>[{teacher.routeTitle}]</strong>
                                  <span style={{ fontSize: '0.8rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {teacher.routeDescription}
                                  </span>
                                </div>
                              )}
                              <button style={{
                                width: '100%', padding: isMobile ? '0.5rem' : '0.8rem', borderRadius: '12px', border: 'none',
                                background: isRecommended ? `linear-gradient(135deg, ${T.violet}, ${T.violet600})` : T.violetSoft,
                                color: isRecommended ? 'white' : '#b9acff', fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.95rem', pointerEvents: 'none'
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
