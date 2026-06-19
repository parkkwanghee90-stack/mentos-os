/**
 * NaesinPaywall.jsx — 내신 완벽대비 풀코스 결제 게이트 (고1/고2 공용)
 *
 * 가격 정책: 원가 50,000원 → 선착순 100명 한정 특가 19,900원 → 100명 마감 후 50,000원.
 * 선착순 카운트는 freeEvent.js(Supabase RPC free_event_count) 재사용.
 * "지금 시작하기" → PaymentCheckoutModal(plan=naesin_event|naesin_regular) 결제.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle } from 'lucide-react';
import PaymentCheckoutModal from '@/components/PaymentCheckoutModal';
import { getEventCount, getFreeEventRecord, formatSlot, MAX_SLOTS } from '@/lib/freeEvent';

const wrap = { minHeight: '100vh', background: '#0b0b12', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.2rem' };
const card = { background: 'rgba(20,20,30,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '2rem 1.6rem', width: '100%', maxWidth: 480, textAlign: 'center' };
const btnPrimary = { width: '100%', padding: '1rem', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer' };
const btnGhost = { width: '100%', padding: '0.8rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer' };

export default function NaesinPaywall({ title = '기말 내신 완벽대비 풀코스', subtitle = '단원별 문제 + 자동채점 + AVS 칠판해설 + 복습' }) {
  const navigate = useNavigate();
  const [cnt, setCnt] = useState(null);     // { claimed, remaining, ok }
  const [showPay, setShowPay] = useState(false);

  useEffect(() => {
    let alive = true;
    getEventCount().then(c => { if (alive) setCnt(c); });
    return () => { alive = false; };
  }, []);

  const claimed = cnt?.ok ? cnt.claimed : null;
  const soldOut = claimed != null && claimed >= MAX_SLOTS;
  const remaining = claimed != null ? Math.max(0, MAX_SLOTS - claimed) : null;
  const plan = soldOut ? 'naesin_regular' : 'naesin_event';
  const priceText = soldOut ? '50,000원' : '19,900원';

  const rec = getFreeEventRecord();
  const slotNo = rec?.slotNo || null;

  const preset = {
    badge: soldOut ? '정규 가격' : `🎉 선착순 ${MAX_SLOTS}명 한정 특가`,
    title,
    subtitle,
    originalText: '50,000원',
    discountText: soldOut ? '정가' : '60% 특가',
    priceText,
    noteText: soldOut
      ? '* 선착순 100명 마감 — 정가 50,000원입니다.'
      : `* 선착순 ${MAX_SLOTS}명 한정가 19,900원 · 마감 후 정가 50,000원으로 인상`,
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <Lock size={40} color="#a78bfa" style={{ margin: '0 auto 1rem' }} />

        {slotNo && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(124,58,237,0.18)', border: '1px solid rgba(168,139,250,0.35)', color: '#c4b5fd', borderRadius: 999, padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.9rem' }}>
            <Sparkles size={14} /> 특별이벤트 당첨자 {formatSlot(slotNo)}님
          </div>
        )}

        <h2 style={{ fontWeight: 900, fontSize: '1.4rem', margin: 0 }}>{title}</h2>
        <p style={{ color: '#94a3b8', margin: '0.8rem 0 1.2rem', lineHeight: 1.6 }}>{subtitle}</p>

        <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: '1rem', marginBottom: '1.2rem' }}>
          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>50,000원</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginTop: 2 }}>{priceText}</div>
          {!soldOut && remaining != null && (
            <div style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 800, marginTop: 4 }}>
              선착순 {MAX_SLOTS}명 한정 · 남은 자리 {remaining}명
            </div>
          )}
          {soldOut && (
            <div style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 800, marginTop: 4 }}>선착순 100명 마감 — 정가 적용</div>
          )}
        </div>

        <button style={btnPrimary} onClick={() => setShowPay(true)}>지금 시작하기 · {priceText} 결제</button>
        <button style={{ ...btnGhost, marginTop: 10 }} onClick={() => navigate('/dashboard')}>대시보드로</button>
      </div>

      {showPay && (
        <PaymentCheckoutModal plan={plan} preset={preset} onClose={() => setShowPay(false)} />
      )}
    </div>
  );
}
