import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Sparkles, PartyPopper, Star, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import PaymentCheckoutModal from './PaymentCheckoutModal';
import {
  getAccessState, syncPaidFlag, claimSlot, getEventCount, submitReview,
  formatSlot, FREE_DAYS, REVIEW_DAY, MAX_SLOTS,
} from '@/lib/freeEvent';

// 선착순 100명 "한 달 무료" 이벤트 게이트 + 7일차 리뷰 게이트 + 30일 페이월.
// (기존 20분 체험 타이머를 대체)
export default function FreeTrialBanner() {
  const navigate = useNavigate();
  const [access, setAccess] = useState(null);          // { state, slotNo, daysLeft, ... }
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const refresh = useCallback(() => {
    const a = getAccessState();
    syncPaidFlag(a.state);
    setAccess(a);
  }, []);

  useEffect(() => {
    refresh();
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    const onFocus = () => refresh();
    window.addEventListener('resize', onResize);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  if (!access) return null;
  if (access.state === 'paid') return null;

  if (access.state === 'not_joined') {
    return <JoinEventOverlay isMobile={isMobile} navigate={navigate} onJoined={refresh} />;
  }
  if (access.state === 'review_required') {
    return <ReviewGateOverlay slotNo={access.slotNo} onDone={refresh} />;
  }
  if (access.state === 'expired') {
    return <ExpiredPaywallOverlay slotNo={access.slotNo} navigate={navigate} />;
  }
  // free_active
  return <FreeActiveBanner slotNo={access.slotNo} daysLeft={access.daysLeft} isMobile={isMobile} onReview={refresh} />;
}

// ─────────────────────────────────────────────────────────────────────────
// 공통 오버레이 셸
function OverlayShell({ children, accent = 'rgba(124, 58, 237, 0.15)' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(9, 9, 11, 0.92)',
      zIndex: 150000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(24px)', padding: '1rem'
    }}>
      <div style={{ position: 'absolute', width: '350px', height: '350px', background: accent, filter: 'blur(100px)', top: '12%', pointerEvents: 'none' }} />
      <div style={{
        position: 'relative', background: 'rgba(15, 23, 42, 0.96)', width: '100%', maxWidth: '520px',
        borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.5rem',
        textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.12)',
        maxHeight: '92vh', overflowY: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)',
  color: 'white', fontSize: '0.9rem', boxSizing: 'border-box'
};

// ─────────────────────────────────────────────────────────────────────────
// 1) 합류 모달 — 무료 슬롯 발급 → 축하(00N번)
function JoinEventOverlay({ isMobile, navigate, onJoined }) {
  const [count, setCount] = useState(null);        // { claimed, remaining, ok }
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);       // { slotNo } | { soldOut } | { error }

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('mentos_mock_user') || '{}');
      if (u?.name) setName(u.name);
      if (u?.email) setEmail(u.email);
    } catch { /* noop */ }
    getEventCount().then(setCount);
  }, []);

  const join = async () => {
    if (!name.trim()) { alert('이름을 입력해 주세요.'); return; }
    setLoading(true);
    try {
      // 입력 정보를 mock_user 로도 저장 (앱 전역에서 이름 사용)
      const u = { id: 'user_' + Date.now(), name: name.trim(), email: email.trim(), role: 'student' };
      localStorage.setItem('mentos_mock_user', JSON.stringify(u));

      const r = await claimSlot({ name: name.trim(), email: email.trim() });
      if (r.soldOut) {
        setResult({ soldOut: true });
      } else {
        setResult({ slotNo: r.slotNo });
      }
    } finally {
      setLoading(false);
    }
  };

  // 축하 화면
  if (result?.slotNo) {
    return (
      <OverlayShell accent="rgba(34, 197, 94, 0.18)">
        <div style={{
          width: '84px', height: '84px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(124,58,237,0.2))',
          border: '1px solid rgba(34,197,94,0.35)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 1.4rem', animation: 'fbBounce 2s infinite'
        }}>
          <PartyPopper size={40} color="#4ade80" />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#a7f3d0', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '0.4rem' }}>
          🎉 무료이벤트 고객
        </div>
        <div style={{
          fontSize: '3.4rem', fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #4ade80, #60a5fa, #c084fc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.6rem'
        }}>
          {formatSlot(result.slotNo)}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.6rem' }}>
          축하합니다! 🎊
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          선착순 <b style={{ color: '#e2e8f0' }}>{MAX_SLOTS}명</b> 한정 <b style={{ color: '#4ade80' }}>한 달 무료</b> 이벤트에 합류하셨습니다.<br />
          지금부터 <b style={{ color: '#e2e8f0' }}>{FREE_DAYS}일간</b> 모든 수업을 무료로 이용하세요!
        </p>
        <button onClick={onJoined} style={primaryBtn}>
          무료로 수업 시작하기 <ArrowRight size={18} />
        </button>
        <FbKeyframes />
      </OverlayShell>
    );
  }

  // 마감 화면
  if (result?.soldOut) {
    return (
      <OverlayShell accent="rgba(239, 68, 68, 0.15)">
        <div style={badgeCircle('rgba(239,68,68,0.15)', 'rgba(245,158,11,0.3)')}>
          <Lock size={36} color="#f59e0b" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.6rem' }}>
          선착순 {MAX_SLOTS}명 마감되었습니다
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          무료 이벤트 정원이 모두 찼습니다.<br />
          프리미엄 멤버십으로 매쓰멘토스 AI 과외를 계속 이용하실 수 있습니다.
        </p>
        <button onClick={() => navigate('/login')} style={primaryBtn}>
          <CreditCard size={18} /> 멤버십 보러가기
        </button>
        <ReturnLinks navigate={navigate} />
      </OverlayShell>
    );
  }

  // 합류 입력 화면
  const remaining = count?.ok ? count.remaining : null;
  return (
    <OverlayShell>
      <div style={badgeCircle('rgba(124,58,237,0.15)', 'rgba(124,58,237,0.35)')}>
        <Gift size={36} color="#c084fc" />
      </div>
      <div style={{ fontSize: '0.8rem', color: '#f472b6', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.4rem' }}>
        🎉 선착순 {MAX_SLOTS}명 한정 오픈이벤트
      </div>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
        한 달 무료로 시작하세요
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
        지금 합류하면 <b style={{ color: '#4ade80' }}>{FREE_DAYS}일간 전 과목 무료</b>.<br />
        AI 1:1 과외 · 사고력 AVS 해설 · 무제한 문제.
      </p>

      {remaining !== null && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto 1.4rem',
          background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '999px', padding: '0.5rem 1.1rem'
        }}>
          <Sparkles size={15} color="#c084fc" />
          <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 'bold' }}>
            남은 무료 자리 <b style={{ color: '#4ade80' }}>{remaining}</b> / {MAX_SLOTS}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '1.2rem' }}>
        <input style={inputStyle} type="text" placeholder="이름 (예: 홍길동)" value={name} onChange={e => setName(e.target.value)} />
        <input style={inputStyle} type="email" placeholder="이메일 (선택)" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <button onClick={join} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
        {loading ? '합류 중...' : <>무료 이벤트 합류하기 <ArrowRight size={18} /></>}
      </button>

      <div style={{ marginTop: '0.9rem', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
        ※ 무료 {REVIEW_DAY}일 이용 후에는 솔직한 후기를 남겨주셔야 계속 이용할 수 있어요.
      </div>
      <ReturnLinks navigate={navigate} />
    </OverlayShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 2) 7일차 리뷰 게이트 — 별점 + 후기 작성해야 잠금 해제
function ReviewGateOverlay({ slotNo, onDone }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating < 1) { alert('별점을 선택해 주세요.'); return; }
    if (text.trim().length < 5) { alert('후기를 5자 이상 작성해 주세요.'); return; }
    setLoading(true);
    try {
      const r = await submitReview({ rating, text: text.trim() });
      if (!r.ok) {
        alert('제출에 실패했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
      onDone();
    } finally {
      setLoading(false);
    }
  };

  return (
    <OverlayShell accent="rgba(245, 158, 11, 0.16)">
      <div style={badgeCircle('rgba(245,158,11,0.15)', 'rgba(245,158,11,0.35)')}>
        <Star size={34} color="#fbbf24" fill="#fbbf24" />
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem' }}>
        일주일 잘 사용하셨나요? ✍️
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.6rem' }}>
        무료이벤트 고객 <b style={{ color: '#c084fc' }}>{formatSlot(slotNo)}</b>님,<br />
        솔직한 후기를 남겨주시면 남은 무료기간 동안 계속 이용하실 수 있어요.
      </p>

      {/* 별점 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '1.2rem' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button"
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
            <Star size={36}
              color={(hover || rating) >= n ? '#fbbf24' : '#475569'}
              fill={(hover || rating) >= n ? '#fbbf24' : 'none'} />
          </button>
        ))}
      </div>

      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={4}
        placeholder="어떤 점이 좋았는지, 아쉬웠는지 자유롭게 적어주세요. (최소 5자)"
        style={{ ...inputStyle, resize: 'vertical', minHeight: '96px', marginBottom: '1.2rem' }}
      />

      <button onClick={submit} disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1 }}>
        {loading ? '제출 중...' : <><CheckCircle2 size={18} /> 후기 남기고 계속 이용하기</>}
      </button>
      <div style={{ marginTop: '0.9rem', fontSize: '0.72rem', color: '#64748b' }}>
        ※ 후기를 작성해야 수업을 이어서 진행할 수 있습니다.
      </div>
      <FbKeyframes />
    </OverlayShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 3) 30일 만료 페이월
function ExpiredPaywallOverlay({ slotNo, navigate }) {
  const [showCheckout, setShowCheckout] = useState(false);
  return (
    <OverlayShell accent="rgba(239, 68, 68, 0.15)">
      <div style={{ ...badgeCircle('rgba(239,68,68,0.15)', 'rgba(245,158,11,0.3)'), animation: 'fbBounce 2s infinite' }}>
        <Lock size={36} color="#f59e0b" />
      </div>
      <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
        한 달 무료 이용이 종료되었습니다
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.6rem' }}>
        무료이벤트 고객 <b style={{ color: '#c084fc' }}>{formatSlot(slotNo)}</b>님,<br />
        그동안 매쓰멘토스와 함께해 주셔서 감사합니다.<br />
        프리미엄 멤버십으로 AI 1:1 과외를 계속 이용해 보세요.
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '0.9rem 1.2rem', borderRadius: '14px', marginBottom: '1.4rem' }}>
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '0.72rem', color: '#f472b6', fontWeight: 'bold', display: 'block' }}>얼리버드 특가</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#c084fc' }}>월 49,000원</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>선착순 1,000명<br />이후 정가 89,000원</span>
      </div>

      <button onClick={() => setShowCheckout(true)} style={primaryBtn}>
        <CreditCard size={18} /> 프리미엄 멤버십 시작하기
      </button>
      <ReturnLinks navigate={navigate} />
      {showCheckout && <PaymentCheckoutModal plan="early" onClose={() => setShowCheckout(false)} />}
      <FbKeyframes />
    </OverlayShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 4) 무료 이용중 — 떠있는 배너 (고객번호 + D-day)
function FreeActiveBanner({ slotNo, daysLeft, isMobile }) {
  const urgent = daysLeft <= 3;
  return (
    <div style={{
      position: isMobile ? 'static' : 'fixed',
      top: isMobile ? 'auto' : '70px', right: isMobile ? 'auto' : '20px',
      width: isMobile ? '100%' : 'auto', margin: isMobile ? '0.5rem 0 1rem 0' : '0',
      background: urgent ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.85)',
      border: '1px solid rgba(255,255,255,0.1)', color: 'white',
      padding: '0.55rem 1.2rem', borderRadius: isMobile ? '16px' : '30px',
      fontWeight: 'bold', zIndex: 9999, display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)', fontSize: '0.85rem', boxSizing: 'border-box'
    }}>
      <Gift size={16} color={urgent ? 'white' : '#c084fc'} />
      <span style={{ color: urgent ? 'white' : '#94a3b8' }}>
        무료이벤트 고객 <b style={{ color: urgent ? 'white' : '#e2e8f0' }}>{formatSlot(slotNo)}</b>
      </span>
      <span style={{
        fontFamily: 'monospace', fontSize: '0.9rem', letterSpacing: '0.5px',
        padding: '0.15rem 0.6rem', borderRadius: '999px',
        background: urgent ? 'rgba(0,0,0,0.2)' : 'rgba(74,222,128,0.15)',
        color: urgent ? 'white' : '#4ade80'
      }}>
        무료 D-{daysLeft}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// 공통 작은 조각들
const primaryBtn = {
  width: '100%', padding: '1.05rem', borderRadius: '14px', border: 'none',
  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)', color: 'white',
  fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
};

function badgeCircle(bg, border) {
  return {
    width: '80px', height: '80px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${bg}, rgba(124,58,237,0.12))`,
    border: `1px solid ${border}`, display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 1.4rem'
  };
}

function ReturnLinks({ navigate }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.4rem' }}>
      <button onClick={() => navigate('/grade-select')} style={linkBtn}>처음으로</button>
      <span style={{ color: '#334155' }}>|</span>
      <button onClick={() => navigate('/')} style={linkBtn}>대시보드</button>
    </div>
  );
}
const linkBtn = { background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' };

function FbKeyframes() {
  return (
    <style>{`
      @keyframes fbBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    `}</style>
  );
}
