import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Zap, Clock, Target, CheckCircle, AlertTriangle, 
  BarChart3, ChevronRight, MessageSquare, PlayCircle, Sparkles, 
  Gift, Award, Shield, Timer, HelpCircle, Layers, AwardIcon
} from 'lucide-react';

export default function LessonManual({ onComplete }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeGuide, setActiveGuide] = useState('none');

  const handleNext = () => {
    if (currentPage < 6) {
      setCurrentPage(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // 가상 UI 버튼 클릭 가이드 내용
  const GUIDE_INFOS = {
    none: {
      title: "💡 학습 화면 구성도를 직접 터치해보세요!",
      desc: "화면의 각 핵심 요소(타이머, AVS, 강의노트, 사이드바 등)를 클릭하면 자세한 설명이 여기에 표시됩니다."
    },
    timer: {
      title: "⏱️ 상단 실시간 타이머",
      desc: "수업 시간(120분)과 개별 문제 풀이 제한 시간을 실시간으로 측정하여 최상의 몰입감과 실전 감각을 길러줍니다."
    },
    avs: {
      title: "🔍 AI Vision Solution (AVS)",
      desc: "멘토스 독점 기술! 막힌 수학 수식과 기하 렌더링 그래프를 단계별로 분할하여 입체적으로 이해시켜주는 혁신 엔진입니다."
    },
    note: {
      title: "📝 프리미엄 AI 강의노트",
      desc: "수학 상/하 고난도 개념과 핵심 문제의 연계 개념 프레임을 도식화하여 완벽하게 머릿속에 정리해주는 개념 요약 카드입니다."
    },
    sidebar: {
      title: "💬 실시간 AI 멘토 사이드바",
      desc: "오른쪽에서 언제든 슬라이드인! 문제를 풀다 어려운 부분이 생기면 AI 튜터에게 1:1 대화하듯 실시간 밀착 질문을 던질 수 있습니다."
    },
    next: {
      title: "➡️ 실시간 채점 및 진행 버튼",
      desc: "정답을 입력하고 다음 버튼을 누르면 즉시 채점됩니다. 5문제마다 정밀 분석 엔진이 가동되어 취약점을 정밀 잰 뒤 맞춤 세트를 줍니다."
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'linear-gradient(135deg, #09090b, #0f172a, #1e1b4b)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', padding: '0.8rem', fontFamily: "'Pretendard', sans-serif"
    }}>
      <div style={{
        width: '100%', maxWidth: '530px', background: 'rgba(15, 23, 42, 0.45)',
        borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.4rem 1.6rem 1.2rem', backdropFilter: 'blur(25px)',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.85), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
        animation: 'slideUp 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        maxHeight: '94vh',
        overflowY: 'auto'
      }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '1.1rem' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: idx <= currentPage 
                ? 'linear-gradient(to right, #3f7fff, #6f5bff, #ff5c8a)' 
                : 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.4s ease'
            }} />
          ))}
        </div>

        {/* Page 1: Interactive UI Layout Guide */}
        {currentPage === 0 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #3f7fff, #6f5bff)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 1 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #8b9bff, #b9acff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                한눈에 보는 학습 화면 구성
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>멘토스 AI 수학의 완벽한 훈련 환경 구조도입니다.</p>
            </div>

            {/* Virtual Screen Box */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '0.6rem',
              marginBottom: '0.8rem',
              position: 'relative'
            }}>
              {/* Virtual Header */}
              <div 
                onClick={() => setActiveGuide('timer')}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '8px',
                  padding: '4px 8px', fontSize: '0.7rem', color: '#cbd5e1', cursor: 'pointer',
                  border: activeGuide === 'timer' ? '1px solid #3f7fff' : '1px solid transparent',
                  transition: 'all 0.2s', marginBottom: '6px'
                }}
              >
                <span>⏱️ 제한시간 01:23:45</span>
                <span style={{ color: '#6f5bff', fontWeight: 'bold' }}>⚡ 고차방정식 2단계</span>
              </div>

              {/* Middle Row: Content & Sidebar */}
              <div style={{ display: 'flex', gap: '6px', height: '110px' }}>
                {/* Main Problem Area */}
                <div style={{
                  flex: 3, background: 'rgba(255,255,255,0.01)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)', padding: '8px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                    <strong style={{ color: '#fff' }}>[Q.15]</strong> 다음 고차방정식 x⁴ - 3x² + 2 = 0의 모든 실근의 곱을 구하시오.
                  </div>
                  
                  {/* Action Buttons inside mock */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveGuide('avs'); }}
                      style={{
                        flex: 1, padding: '4px', fontSize: '0.62rem', fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #5b46ee, #e34d7d)', border: 'none',
                        color: 'white', borderRadius: '4px', cursor: 'pointer',
                        boxShadow: activeGuide === 'avs' ? '0 0 8px #e34d7d' : 'none'
                      }}
                    >
                      🔍 AVS 보기
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveGuide('note'); }}
                      style={{
                        flex: 1, padding: '4px', fontSize: '0.62rem', fontWeight: 'bold',
                        background: '#1e293b', border: '1px solid #475569',
                        color: '#8b9bff', borderRadius: '4px', cursor: 'pointer',
                        boxShadow: activeGuide === 'note' ? '0 0 8px #3f7fff' : 'none'
                      }}
                    >
                      📝 AI 강의노트
                    </button>
                  </div>
                </div>

                {/* Sidebar Area */}
                <div 
                  onClick={() => setActiveGuide('sidebar')}
                  style={{
                    flex: 1.2, background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px',
                    border: activeGuide === 'sidebar' ? '1px solid #6f5bff' : '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#b9acff', textAlign: 'center' }}>
                    💬 AI 멘토
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '4px',
                    padding: '3px', fontSize: '0.52rem', color: '#cbd5e1', lineHeight: '1.2'
                  }}>
                    실근은 인수분해를 통해...
                  </div>
                  <div style={{
                    background: '#6f5bff', color: 'white', borderRadius: '4px',
                    fontSize: '0.52rem', textAlign: 'center', padding: '2px', fontWeight: 'bold'
                  }}>
                    1:1 질문
                  </div>
                </div>
              </div>

              {/* Next step row */}
              <div 
                onClick={() => setActiveGuide('next')}
                style={{
                  marginTop: '6px', background: 'rgba(16, 185, 129, 0.1)',
                  border: activeGuide === 'next' ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px', padding: '5px 10px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '0.62rem', color: '#66bb6a' }}>✔️ 실시간 로컬 채점 연동 대기중</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#fff', background: '#059669', padding: '2px 8px', borderRadius: '4px' }}>
                  다음 ➡️
                </span>
              </div>
            </div>

            {/* Click Guide Result Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '0.8rem 1rem',
              minHeight: '80px',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#8b9bff', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#8b9bff" />
                {GUIDE_INFOS[activeGuide].title}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0, lineHeight: '1.45' }}>
                {GUIDE_INFOS[activeGuide].desc}
              </p>
            </div>
          </div>
        )}

        {/* Page 2: AVS (AI Vision Solution) */}
        {currentPage === 1 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #5b46ee, #e34d7d)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 2 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                AVS & 프리미엄 AI 강의노트
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>문제가 막힐 때, 가장 확실하게 원리를 뚫어냅니다.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <PlayCircle size={28} color="#a78bfa" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>시각적 단계별 풀이 (AVS)</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    수학 수식과 기하 렌더링 그래프를 모바일에 맞춤화된 세그먼트형 탭 분기로 볼 수 있어, 스크롤 락 없이 단번에 입체적인 접근법을 익힙니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Layers size={28} color="#f472b6" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>개념 프레임 연동 강의노트</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    단순한 오답 수식 해설이 아닙니다. 이 문제의 출제 의도가 담긴 근본 수학 개념과 암기 필수 공식을 visual 요약 카드로 상시 전개해 줍니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 3: Sidebar & Study Loop */}
        {currentPage === 2 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #10b981, #3f7fff)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 3 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #34d399, #8b9bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                AI 멘토 대화창 & 정답 입력 루프
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>언제든지 바로 옆에 상주하는 초밀착 AI 멘토링.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <MessageSquare size={28} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>우측 1:1 질문 사이드바</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    오른쪽 사이드바를 열어 AI 튜터와 대화하듯이 1:1 수학 개념 질문, 오답 분석 요령, 추가 유도 질문을 편하게 던질 수 있습니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Timer size={28} color="#8b9bff" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>실시간 타이머와 채점 진행</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    상단 타이머를 보며 실전처럼 답을 입력하고 [다음] 버튼을 누르세요. 멘토스 OS의 실시간 채점 엔진이 즉시 참/거짓 여부를 판별합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 4: Mock Exam System */}
        {currentPage === 3 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #ff5c8a, #6f5bff)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 4 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #f472b6, #b9acff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                모의고사 & 실시간 자동 채점
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>최신 수능/평가원 기출과 완벽히 동기화된 실전 테스트.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Target size={28} color="#f472b6" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>모의고사 마킹 및 자동 채점</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    실제 OMR 마킹 보드로 30문항을 모두 마킹하고 제출하면, 로컬 OMR 데이터와 대조해 즉시 오답 분석과 등급컷이 자동으로 매겨집니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Award size={28} color="#b9acff" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>수능 기출 데이터 매핑 완비</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    2025학년도, 2024학년도, 2023학년도 수능 및 6월/9월 평가원 기출의 공통+선택과목(미적분/확통) 전수 분석 및 AVS 해설이 수록되어 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 5: Weakness Analysis */}
        {currentPage === 4 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 5 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #fbbf24, #f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                취약 분석 및 맞춤 보강 클리닉
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>약점을 메워 성적의 누수를 원천 차단합니다.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <BarChart3 size={28} color="#fbbf24" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>5문제 주기 정밀 분석 엔진</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    문제를 푸는 즉시 배후 엔진이 오답의 수학적 개념 결손 유형을 찾아내며, TOP 3 취약 단원을 대시보드에 실시간 바인딩합니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <AlertTriangle size={28} color="#f87171" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>자동 발급 맞춤 보강 셋트</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    포착된 오답의 2배수 유사 변형 문항으로 구성된 개인 보강 홈워크 세트가 학생 대시보드로 즉시 자동 전송 및 발급됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 6: Attendance & Rewards */}
        {currentPage === 5 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #3f7fff, #10b981)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 6 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.5rem 0 0.3rem 0', background: 'linear-gradient(to right, #8b9bff, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                출석 보상(Streak) & 크레딧 성장
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>꾸준한 노력과 성취를 즉각적인 성장 점수로 환산합니다.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Zap size={28} color="#8b9bff" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>불꽃(🔥) 연속 출석일수 상승</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    실시간 캘린더에 수업 이력 날짜가 기록되면서, 연속 출석일수가 1일씩 늘어나는 불꽃 지수 보상이 대시보드 상단에 활성화됩니다.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Gift size={28} color="#34d399" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>XP 성장 퀘스트 및 크레딧 등급</h4>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    오답 복습, 추천 드릴 완수 등 일일 퀘스트 성공 시 50~100 XP 보상 점수를 적립하고, 이에 연동된 전체 수학 등급 성장을 성취해 나갑니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page 7: Final Step & Policy Links */}
        {currentPage === 6 && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
              <span style={{
                background: 'linear-gradient(90deg, #ff5c8a, #ef4444)',
                color: '#fff', fontSize: '0.72rem', fontWeight: 'bold',
                padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>가이드 7 / 7</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '900', margin: '0.4rem 0 0.2rem 0', background: 'linear-gradient(to right, #f472b6, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>
                멘토스 AI 수업 준비 완료!
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', margin: 0 }}>이제 나만의 AI 선생님을 만나 수업을 시작해볼까요?</p>
            </div>

            {/* Premium Guide Check List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '0.8rem 1rem',
              marginBottom: '0.6rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  <strong>⏱️ 매회 120분(2시간)</strong> 동안의 초밀착 1:1 맞춤 수업 진행
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  <strong>📊 2주마다</strong> 실력진단 테스트로 나의 실력 성장을 확인
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  <strong>📝 개념 강의노트</strong>와 연동된 핵심 수학 공식 시각 전개
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.76rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                  <strong>🔍 단계별 AVS 풀이</strong>를 시청하여 입체적인 원리 파악
                </span>
              </div>
            </div>

            {/* Premium Launch Event Glass Card */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '0.6rem 0.8rem',
              marginBottom: '0.6rem',
              textAlign: 'center'
            }}>
              <div style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '0.2rem' }}>
                <Sparkles size={14} color="#f87171" />
                선착순 1000명 한정 평생 소장 이벤트
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                선착순 1,000명 한정 <strong style={{ color: '#fff' }}>월 45,000원</strong>에 멘토스 수학의 AI 강의노트 & AVS 무제한 수강 혜택을 제공합니다. (이후 정가 월 89,000원)
              </p>
            </div>
          </div>
        )}

        {/* Buttons Section */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '0.6rem', position: 'relative', zIndex: 10002 }}>
          {currentPage > 0 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1, padding: '0.7rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 'bold',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              이전
            </button>
          )}

          <button
            onClick={handleNext}
            style={{
              flex: 2, padding: '0.7rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #2563eb, #5b46ee, #e34d7d)',
              color: 'white', fontSize: '0.9rem', fontWeight: '900', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
            }}
          >
            {currentPage === 6 ? '수업 시작하기' : '다음'}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 마지막 페이지용 가로 정렬 초소형 약관 링크 영역 */}
        {currentPage === 6 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '0.8rem',
            gap: '4px',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            <div>
              멘토스 AI는 <strong style={{ color: '#8b9bff' }}>KS BrainTech</strong>에서 투명하게 운영합니다.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link to="/terms" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}>
                이용약관
              </Link>
              <span>|</span>
              <Link to="/refund" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}>
                환불정책
              </Link>
              <span>|</span>
              <Link to="/privacy" target="_blank" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 'bold' }}>
                개인정보 취급방침
              </Link>
            </div>
          </div>
        )}

        {currentPage < 6 && (
          <button
            onClick={onComplete}
            style={{
              width: '100%', marginTop: '0.5rem', background: 'transparent', border: 'none',
              color: '#64748b', cursor: 'pointer', fontSize: '0.76rem', fontWeight: '600',
              textAlign: 'center'
            }}
          >
            매뉴얼 건너뛰기
          </button>
        )}
      </div>

      {/* Floating Small Footer */}
      <div style={{
        position: 'absolute',
        bottom: '0.8rem',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#475569',
        fontSize: '0.7rem',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        opacity: 0.55,
        pointerEvents: 'auto',
        zIndex: 10001
      }}>
        <span>© KS BrainTech</span>
        <span>|</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>이용약관</a>
        <span>|</span>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#475569', textDecoration: 'none' }}>개인정보방침</a>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
