import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [step, setStep] = useState(() => {
    return localStorage.getItem('mentos_manual_seen') === 'true' ? 'grade' : 'manual';
  }); // manual → grade → scope → rank → confirm
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [selectedRank, setSelectedRank] = useState(null);

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

    navigate('/class/math/' + teacher.id, { state: {
      teacher,
      isFreeTrial: true,
      freeTrialMinutes: flow?.freeTrialMinutes || 20,
      gradeFlow: selectedGrade,
      rank: selectedRank,
      scope: selectedScope,
      unitOverride: unitOverride,
      elective: selectedScope === '수1' ? '수1' : selectedScope === '수2' ? '수2' : undefined
    }});
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: '700px', animation: 'fadeIn 0.5s ease' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            멘토스 AI 수학
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>나에게 맞는 학습 플랜을 설계합니다</p>
        </div>

        {/* Step 0: Manual */}
        {step === 'manual' && (
          <LessonManual onComplete={() => {
            localStorage.setItem('mentos_manual_seen', 'true');
            navigate('/login');
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
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${GRADE_COLORS[grade]}30`,
                    color: 'white', cursor: 'pointer', transition: 'all 0.3s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${GRADE_COLORS[grade]}15`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '2.5rem' }}>{GRADE_ICONS[grade]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{grade}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
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
              {selectedGrade === '고3' ? '시험 범위를 선택하세요' : '학교에서 어디 단원까지 배웠습니까?'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
              {flow.progressOptions?.map(scope => (
                <button
                  key={scope}
                  onClick={() => handleScopeSelect(scope)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.2rem 1.5rem', borderRadius: '16px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{scope}</span>
                  <ChevronRight size={20} color="#64748b" />
                </button>
              ))}
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
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <div style={{ fontSize: '1.5rem' }}>{RANK_ICONS[rank]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{rank}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
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
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{GRADE_ICONS[selectedGrade]}</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>모의고사 진단 평가</h2>
                <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  최적의 선생님 배정을 위해<br/>현재 실력을 파악하는 <b>진단 평가</b>를 진행합니다.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>무료 혜택</span>
                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>모의고사 1회 + 취약분석 + 보강</span>
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

              return (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>멘토스 수학 1타 라인업</h2>
                    <p style={{ color: '#94a3b8' }}>{selectedGrade} {selectedRank} 수준에 최적화된 AI 선생님을 확인하세요</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {mathTeachers.map(teacher => {
                      const isRecommended = teacher.id === recommendedId;
                      return (
                        <div
                          key={teacher.id}
                          onClick={() => handleStart(teacher)}
                          style={{
                            background: isRecommended ? 'linear-gradient(145deg, #1e293b, #0f172a)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '24px', padding: '1.5rem',
                            border: isRecommended ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', transition: 'all 0.3s',
                            position: 'relative', overflow: 'hidden',
                            boxShadow: isRecommended ? '0 10px 40px -10px rgba(59,130,246,0.4)' : 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-8px)';
                            if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            if (!isRecommended) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          }}
                        >
                          {isRecommended && (
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '900' }}>
                              추천 선생님
                            </div>
                          )}
                          <img 
                            src={teacher.image} 
                            alt={teacher.name} 
                            style={{ width: '120px', height: '120px', borderRadius: '50%', border: isRecommended ? '4px solid #3b82f6' : '2px solid rgba(255,255,255,0.1)', marginBottom: '1rem', objectFit: 'cover' }} 
                            onError={(e) => { e.target.src = '/icons/default-avatar.webp'; }}
                          />
                          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'white', marginBottom: '0.3rem' }}>{teacher.name} 선생님</h3>
                          <p style={{ color: isRecommended ? '#93c5fd' : '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>{teacher.tagline}</p>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            {teacher.features?.slice(0, 2).map((feat, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>#{feat}</span>
                            ))}
                          </div>

                          <div style={{ marginTop: 'auto', width: '100%' }}>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', textAlign: 'left' }}>
                              <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>[{teacher.routeTitle}]</strong>
                              <span style={{ fontSize: '0.8rem', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {teacher.routeDescription}
                              </span>
                            </div>
                            <button style={{ 
                              width: '100%', padding: '0.8rem', borderRadius: '12px', border: 'none', 
                              background: isRecommended ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.1)',
                              color: 'white', fontWeight: 'bold', fontSize: '0.95rem', pointerEvents: 'none'
                            }}>
                              수업 시작하기
                            </button>
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
