import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle, TrendingUp, Target, Search } from 'lucide-react';
import { HIGH_TEACHER_PROFILES } from '@/data/hTeacherProfiles';
import '@/pages/Diagnosis.css';

const GRADE_OPTIONS = [
  { id: '고1', label: '고등학교 1학년', icon: <BookOpen size={24} /> },
  { id: '고2', label: '고등학교 2학년', icon: <TrendingUp size={24} /> },
  { id: '고3', label: '고등학교 3학년 (N수)', icon: <Target size={24} /> }
];

const RANK_OPTIONS = [
  { id: '1~2등급', label: '1~2등급 (상위권)', desc: '어려운 문제도 자신 있어요.' },
  { id: '2~3등급', label: '2~3등급 (중상위권)', desc: '개념은 아는데 응용이 안 돼요.' },
  { id: '4~5등급', label: '4~5등급 이하 (기초)', desc: '기초부터 차근차근 하고 싶어요.' }
];

const SCOPE_OPTIONS = {
  '고1': [
    { id: '이차방정식과 이차함수', label: '이차함수까지 쳤어요', nextUnit: '고차방정식' },
    { id: '여러가지 방정식', label: '고차방정식까지 쳤어요', nextUnit: '일차부등식' },
    { id: '일차부등식', label: '일차부등식까지 쳤어요', nextUnit: '이차부등식' },
    { id: '이차부등식', label: '이차부등식까지 쳤어요', nextUnit: '경우의수' },
    { id: '경우의수', label: '경우의 수까지 쳤어요', nextUnit: '행렬' },
    { id: '행렬', label: '행렬까지 쳤어요', nextUnit: '점과좌표' },
    { id: '점과좌표', label: '점과 좌표까지 쳤어요', nextUnit: '직선의방정식' },
    { id: '직선의방정식', label: '직선의 방정식까지 쳤어요', nextUnit: '원의방정식' },
    { id: '원의방정식', label: '원의 방정식까지 쳤어요', nextUnit: '도형의이동' }
  ],
  '고2': [
    { id: '삼각함수', label: '삼각함수 기본까지 쳤어요', nextUnit: '삼각함수의 그래프' },
    { id: '삼각함수의 그래프', label: '삼각함수 그래프까지 쳤어요', nextUnit: '삼각함수의 활용' }
  ]
};

const HIGH3_STATE_OPTIONS = [
  { id: '수열의 극한', label: '① 수열의 극한/급수 중심', nextUnit: '2)급수2', rankFallback: '3~4등급' },
  { id: '미분법', label: '② 여러가지 미분법 중심', nextUnit: '5)여러가지미분법2', rankFallback: '2~3등급' },
  { id: '적분법', label: '③ 도함수 활용 및 적분법 중심', nextUnit: '7)여러가지적분', rankFallback: '1~2등급' }
];

