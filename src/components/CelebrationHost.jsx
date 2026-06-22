// 🎉 축하 호스트 — 'mentos:celebrate' 이벤트 수신 → 컨페티 모달 + 효과음. 앱 전역 1개 마운트.
import { useEffect, useState, useRef } from 'react';
import { playChime } from '@/lib/celebrate';

const COLORS = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a78bfa', '#fbbf24'];

export default function CelebrationHost() {
  const [item, setItem] = useState(null);
  const queueRef = useRef([]);
  const busyRef = useRef(false);

  useEffect(() => {
    const showNext = () => {
      if (busyRef.current) return;
      const next = queueRef.current.shift();
      if (!next) return;
      busyRef.current = true;
      setItem(next);
      playChime();
      setTimeout(() => {
        setItem(null);
        busyRef.current = false;
        showNext();
      }, 2600);
    };
    const onCelebrate = (e) => {
      queueRef.current.push(e.detail || {});
      showNext();
    };
    window.addEventListener('mentos:celebrate', onCelebrate);
    return () => window.removeEventListener('mentos:celebrate', onCelebrate);
  }, []);

  if (!item) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(9,9,11,0.55)', backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}
    >
      {/* 컨페티 */}
      {Array.from({ length: 28 }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.08;
        const color = COLORS[i % COLORS.length];
        return (
          <span
            key={i}
            style={{
              position: 'absolute', top: '-5%', left: `${left}%`,
              width: 9, height: 14, background: color, borderRadius: 2,
              animation: `mentosConfetti 1.8s ${delay}s ease-in forwards`,
              opacity: 0.95,
            }}
          />
        );
      })}

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.97), rgba(15,23,42,0.97))',
          border: '1px solid rgba(167,139,250,0.4)', borderRadius: 28,
          padding: '2rem 2.4rem', textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          animation: 'mentosPop 0.4s cubic-bezier(.2,1.3,.4,1) both',
        }}
      >
        <div style={{ fontSize: '3.4rem', lineHeight: 1 }}>{item.emoji || '🎉'}</div>
        <h2 style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem', margin: '0.8rem 0 0.3rem', letterSpacing: '-0.5px' }}>
          {item.title || '축하합니다!'}
        </h2>
        {item.subtitle && <p style={{ color: '#c4b5fd', fontSize: '0.9rem', margin: 0 }}>{item.subtitle}</p>}
      </div>

      <style>{`
        @keyframes mentosConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0.9; }
        }
        @keyframes mentosPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
