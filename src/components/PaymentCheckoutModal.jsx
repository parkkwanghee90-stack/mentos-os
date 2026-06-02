import React, { useState } from 'react';
import { X, CreditCard, Gift, ShieldCheck, HelpCircle, ChevronDown, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { startPayappCheckout } from '@/services/payappCheckout';

export default function PaymentCheckoutModal({ onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRefundDetail, setShowRefundDetail] = useState(false);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5, 5, 8, 0.85)',
      zIndex: 200000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(16px)', padding: '1rem'
    }}>
      {/* Background Glow Orbs */}
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.15)', filter: 'blur(80px)', top: '10%', left: '15%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(236, 72, 153, 0.12)', filter: 'blur(80px)', bottom: '15%', right: '15%', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        width: '100%', maxWidth: '480px',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '2.2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        color: 'white',
        position: 'relative',
        animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)', border: 'none',
            color: '#94a3b8', cursor: 'pointer', padding: '0.5rem',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(236,72,153,0.1))',
            border: '1px solid rgba(236,72,153,0.3)',
            padding: '0.4rem 1rem', borderRadius: '30px',
            marginBottom: '1rem', animation: 'pulse 2s infinite'
          }}>
            <Gift size={15} color="#ec4899" />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f472b6', letterSpacing: '-0.3px' }}>선착순 1,000명 런칭 초특가 이벤트</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
            Mentos AI 프리미엄
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            나에게 딱 맞추어 성적을 급상승시키는 초개인화 과외
          </p>
        </div>

        {/* Course Core Specifications */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '1.2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Clock size={18} color="#60a5fa" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' }}>주 2회, 회당 2시간 완성제 수업</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>개념프레임 분석부터 취약단원 보강까지 120분간 완벽 케어</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <BookOpen size={18} color="#c084fc" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' }}>AI 매칭 선생님 & AVS 풀이 엔진</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>나에게 최적화된 선생님 지정 및 무제한 오답 클리닉 학습</div>
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(124,58,237,0.15))',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '24px',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>테스트 결제 진행</span>
            <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: '900', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: '4px' }}>간편 검증</span>
          </div>

          <div style={{ fontSize: '2.2rem', fontWeight: '900', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            1,000원
          </div>

          <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 'bold', marginTop: '4px' }}>
            * 결제 완료 후 PayApp 통보가 확인되면 프리미엄이 자동 승인됩니다.
          </div>
        </div>

        {/* Refund Policy Accordion (Korean e-commerce law compliant) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setShowRefundDetail(!showRefundDetail)}
            style={{
              width: '100%', background: 'none', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem', padding: '0.2rem 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="#f59e0b" />
              <span>이용안내 및 환불 규정 동의</span>
            </div>
            <ChevronDown size={16} style={{ transform: showRefundDetail ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {showRefundDetail && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '0.8rem',
              marginTop: '0.5rem',
              maxHeight: '110px',
              overflowY: 'auto',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: '1.5',
              textAlign: 'left'
            }}>
              <strong>[멘토스 AI 평생 소장 및 환불안내]</strong>
              <br />
              1. <strong>전액 환불</strong>: 결제일로부터 7일 이내 학습 이력이 전혀 없는 경우 즉시 전액 환불됩니다.
              <br />
              2. <strong>부분 환불</strong>: 결제 후 수강이 개시(학습 화면 진입 및 문제 조회 등)된 경우에는 전자상거래 소비자 보호법 및 학원의 설립·운영 및 과외교습에 관한 법률 등 관계 법령에 따라 사용한 일수를 일할 계산하여 차감한 잔액을 반환합니다.
              <br />
              3. <strong>주의 사항</strong>: 무단 공유, 다중 접속, 부정 이용 행위 적발 시 환불 규정 예외 처리 및 계정이 강제 해지될 수 있습니다.
            </div>
          )}
        </div>

        {/* Payment Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%', padding: '1.2rem', borderRadius: '18px', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
            color: 'white', fontSize: '1.15rem', fontWeight: '900', cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <CreditCard size={20} />
          {loading ? '결제창 여는 중...' : '프리미엄 혜택 즉시 결제하기'}
        </button>
 
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>PayApp 안전 결제 보안 규정 적용됨</span>
        </div>
      </div>

      <style>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}
