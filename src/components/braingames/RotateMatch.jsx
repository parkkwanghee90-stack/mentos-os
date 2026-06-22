// 🧊 회전 도형 맞추기 — 위 도형을 '돌린 것'을 보기에서 고르기(공간추론·멘탈로테이션).
// 거울상(뒤집은 것)은 오답. 비대칭 도형이라 회전 ≠ 거울.
import { useState, useMemo } from 'react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const SHAPES = [
  [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]], // F
  [[0, 0], [1, 0], [2, 0], [2, 1]],         // L
  [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]], // Y(축소)
  [[0, 1], [1, 1], [1, 0], [2, 0]],         // S
  [[0, 0], [0, 1], [1, 1], [1, 2]],         // Z
];
const rot = (cells) => cells.map(([r, c]) => [c, 3 - r]);
const mir = (cells) => cells.map(([r, c]) => [r, 3 - c]);
const norm = (cells) => {
  const mr = Math.min(...cells.map((p) => p[0])), mc = Math.min(...cells.map((p) => p[1]));
  return cells.map(([r, c]) => [r - mr, c - mc]);
};
const key = (cells) => norm(cells).map((p) => p.join(',')).sort().join(' ');
const rotsKeySet = (base) => { let s = base, out = new Set(); for (let i = 0; i < 4; i++) { out.add(key(s)); s = rot(s); } return out; };
const rotN = (cells, n) => { let s = cells; for (let i = 0; i < n; i++) s = rot(s); return s; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function makeRound() {
  const base = pick(SHAPES);
  const baseSet = rotsKeySet(base);
  const correct = rotN(base, 1 + Math.floor(Math.random() * 3)); // 회전(정답)
  const opts = [{ cells: correct, ok: true }];
  // 오답: 거울상 + 다른 도형들 (정답 회전집합에 안 들어가게)
  const cands = [mir(base), ...SHAPES.filter((s) => key(s) !== key(base))];
  for (const cand of cands) {
    if (opts.length >= 4) break;
    const cellsR = rotN(cand, Math.floor(Math.random() * 4));
    if (!baseSet.has(key(cellsR)) && !opts.some((o) => key(o.cells) === key(cellsR))) {
      opts.push({ cells: cellsR, ok: false });
    }
  }
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  return { question: base, opts, baseSet };
}

function Shape({ cells, size = 18, color = '#a78bfa' }) {
  const n = norm(cells);
  const maxR = Math.max(...n.map((p) => p[0])) + 1, maxC = Math.max(...n.map((p) => p[1])) + 1;
  const W = maxC * size, H = maxR * size;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {n.map(([r, c], i) => (
        <rect key={i} x={c * size + 1} y={r * size + 1} width={size - 2} height={size - 2} rx="3" fill={color} stroke="#fff" strokeWidth="1" />
      ))}
    </svg>
  );
}

export default function RotateMatch({ onWin }) {
  const [round, setRound] = useState(makeRound);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState(null); // {idx, ok}
  const rerandom = useMemo(() => round, [round]); // eslint anchor

  const choose = (o, idx) => {
    if (picked) return;
    const ok = round.baseSet.has(key(o.cells));
    setPicked({ idx, ok });
    if (ok) {
      const ns = streak + 1;
      setScore((s) => s + 1); setStreak(ns);
      try { award({ xp: 6, coins: 3 }); } catch { /* noop */ }
      if (ns > 0 && ns % 5 === 0) { celebrate({ type: 'game', emoji: '🧊', title: `${ns}연속 정답!`, subtitle: '공간감각 최고!' }); onWin?.(); }
    } else {
      setStreak(0);
    }
    setTimeout(() => { setPicked(null); setRound(makeRound()); }, ok ? 550 : 1100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>🧊 회전 도형 맞추기</div>
      <div style={{ display: 'flex', gap: 16, color: '#fff', fontFamily: 'var(--num)' }}>
        <span>맞힘 <b style={{ color: '#a5f3fc' }}>{score}</b></span>
        <span>연속 <b style={{ color: '#fde68a' }}>{streak}</b></span>
      </div>
      <div className="glass-card" style={{ padding: '0.5rem 1rem', color: '#f1f5f9', fontSize: '0.82rem', textAlign: 'center' }}>
        위 도형을 <b style={{ color: '#c4b5fd' }}>돌린 것</b>을 고르세요. <span style={{ color: '#94a3b8' }}>(뒤집은 거울상은 오답!)</span>
      </div>

      {/* 문제 도형 */}
      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '1rem 1.4rem' }}>
        <Shape cells={rerandom.question} size={22} color="#fbbf24" />
      </div>

      {/* 보기 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {rerandom.opts.map((o, idx) => {
          const isPicked = picked && picked.idx === idx;
          const showOk = picked && round.baseSet.has(key(o.cells));
          return (
            <button key={idx} onClick={() => choose(o, idx)} disabled={!!picked}
              style={{
                minWidth: 110, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 16, cursor: picked ? 'default' : 'pointer',
                border: isPicked ? (picked.ok ? '3px solid #34d399' : '3px solid #f87171') : (picked && showOk ? '3px solid #34d399' : '1px solid rgba(255,255,255,0.18)'),
                background: 'rgba(255,255,255,0.06)', boxShadow: '0 5px 0 rgba(0,0,0,0.2)',
              }}>
              <Shape cells={o.cells} size={20} color="#a78bfa" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
