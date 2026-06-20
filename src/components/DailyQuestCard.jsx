// 🎯 데일리 퀘스트 카드 — 오늘의 목표 + 진행바 + 코인 받기.
import { useEffect, useState } from 'react';
import { Gift, Coins } from 'lucide-react';
import { getTodayQuests, claimQuest } from '@/lib/dailyQuests';

export default function DailyQuestCard() {
  const [quests, setQuests] = useState(getTodayQuests);

  useEffect(() => {
    const refresh = () => setQuests(getTodayQuests());
    const id = setInterval(refresh, 20000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const claim = (qid) => {
    claimQuest(qid);
    setQuests(getTodayQuests());
  };

  const claimable = quests.filter((q) => q.done && !q.claimed).length;

  return (
    <div
      style={{
        background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.22)',
        borderRadius: 18, padding: '1rem 1.1rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.8rem' }}>
        <Gift size={18} color="#60a5fa" />
        <b style={{ color: '#f8fafc', fontSize: '0.98rem' }}>오늘의 퀘스트</b>
        {claimable > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 800, color: '#0b1220', background: '#fbbf24', borderRadius: 999, padding: '0.1rem 0.5rem' }}>
            받을 보상 {claimable}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {quests.map((q) => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: q.claimed ? '#64748b' : '#e2e8f0', textDecoration: q.claimed ? 'line-through' : 'none' }}>
                  {q.title}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{q.progress}/{q.target}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
                <div style={{ width: `${q.pct}%`, height: '100%', background: q.done ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#3b82f6,#60a5fa)', transition: 'width .5s' }} />
              </div>
            </div>
            {q.claimed ? (
              <span style={{ fontSize: '0.74rem', color: '#34d399', fontWeight: 700, minWidth: 54, textAlign: 'center' }}>완료 ✓</span>
            ) : (
              <button
                type="button"
                onClick={() => claim(q.id)}
                disabled={!q.done}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3, minWidth: 54, justifyContent: 'center',
                  background: q.done ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(148,163,184,0.18)',
                  color: '#fff', border: 'none', borderRadius: 9, padding: '0.4rem 0.5rem',
                  fontWeight: 800, fontSize: '0.74rem', cursor: q.done ? 'pointer' : 'not-allowed',
                }}
              >
                <Coins size={12} /> {q.reward}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
