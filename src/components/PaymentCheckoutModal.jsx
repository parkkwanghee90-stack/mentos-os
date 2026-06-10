import React, { useState, useEffect } from 'react';
import { X, CreditCard, Gift, ShieldCheck, HelpCircle, ChevronDown, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMembershipStatus } from '@/services/membershipService';

const PLAN_LABELS = {
  earlybird: '얼리버드 멤버십 · 월 45,000원',
  early: '프리미엄 강의 · 49,000원',
  regular: '정규 멤버십 · 월 89,000원',
  m6: '6개월 이용권 · 373,800원',
  y1: '1년 이용권 · 640,800원',
  lifetime: '평생 이용권 · 1,800,000원',
};

// plan별 표시 가격(서버 PLAN_PRICES와 일치). 공유 모달이 plan/tier에 맞는 가격을 보이도록.
const PLAN_DISPLAY = {
  earlybird: { price: 45000,   original: 89000, monthly: true,  note: '선착순 1,000명 한정 · 이후 정가 월 89,000원' },
  early:     { price: 49000,   original: null,  monthly: true,  note: '프리미엄 강의 이용권' },
  regular:   { price: 89000,   original: null,  monthly: true,  note: '월 정기 멤버십' },
  m6:        { price: 373800,  original: null,  monthly: false, note: '6개월 약정 이용권' },
  y1:        { price: 640800,  original: null,  monthly: false, note: '1년 약정 이용권' },
  lifetime:  { price: 1800000, original: null,  monthly: false, note: '평생 소장 이용권' },
};

// 서버가 가입 순번으로 가격을 정하는 멤버십 plan(클라이언트 선택 무시)
const MEMBERSHIP_PLANS = ['regular', 'earlybird'];

// plan: earlybird | early | regular | m6 | y1 | lifetime
export default function PaymentCheckoutModal({ onClose, plan = 'regular' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showRefundDetail, setShowRefundDetail] = useState(false);
  const [phone, setPhone] = useState(() => localStorage.getItem('mentos_parent_phone') || '');

  const CREATE_URL = import.meta.env.VITE_PAYAPP_CREATE_URL
    || 'https://trvqgqvwhqvlgqzlsxbu.supabase.co/functions/v1/payapp-create';

  // 테스트 결제 표시 토글(가격 문구 전용). 미설정 시 false → 실제 가격 표시.
  // 실제 결제 금액은 서버가 plan 기준으로 결정하므로 표시값과 어긋나지 않도록 기본 false 유지.
  const IS_TEST_MODE = import.meta.env.VITE_PAYAPP_TEST_MODE === 'true';

  // ── 멤버십은 서버가 가입 순번으로 가격을 정함 → 표시 가격도 서버 tier로 맞춘다 ──
  const isMembership = MEMBERSHIP_PLANS.includes(plan);
  const [tierInfo, setTierInfo] = useState(null); // { ordinal, tier, price }
  useEffect(() => {
    let alive = true;
    if (isMembership && user) {
      getMembershipStatus()
        .then((s) => { if (alive) setTierInfo(s); })
        .catch(() => { /* 실패 시 earlybird 폴백 표시(서버가 최종 결정) */ });
    }
    return () => { alive = false; };
  }, [isMembership, user]);

  // 표시할 plan: 멤버십이면 서버 tier(regular는 정가, 그 외는 earlybird 선착순가), 아니면 전달된 plan.
  const displayPlanKey = isMembership
    ? (tierInfo?.tier === 'regular' ? 'regular' : 'earlybird')
    : plan;
  const display = PLAN_DISPLAY[displayPlanKey] || PLAN_DISPLAY.regular;
  const priceText = `${display.monthly ? '월 ' : ''}${Number(display.price).toLocaleString()}원`;
  const discountPct = display.original ? Math.round((1 - display.price / display.original) * 100) : 0;

  const handlePayment = async () => {
    if (!user?.id) {
      alert('로그인 후 결제할 수 있습니다.');
      onClose?.();
      navigate('/login');
      return;
    }
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (!/^01\d{8,9}$/.test(cleanPhone)) {
      alert('결제 안내를 받을 휴대폰 번호를 정확히 입력해 주세요.');
      return;
    }
    localStorage.setItem('mentos_parent_phone', cleanPhone);
    setLoading(true);
    try {
      const orderId = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      const res = await fetch(CREATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, phone: cleanPhone, orderId, plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.payurl) throw new Error(data.error || '결제 요청에 실패했습니다.');
      // PayApp 결제 페이지로 이동 (결제완료 시 feedback 웹훅이 프리미엄 활성화)
      window.location.href = data.payurl;
    } catch (err) {
      console.error('[PAYAPP_CREATE_ERROR]', err);
      alert(`결제창 호출 실패: ${err.message}`);
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
            {!IS_TEST_MODE && display.original && (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                {`${display.monthly ? '월 ' : ''}${Number(display.original).toLocaleString()}원`}
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: '900', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
              {IS_TEST_MODE ? '간편 검증' : (discountPct > 0 ? `${discountPct}% 할인` : '프리미엄')}
            </span>
          </div>

          <div style={{ fontSize: '2.2rem', fontWeight: '900', background: 'linear-gradient(to right, #60a5fa, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            {IS_TEST_MODE ? '100원' : priceText}
          </div>

          <div style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 'bold', marginTop: '4px' }}>
            {IS_TEST_MODE
              ? '* 100원 결제 완료 즉시 프리미엄 승인 자동 흐름이 실행됩니다.'
              : `* ${display.note}`}
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

        {/* 선택 요금제 + 휴대폰 입력 */}
        <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '14px', padding: '0.9rem 1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700, marginBottom: '4px' }}>선택한 요금제</div>
          <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, marginBottom: '0.8rem' }}>{PLAN_LABELS[plan] || PLAN_LABELS.regular}</div>
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="결제 안내받을 휴대폰 번호 (예: 01012345678)"
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
          />
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
