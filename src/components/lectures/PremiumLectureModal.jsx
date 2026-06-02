import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronRight, Sparkles, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import PremiumLecturePlayer from './PremiumLecturePlayer';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { startPayappCheckout } from '@/services/payappCheckout';

// 실제 public/premium_lectures/ 디렉토리의 파일 기반 인덱스
const LECTURE_INDEX = {
  '수학(상)': [
    { id: '고차방정식', title: '고차방정식' },
    { id: '일차부등식', title: '일차부등식' },
    { id: '이차부등식', title: '이차부등식' },
    { id: '경우의수', title: '경우의 수' },
    { id: '행렬', title: '행렬' },
    { id: '점과좌표', title: '점과 좌표' },
    { id: '직선의방정식', title: '직선의 방정식' },
    { id: '원의방정식', title: '원의 방정식' },
    { id: '도형의이동', title: '도형의 이동' },
  ],
  '수학1 (대수)': [
    { id: '지수', title: '지수' },
    { id: '로그', title: '로그' },
    { id: '지수함수', title: '지수함수' },
    { id: '로그함수', title: '로그함수' },
    { id: '삼각함수성질', title: '삼각함수 성질' },
    { id: '삼각함수그래프', title: '삼각함수 그래프' },
    { id: '삼각함수의 활용', title: '삼각함수의 활용' },
    { id: '등차등비', title: '등차등비수열' },
    { id: '시그마용법', title: '시그마 용법' },
    { id: '수학적귀납법', title: '수학적 귀납법' },
  ],
  '수학2 (미적분 기초)': [
    { id: '함수의극한', title: '함수의 극한' },
    { id: '함수의연속', title: '함수의 연속' },
    { id: '미분계수', title: '미분계수와 도함수' },
    { id: '도함수의활용', title: '도함수의 활용' },
    { id: '부정적분과정적분', title: '부정적분과 정적분' },
    { id: '정적분의활용', title: '정적분의 활용' },
  ],
  '미적분': [
    { id: '미적분_수열의극한', title: '수열의 극한' },
    { id: '미적분_급수', title: '급수' },
    { id: '미적분_삼각함수극한', title: '삼각함수의 극한' },
    { id: '미적분_삼각함수공식', title: '삼각함수 공식' },
    { id: '미적분_미분법', title: '여러 가지 미분법' },
    { id: '미적분_도함수활용', title: '도함수의 활용' },
    { id: '미적분_적분법', title: '여러 가지 적분법' },
    { id: '미적분_정적분', title: '정적분' },
    { id: '미적분_정적분활용', title: '정적분의 활용' },
  ],
  '확률과 통계': [
    { id: '순열', title: '순열' },
    { id: '조합', title: '조합' },
    { id: '이항정리', title: '이항정리' },
    { id: '확률의 뜻', title: '확률의 뜻' },
    { id: '조건부확률', title: '조건부확률' },
    { id: '정규분포', title: '정규분포' },
    { id: '통계적 추정', title: '통계적 추정' },
  ],
};

// selectedUnit에서 강의 ID 자동 매칭
function guessLectureId(selectedUnit) {
  if (!selectedUnit) return null;
  const clean = selectedUnit.replace(/\s+/g, '').replace(/[234]단계/g, '').replace(/\[.*?\]/g, '');
  for (const cat of Object.values(LECTURE_INDEX)) {
    for (const lec of cat) {
      if (clean.includes(lec.id.replace(/\s+/g, '')) || lec.id.replace(/\s+/g, '').includes(clean)) return lec.id;
    }
  }
  return null;
}

