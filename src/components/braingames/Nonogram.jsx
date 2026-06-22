// 🧩 네모네모 로직 — 레벨↑ 칸↑·셀↓ → 진짜 그림이 보임 (5×5→8×8→10×10→15×15).
// 승리 = 행/열 단서(연속칸 수) 충족. 시작 전 데모로 푸는 법 안내.
import { useState, useMemo, useEffect } from 'react';
import { Brush, X, RotateCcw, Check, Play, ArrowRight } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

// 레벨 순서: 작은 칸 → 큰 칸(그림이 또렷해짐)
const PUZZLES = [
  { name: '하트 💗', rows: ['01010', '11111', '11111', '01110', '00100'] },
  { name: '별 ⭐', rows: ['00100', '01110', '11111', '01110', '10101'] },
  { name: '웃는 얼굴 🙂', rows: ['00111100', '01111110', '11011011', '11111111', '11111111', '11000011', '01111110', '00111100'] },
  { name: '하트 💖', rows: ['0110000110', '1111001111', '1111111111', '1111111111', '1111111111', '0111111110', '0011111100', '0001111000', '0000110000', '0000000000'] },
  { name: '고양이 🐱', rows: ['1100000011', '1110000111', '1111111111', '1101111011', '1111111111', '1111111111', '1101111011', '0111111110', '0011111100', '0001111000'] },
  { name: '큰 하트 ❤️', rows: ['000111000111000', '001111101111100', '011111111111110', '111111111111111', '111111111111111', '111111111111111', '111111111111111', '011111111111110', '001111111111100', '000111111111000', '000011111110000', '000001111100000', '000000111000000', '000000010000000', '000000000000000'] },
];

const toGrid = (rows) => rows.map((r) => r.split('').map((c) => (c === '1' ? 1 : 0)));
function runs(line) { const out = []; let r = 0; for (const v of line) { if (v === 1) r++; else if (r) { out.push(r); r = 0; } } if (r) out.push(r); return out.length ? out : [0]; }
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const cluesOf = (sol, N) => ({ rows: sol.map((r) => runs(r)), cols: Array.from({ length: N }, (_, c) => runs(sol.map((r) => r[c]))) });
const cellPx = (N) => (N <= 5 ? 46 : N <= 8 ? 34 : N <= 10 ? 27 : 19);
const cluePx = (N) => (N <= 8 ? 13 : N <= 10 ? 12 : 10);

