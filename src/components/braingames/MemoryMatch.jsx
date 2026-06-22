// 🧠 카드 짝맞추기 — 뒤집어 같은 그림 짝 찾기(작업기억). 6쌍·12장.
import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const FACES = ['🐱', '🌷', '⭐', '🎀', '🍓', '🌙'];
function shuffled() {
  const arr = [...FACES, ...FACES].map((f, i) => ({ key: i, face: f, up: false, done: false }));
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

export default function MemoryMatch({ onWin }) {
  const [cards, setCards] = useState(shuffled);
  const [sel, setSel] = useState([]); // 뒤집은 카드 index 2개
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const won = cards.every((c) => c.done);

  const reset = () => { setCards(shuffled()); setSel([]); setMoves(0); setLock(false); };

  const flip = (i) => {
    if (lock || cards[i].up || cards[i].done) return;
    const next = cards.map((c, k) => (k === i ? { ...c, up: true } : c));
    setCards(next);
    const s = [...sel, i];
    setSel(s);
    if (s.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = s;
      if (next[a].face === next[b].face) {
        setTimeout(() => { setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, done: true } : c))); setSel([]); setLock(false); }, 360);
      } else {
        setTimeout(() => { setCards((cs) => cs.map((c, k) => (k === a || k === b ? { ...c, up: false } : c))); setSel([]); setLock(false); }, 760);
      }
    }
  };

  const fireWin = useCallback(() => {
    try { award({ xp: 25, coins: 12 }); } catch { /* noop */ }
    celebrate({ type: 'game', emoji: '🧠', title: '짝 다 맞췄다!', subtitle: '+12 코인 · 기억력 최고!' });
    onWin?.();
  }, [onWin]);
  useEffect(() => { if (won) fireWin(); }, [won, fireWin]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>🧠 카드 짝맞추기</div>
      <div className="glass-card" style={{ padding: '0.5rem 1rem', color: '#f1f5f9', fontSize: '0.82rem' }}>
        같은 그림 <b style={{ color: '#f9a8d4' }}>짝</b>을 기억해서 맞춰요 · 뒤집은 횟수 <b style={{ color: '#a5f3fc' }}>{moves}</b>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 64px)', gap: 10 }}>
        {cards.map((c, i) => {
          const open = c.up || c.done;
          return (
            <button key={c.key} onClick={() => flip(i)}
              style={{
                width: 64, height: 64, borderRadius: 14, border: 'none', cursor: open ? 'default' : 'pointer',
                fontSize: '1.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.done ? 'rgba(52,211,153,0.25)' : open ? '#fff' : 'linear-gradient(135deg,#f9a8d4,#c084fc)',
                boxShadow: '0 5px 0 rgba(0,0,0,0.22)', transition: 'background .2s', opacity: c.done ? 0.7 : 1,
              }}>
              {open ? c.face : '❔'}
            </button>
          );
        })}
      </div>

      <button className="candy" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1.1rem', color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 14, fontSize: '0.88rem' }}>
        <RotateCcw size={16} /> 다시 섞기
      </button>

      {won && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#f9a8d4" /> <b>{moves}번 만에 완성! +12 코인</b>
        </div>
      )}
    </div>
  );
}