export default function Diagnosis() {
  const navigate = useNavigate();
  const location = useLocation();

  const preSelectedTeacher = location.state?.preSelectedTeacher || null;

  // 선생님이 이미 선택되어 넘어온 경우, 선생님의 대상 학년과 추천 등급을 가져오고 단계는 바로 3(진도 선택)으로 건너뜁니다!
  const defaultGrade = preSelectedTeacher?.targetGrades?.[0] || null;
  const defaultRank = preSelectedTeacher?.targetRanks?.[0] || null;

  const [step, setStep] = useState(preSelectedTeacher ? 3 : 1);

  const [selectedGrade, setSelectedGrade] = useState(defaultGrade);
  const [selectedRank, setSelectedRank] = useState(defaultRank);
  const [selectedScope, setSelectedScope] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const processDiagnosis = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // 1. 단원 & 실제 반영 등급 결정
      let targetUnit = "";
      let finalRank = selectedRank;

      if (selectedGrade === '고3') {
        const h3Opt = HIGH3_STATE_OPTIONS.find(o => o.id === selectedScope) || HIGH3_STATE_OPTIONS[0];
        targetUnit = h3Opt.nextUnit;
      } else {
        const scopeOpt = SCOPE_OPTIONS[selectedGrade].find(o => o.id === selectedScope);
        targetUnit = scopeOpt.nextUnit;
      }

      // 2. 단계(Level) 결정: 1단계는 없음. 1~2등급은 3단계, 나머지는 모두 2단계부터 시작.
      let startPhaseIndex = 2; // 기본 2단계
      if (finalRank.startsWith('1')) {
        startPhaseIndex = 3; // 최상위권
      }

      // 3. 선생님 배정 (이미 고른 선생님이 있으면 유지, 아니면 새 클래스 배정)
      let assignedTeacher = preSelectedTeacher;
      
      if (!assignedTeacher) {
        const mathTeachers = Object.values(HIGH_TEACHER_PROFILES).filter(t => t.subject === 'math' && t.targetGrades.includes(selectedGrade));
        const targetRankNum = finalRank.charAt(0);
        assignedTeacher = mathTeachers.find(t => t.targetRanks.some(r => r.includes(targetRankNum))) || mathTeachers[0];
      }

      console.log("[Diagnosis Complete]", {
        grade: selectedGrade, rank: finalRank, unit: targetUnit, level: startPhaseIndex, teacher: assignedTeacher?.name
      });

      // 4. 교실 진입! Parameter 전달
      navigate('/class/math/' + assignedTeacher.id, {
        state: {
          subject: 'math',
          teacher: assignedTeacher,
          v2Mode: true,
          unitOverride: targetUnit,
          phaseIndexOverride: startPhaseIndex
        }
      });
    }, 1500); // 인공지능 분석 연출 딜레이
  };

  return (
    <div className="diagnosis-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)' }}>
      {isProcessing ? (
        <div style={{ textAlign: 'center', color: 'white' }} className="animate-fade-in">
          <div style={{ marginBottom: '2rem' }}>
            <Search size={64} className="pulse" color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>AI가 최적의 커리큘럼을 분석 중입니다...</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>학년, 등급, 진도 현황을 통해 1타 강사와 시작 단원을 매칭합니다.</p>
        </div>
      ) : (
        <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2.5rem', borderRadius: '24px', position: 'relative' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>
               {preSelectedTeacher ? (
                 <>
                  {preSelectedTeacher.name} 선생님 클래스 입장을 위한<br/><span style={{ color: '#3b82f6' }}>현재 진도 확인</span>
                 </>
               ) : (
                 <>
                  5월 중간고사 직후<br/><span style={{ color: '#3b82f6' }}>맞춤형 수학 진단</span>
                 </>
               )}
            </h1>
            {!preSelectedTeacher && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: step >= i ? '#3b82f6' : '#334155', transition: 'background-color 0.3s' }} />
                ))}
              </div>
            )}
          </div>

          {/* STEP 1: 학년 선택 */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h3 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>Q1. 현재 학년이 어떻게 되나요?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {GRADE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedGrade(opt.id); setStep(2); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem', background: selectedGrade === opt.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                      border: selectedGrade === opt.id ? '2px solid #3b82f6' : '2px solid #334155', borderRadius: '16px', color: 'white', fontSize: '1.1rem', fontWeight: 'bold',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    className="hover-scale"
                  >
                    <div style={{ color: selectedGrade === opt.id ? '#60a5fa' : '#94a3b8' }}>{opt.icon}</div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: 등급 선택 */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h3 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>Q2. 현재 수학 체감 등급은 어느 정도인가요?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {RANK_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedRank(opt.id); setStep(3); }}
                    style={{
                      display: 'flex', flexDirection: 'column', padding: '1.2rem 1.5rem', background: selectedRank === opt.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                      border: selectedRank === opt.id ? '2px solid #3b82f6' : '2px solid #334155', borderRadius: '16px', color: 'white',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    className="hover-scale"
                  >
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>{opt.label}</div>
                    <div style={{ color: selectedRank === opt.id ? '#93c5fd' : '#94a3b8', fontSize: '0.9rem' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(1)} 
                style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
                이전으로 돌아가기
              </button>
            </div>
          )}

          {/* STEP 3: 진도/학습상태 선택 */}
          {step === 3 && (
            <div className="animate-slide-up">
              {selectedGrade === '고3' ? (
                <h3 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>Q3. 현재 어떤 중심의 공부를 하고 있나요?</h3>
              ) : (
                <h3 style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '1.5rem' }}>Q3. 1학기 중간고사를 어디까지 치셨나요? (다음 단원부터 시작)</h3>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(selectedGrade === '고3' ? HIGH3_STATE_OPTIONS : SCOPE_OPTIONS[selectedGrade]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSelectedScope(opt.id); }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', background: selectedScope === opt.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                      border: selectedScope === opt.id ? '2px solid #3b82f6' : '2px solid #334155', borderRadius: '16px', color: 'white', fontSize: '1.1rem', fontWeight: 'bold',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                    }}
                    className="hover-scale"
                  >
                    {opt.label}
                    {selectedScope === opt.id && <CheckCircle color="#3b82f6" />}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                {!preSelectedTeacher ? (
                  <button 
                    onClick={() => setStep(2)} 
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
                    이전으로
                  </button>
                ) : <div />}
                <button 
                  onClick={processDiagnosis}
                  disabled={!selectedScope}
                  style={{
                    background: selectedScope ? '#2563eb' : '#334155',
                    color: selectedScope ? 'white' : '#94a3b8',
                    border: 'none', padding: '0.8rem 2rem', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem',
                    cursor: selectedScope ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  수업 바로 시작하기 <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