function Board({ sol, cells, clues, N, onTap, won, cellHint }) {
  const C = cellPx(N), F = cluePx(N);
  const rowOk = (r) => eq(runs(cells[r]), clues.rows[r]);
  const colOk = (c) => eq(runs(cells.map((row) => row[c])), clues.cols[c]);
  const bg = (r, c) => won ? (sol[r][c] ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.06)') : (cells[r][c] === 1 ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.08)');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${N}, ${C}px)`, gap: N > 10 ? 2 : 3 }}>
      <div />
      {clues.cols.map((cl, c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', color: cellHint && colOk(c) ? '#34d399' : '#fbcfe8', fontFamily: 'var(--num)', fontWeight: 700, fontSize: F, lineHeight: 1.1, paddingBottom: 3 }}>
          {cl.map((n, i) => <span key={i}>{n}</span>)}
        </div>
      ))}
      {Array.from({ length: N }).map((_, r) => (
        <Frag key={r}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end', color: cellHint && rowOk(r) ? '#34d399' : '#fbcfe8', fontFamily: 'var(--num)', fontWeight: 700, fontSize: F, paddingRight: 5 }}>
            {clues.rows[r].map((n, i) => <span key={i}>{n}</span>)}
          </div>
          {Array.from({ length: N }).map((_, c) => (
            <button key={c} onClick={onTap ? () => onTap(r, c) : undefined}
              style={{ width: C, height: C, borderRadius: N > 10 ? 5 : 9, border: '1px solid rgba(255,255,255,0.13)', background: bg(r, c), cursor: onTap && !won ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f9a8d4', fontSize: C * 0.5, fontWeight: 800, transition: 'background .1s' }}>
              {!won && cells[r][c] === 2 ? '✕' : ''}
            </button>
          ))}
        </Frag>
      ))}
    </div>
  );
}
function Frag({ children }) { return <>{children}</>; }
const emptyCells = (N) => Array.from({ length: N }, () => Array(N).fill(0));

export default function Nonogram({ onWin }) {
  const [phase, setPhase] = useState('demo'); // demo | play
  const [level, setLevel] = useState(0);

  // 데모(5×5 하트 자동 채우기)
  const demoSol = useMemo(() => toGrid(PUZZLES[0].rows), []);
  const demoClues = useMemo(() => cluesOf(demoSol, 5), [demoSol]);
  const demoOrder = useMemo(() => { const l = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (demoSol[r][c]) l.push([r, c]); return l; }, [demoSol]);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (phase !== 'demo' || step >= demoOrder.length) return;
    const id = setTimeout(() => setStep((s) => s + 1), step === 0 ? 700 : 300);
    return () => clearTimeout(id);
  }, [phase, step, demoOrder.length]);
  const demoCells = useMemo(() => { const g = emptyCells(5); demoOrder.slice(0, step).forEach(([r, c]) => { g[r][c] = 1; }); return g; }, [demoOrder, step]);
  const demoDone = step >= demoOrder.length;

  // 플레이
  const puzzle = PUZZLES[level];
  const N = puzzle.rows.length;
  const solution = useMemo(() => toGrid(puzzle.rows), [puzzle]);
  const clues = useMemo(() => cluesOf(solution, N), [solution, N]);
  const [cells, setCells] = useState(() => emptyCells(N));
  const [mode, setMode] = useState(1);
  const [won, setWon] = useState(false);
  useEffect(() => { setCells(emptyCells(N)); setWon(false); setMode(1); }, [level, N]);

  const isWin = (g) => {
    for (let r = 0; r < N; r++) if (!eq(runs(g[r]), clues.rows[r])) return false;
    for (let c = 0; c < N; c++) if (!eq(runs(g.map((row) => row[c])), clues.cols[c])) return false;
    return true;
  };
  const tap = (r, c) => {
    if (won) return;
    setCells((prev) => {
      const g = prev.map((row) => row.slice());
      g[r][c] = g[r][c] === mode ? 0 : mode;
      if (isWin(g)) {
        setWon(true);
        const coins = 10 + level * 4;
        try { award({ xp: 20 + level * 6, coins }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '🧩', title: `${puzzle.name} 완성!`, subtitle: `+${coins} 코인 · 칸이 커질수록 진짜 그림!` });
        onWin?.();
      }
      return g;
    });
  };
  const isLast = level >= PUZZLES.length - 1;

  if (phase === 'demo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
        <div className="bg-title" style={{ fontSize: '1.4rem' }}>🧩 이렇게 푸는 거예요</div>
        <div className="glass-card" style={{ padding: '0.8rem 1rem', maxWidth: 360, color: '#f1f5f9', fontSize: '0.82rem', lineHeight: 1.5 }}>
          행·열 숫자 = 그 줄에 <b>연속으로 칠할 칸 수</b>. <b>2 1</b>이면 2칸 → 띄고 → 1칸. 숫자대로 칠하면 그림 완성!
          <br />레벨이 오를수록 <b style={{ color: '#f9a8d4' }}>칸이 많아지고 작아져 진짜 그림</b>이 나와요.
        </div>
        <Board sol={demoSol} cells={demoCells} clues={demoClues} N={5} won={demoDone} cellHint={false} />
        <div style={{ minHeight: 24, color: '#fff', fontFamily: 'var(--jua)', fontSize: '0.95rem' }}>{demoDone ? '완성! 하트가 나왔죠? 😊' : '단서대로 칠하는 중…'}</div>
        <div style={{ display: 'flex', gap: '0.7rem' }}>
          {!demoDone && <button className="candy" onClick={() => setStep(demoOrder.length)} style={modeBtn}>건너뛰기</button>}
          <button className="candy" onClick={() => setPhase('play')} style={{ ...modeBtn, padding: '0.7rem 1.3rem', fontSize: '1rem', background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}><Play size={16} /> 직접 해볼래!</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.3rem' }}>🧩 Lv.{level + 1} · {N}×{N}</div>
      <div className="glass-card" style={{ padding: '0.45rem 1rem', color: '#f1f5f9', fontSize: '0.8rem' }}>숨은 그림: <b style={{ color: '#f9a8d4' }}>{won ? puzzle.name : '???'}</b> · 칸이 많을수록 또렷해져요</div>
      <div style={{ overflowX: 'auto', maxWidth: '100%', padding: 4 }}><Board sol={solution} cells={cells} clues={clues} N={N} onTap={tap} won={won} cellHint /></div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="candy" onClick={() => setMode(1)} style={{ ...modeBtn, outline: mode === 1 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}><Brush size={15} /> 칠하기</button>
        <button className="candy" onClick={() => setMode(2)} style={{ ...modeBtn, outline: mode === 2 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#c084fc,#a855f7)' }}><X size={15} /> X</button>
        <button className="candy" onClick={() => setCells(emptyCells(N))} style={{ ...modeBtn, background: 'rgba(255,255,255,0.18)' }}><RotateCcw size={15} /> 지우기</button>
      </div>
      {won && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'pop .3s both' }}>
          <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Check size={18} color="#f9a8d4" /> <b>{puzzle.name} 완성!</b></div>
          {!isLast
            ? <button className="candy" onClick={() => setLevel((l) => l + 1)} style={{ ...modeBtn, padding: '0.7rem 1.3rem', fontSize: '1rem', background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}>다음 레벨 (더 큰 그림) <ArrowRight size={16} /></button>
            : <button className="candy" onClick={() => { setLevel(0); }} style={{ ...modeBtn, background: 'rgba(255,255,255,0.18)' }}>🏆 마스터! 처음부터</button>}
        </div>
      )}
    </div>
  );
}
const modeBtn = { display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 0.9rem', fontSize: '0.86rem', color: '#fff', borderRadius: 13, boxShadow: '0 4px 0 rgba(0,0,0,0.2)' };