export default function PremiumLectureModal({ onClose, selectedUnit, selectedCourse }) {
  const { user } = useAuth();
  const categories = LECTURE_INDEX;
  const autoLecture = guessLectureId(selectedUnit);
  const [selectedLecture, setSelectedLecture] = useState(autoLecture);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const loading = false;

  const isPaid = localStorage.getItem('mentos_is_paid') === 'true' || localStorage.getItem('mentos_premium') === 'true';

  const handlePayAppRedirect = async () => {
    try {
      if (!user?.id) {
        alert('로그인 후 결제할 수 있습니다.');
        return;
      }
      // 결제 결과 기록·프리미엄 승인은 Supabase edge function(feedbackurl)에서만 처리한다.
      await startPayappCheckout({ userId: user.id });
      onClose();
    } catch (err) {
      console.error('[PAYAPP_PAYMENT_ERROR]', err);
      alert(`결제창 호출에 실패했습니다: ${err.message}`);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🔒 비결제 사용자를 위한 프리미엄 페이월 화면 렌더링
  if (!isPaid) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 5, 8, 0.94)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(80px)', top: '20%', pointerEvents: 'none' }} />
        
        <div style={{
          background: 'rgba(15, 23, 42, 0.96)',
          width: '100%', maxWidth: '520px',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          color: 'white',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
          }}>
            <Lock size={32} color="#f87171" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>
            👑 프리미엄 AI 강의 락(Lock) 활성화됨
          </h2>
          
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            이 기능은 멘토스 AI 프리미엄 수강생 전용 특별 기능입니다.
            <br />
            대치동 1타 강사진의 핵심 개념 노하우 특강과
            <br />
            실시간 AVS 해설 시청 권한을 즉시 열어보세요.
          </p>

          <div style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,58,237,0.15))',
            border: '1px solid rgba(124,58,237,0.25)',
            padding: '1.2rem', borderRadius: '20px', marginBottom: '2rem', textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
              {IS_TEST_MODE ? '⚡ 100원 간편 검증 테스트 모드 동작 중' : '⚡ 선착순 1,000명 초특가 즉시 적용'}
            </span>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {IS_TEST_MODE ? '100 원' : '월 45,000원'}
            </span>
          </div>

          <button
            onClick={handlePayAppRedirect}
            style={{
              width: '100%', padding: '1.1rem', borderRadius: '16px', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
              color: 'white', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 8px 20px rgba(139,92,246,0.3)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CreditCard size={18} /> {IS_TEST_MODE ? '100원 테스트 결제창 열기' : '프리미엄 혜택 즉시 결제하기'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>PayApp 연동 자동 권한 부여 모듈 가동됨</span>
          </div>
        </div>
      </div>
    );
  }

  // Mobile: show either lecture list or player (not both)
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#ffffff', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLecture ? (
          // Mobile Player View
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PremiumLecturePlayer 
              lectureId={selectedLecture} 
              onClose={() => setSelectedLecture(null)} 
            />
          </div>
        ) : (
          // Mobile Lecture List View
          <>
            <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} />
                <span style={{ fontWeight: '900', fontSize: '1.1rem' }}>AI PREMIUM</span>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px 14px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}>닫기</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
              {Object.entries(categories).map(([category, lectures]) => (
                <div key={category} style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
                    {category}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {lectures.map(lec => (
                      <button
                        key={lec.id}
                        onClick={() => setSelectedLecture(lec.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'left',
                          borderRadius: '10px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          background: '#f8fafc',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BookOpen size={16} style={{ opacity: 0.7 }} />
                          {lec.title}
                        </div>
                        <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Desktop: original two-panel layout
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#ffffff', borderRadius: '24px', width: '96%', maxWidth: '1400px', height: '90vh', display: 'flex', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        {/* 좌측 사이드바: 단원 선택 */}
        <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span style={{ fontWeight: '900', fontSize: '1.2rem', tracking: '-0.025em' }}>AI PREMIUM</span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '500' }}>고퀄리티 개념 완성 특강</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: 0 }}>
            {loading ? (
              <div className="p-4 text-slate-400 text-sm">목록을 불러오는 중...</div>
            ) : (
              Object.entries(categories).map(([category, lectures]) => (
                <div key={category} style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                    {category}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {lectures.map(lec => (
                      <button
                        key={lec.id}
                        onClick={() => setSelectedLecture(lec.id)}
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'left',
                          borderRadius: '12px',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          background: selectedLecture === lec.id ? '#eff6ff' : 'transparent',
                          color: selectedLecture === lec.id ? '#2563eb' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen size={16} style={{ opacity: 0.7 }} />
                          {lec.title}
                        </div>
                        {selectedLecture === lec.id && <ChevronRight size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <button 
              onClick={onClose}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#f1f5f9', color: '#64748b', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              className="hover:bg-slate-200"
            >
              닫기
            </button>
          </div>
        </div>

        {/* 우측 메인: 강의 플레이어 */}
        <div style={{ flex: 1, position: 'relative', background: '#ffffff' }}>
          {selectedLecture ? (
            <PremiumLecturePlayer 
              lectureId={selectedLecture} 
              onClose={() => setSelectedLecture(null)} 
            />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BookOpen size={40} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>학습할 단원을 선택해주세요</h2>
              <p style={{ color: '#64748b', maxWidth: '300px', lineHeight: '1.6' }}>좌측 메뉴에서 프리미엄 AI 강의를 시청할 단원을 골라보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

