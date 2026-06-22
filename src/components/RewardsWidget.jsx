// 🎮 보상 위젯 — 레벨·XP 진행바 + 코인 + 코인→수강시간 교환.
import { useEffect, useState } from 'react';
import { Coins, Clock } from 'lucide-react';
import { getRewards, redeemForMinutes, COINS_PER_BLOCK, MINUTES_PER_BLOCK } from '@/lib/rewards';

export default function RewardsWidget() {
  const [r, setR] = useState(getRewards);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const refresh = () => setR(getRewards());
    const id = setInterval(refresh, 20000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const redeem = () => {
    const res = redeemForMinutes(1);
    setR(getRewards());
    setToast(res.ok ? `🎉 수강시간 +${res.redeemedMinutes}분 적립!` : res.reason);
    setTimeout(() => setToast(''), 2500);
  };

  const canRedeem = r.coins >= COINS_PER_BLOCK;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(124,58,237,0.10))',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
        padding: '0.95rem 1.1rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        {/* 레벨 + XP 바 */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff',
                fontWeight: 900, fontSize: '0.8rem', borderRadius: 8, padding: '0.15rem 0.55rem',
              }}
            >
              Lv.{r.level}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.xpIntoLevel} / {r.xpForNext} XP</span>
          </div>
          <div style={{ marginTop: 7, height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.2)', overflow: 'hidden' }}>
            <div style={{ width: `${r.pct}%`, height: '100%', background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', transition: 'width .5s' }} />
          </div>
        </div>

        {/* 코인 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#fbbf24' }}>
          <Coins size={20} /> {r.coins}
        </div>
      </div>

      {/* 코인 → 수강시간 교환 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#cbd5e1' }}>
          <Clock size={15} /> 보너스 수강시간 <b style={{ color: '#34d399' }}>{r.bonusMinutes}분</b>
        </div>
        <button
          type="button"
          onClick={redeem}
          disabled={!canRedeem}
          style={{
            marginLeft: 'auto',
            background: canRedeem ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(148,163,184,0.2)',
            color: '#fff', border: 'none', borderRadius: 11, padding: '0.5rem 0.9rem',
            fontWeight: 700, fontSize: '0.8rem', cursor: canRedeem ? 'pointer' : 'not-allowed',
          }}
        >
          코인 {COINS_PER_BLOCK} → 수강 {MINUTES_PER_BLOCK}분 교환
        </button>
      </div>
      {toast && <div style={{ fontSize: '0.76rem', color: '#34d399', marginTop: 6, textAlign: 'right' }}>{toast}</div>}
    </div>
  );
}
