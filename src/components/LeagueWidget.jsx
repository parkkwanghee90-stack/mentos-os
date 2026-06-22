// 🏅 성장 리그 위젯 — 주간 성장폭(XP 증가) 기반 티어 + 다음 티어 진행 + 지난주 대비.
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getLeague } from '@/lib/league';

export default function LeagueWidget() {
  const [l, setL] = useState(getLeague);

  useEffect(() => {
    const refresh = () => setL(getLeague());
    const id = setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const diff = l.growth - l.lastGrowth;

  return (
    <div
      style={{
        background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.22)',
        borderRadius: 18, padding: '1rem 1.1rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
        <b style={{ color: '#f8fafc', fontSize: '0.98rem' }}>🏅 이번 주 성장 리그</b>
        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>점수가 아닌 <b style={{ color: '#c4b5fd' }}>성장폭</b>으로 겨뤄요</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
        {/* 현재 티어 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '2rem' }}>{l.tier.emoji}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: l.tier.color }}>{l.tier.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>이번 주 +{l.growth} XP 성장</div>
          </div>
        </div>

        {/* 지난주 대비 */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 700, color: diff >= 0 ? '#34d399' : '#f87171' }}>
          {diff >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          지난주 대비 {diff >= 0 ? '+' : ''}{diff}
        </div>
      </div>

      {/* 다음 티어 진행 */}
      {l.next ? (
        <div style={{ marginTop: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>
            <span>다음: {l.next.emoji} {l.next.name}</span>
            <span>{l.toNext} XP 더 성장하면 승급!</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
            <div style={{ width: `${l.pct}%`, height: '100%', background: 'linear-gradient(90deg,#a78bfa,#22d3ee)', transition: 'width .5s' }} />
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '0.7rem', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 700 }}>🏆 최고 티어! 이번 주 최고의 성장러예요</div>
      )}

      {/* 티어 사다리 */}
      <div style={{ display: 'flex', gap: 6, marginTop: '0.8rem', justifyContent: 'space-between' }}>
        {l.tiers.map((t, i) => (
          <div
            key={t.name}
            style={{
              flex: 1, textAlign: 'center', padding: '0.3rem 0', borderRadius: 8,
              background: i === l.tierIdx ? 'rgba(168,85,247,0.25)' : 'transparent',
              border: i === l.tierIdx ? '1px solid rgba(168,85,247,0.5)' : '1px solid transparent',
              opacity: i <= l.tierIdx ? 1 : 0.4,
            }}
          >
            <div style={{ fontSize: '1rem' }}>{t.emoji}</div>
            <div style={{ fontSize: '0.6rem', color: '#cbd5e1' }}>{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
