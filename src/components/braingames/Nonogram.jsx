// 🧩 네모네모 로직 — 5x5 숨은 그림 찾기. 단서(줄 숫자) 보고 칠해서 그림 완성.
import { useState, useMemo, useCallback } from 'react';
import { Brush, X, RotateCcw, Check } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const PUZZLES = [
  { name: '하트 💗', rows: ['01010', '11111', '11111', '01110', '00100'] },
  { name: '별 ⭐', rows: ['00100', '01110', '11111', '01010', '10001'] },
  { name: '꽃 🌷', rows: ['01010', '11111', '01110', '00100', '01010'] },
  { name: '고양이 🐱', rows: ['10001', '11111', '10101', '11111', '01110'] },
  { name: '왕관 👑', rows: ['10101', '11111', '11111', '01110', '00000'] },
];

const toGrid = (rows) => rows.map((r) => r.split('').map((c) => c === '1'));

function clues(line) {
  const out = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run) { out.push(run); run = 0; }
  }
  if (run) out.push(run);
  return out.length ? out : [0];
}

export default function Nonogram({ onWin }) {
  const [pi, setPi] = useState(() => Math.floor(Math.random() * PUZZLES.length));
  const puzzle = PUZZLES[pi];
  const solution = useMemo(() => toGrid(puzzle.rows), [puzzle]);
  const N = 5;
  const [cells, setCells] = useState(() => Array.from({ length: N }, () => Array(N).fill(0))); // 0 empty,1 fill,2 X
  const [mode, setMode] = useState(1); // 1 칠하기, 2 X
  const [won, setWon] = useState(false);

  const rowClues = useMemo(() => solution.map((r) => clues(r)), [solution]);
  const colClues = useMemo(() => Array.from({ length: N }, (_, c) => clues(solution.map((r) => r[c]))), [solution]);

  const checkWin = useCallback((grid) => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (solution[r][c] && grid[r][c] !== 1) return false;
      if (!solution[r][c] && grid[r][c] === 1) return false;
    }
    return true;
  }, [solution]);

  const tap = (r, c) => {
    if (won) return;
    setCells((prev) => {
      const g = prev.map((row) => row.slice());
      g[r][c] = g[r][c] === mode ? 0 : mode;
      if (checkWin(g)) {
        setWon(true);
        try { award({ xp: 30, coins: 14 }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '🧩', title: `${puzzle.name} 완성!`, subtitle: '+14 코인 · 추리력 최고!' });
        onWin?.();
      }
      return g;
    });
  };

  const fresh = () => {
    setPi((p) => (p + 1 + Math.floor(Math.random() * (PUZZLES.length - 1))) % PUZZLES.length);
    setCells(Array.from({ length: N }, () => Array(N).fill(0)));
    setWon(false);
  };

  const CELL = 48;
  const cellBg = (r, c) => {
    const v = cells[r][c];
    if (won) return solution[r][c] ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.06)';
    if (v === 1) return 'linear-gradient(135deg,#f9a8d4,#ec4899)';
    return 'rgba(255,255,255,0.08)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>🧩 숨은 그림을 찾아봐!</div>

      {/* 보드: 좌측 행단서 + 상단 열단서 + 격자 */}
      <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${N}, ${CELL}px)`, gap: 4 }}>
        <div />
        {colClues.map((cl, c) => (
          <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', color: '#fbcfe8', fontFamily: 'var(--num)', fontSize: 13, lineHeight: 1.1, paddingBottom: 4 }}>
            {cl.map((n, i) => <span key={i}>{n}</span>)}
          </div>
        ))}
        {Array.from({ length: N }).map((_, r) => (
          <RowFragment key={r}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'flex-end', color: '#fbcfe8', fontFamily: 'var(--num)', fontSize: 13, paddingRight: 6 }}>
              {rowClues[r].map((n, i) => <span key={i}>{n}</span>)}
            </div>
            {Array.from({ length: N }).map((_, c) => (
              <button
                key={c}
                onClick={() => tap(r, c)}
                style={{
                  width: CELL, height: CELL, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
                  background: cellBg(r, c), cursor: won ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, transition: 'background .12s, transform .1s',
                }}
              >
                {!won && cells[r][c] === 2 ? '✕' : ''}
              </button>
            ))}
          </RowFragment>
        ))}
      </div>

      {/* 모드 + 컨트롤 */}
      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
        <button className="candy" onClick={() => setMode(1)} style={{ ...modeBtn, outline: mode === 1 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}>
          <Brush size={16} /> 칠하기
        </button>
        <button className="candy" onClick={() => setMode(2)} style={{ ...modeBtn, outline: mode === 2 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#c084fc,#a855f7)' }}>
          <X size={16} /> 표시
        </button>
        <button className="candy" onClick={fresh} style={{ ...modeBtn, background: 'rgba(255,255,255,0.18)' }}>
          <RotateCcw size={16} /> 새 그림
        </button>
      </div>

      {won && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#f9a8d4" /> <b>{puzzle.name} 완성! +14 코인</b>
        </div>
      )}
    </div>
  );
}

function RowFragment({ children }) {
  return <>{children}</>;
}

const modeBtn = {
  display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 0.95rem',
  fontSize: '0.88rem', color: '#fff', borderRadius: 14, boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
};
