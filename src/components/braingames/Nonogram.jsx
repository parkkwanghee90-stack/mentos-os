// 🧩 네모네모 로직(노노그램) — 시작 전 "완성 데모"로 푸는 법을 보여준 뒤 플레이.
// 승리 판정 = 행/열 단서(연속칸 수) 충족 → 항상 정상 완성.
import { useState, useMemo, useEffect } from 'react';
import { Brush, X, RotateCcw, Check, Play } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const PUZZLES = [
  { name: '하트 💗', rows: ['01010', '11111', '11111', '01110', '00100'] },
  { name: '별 ⭐', rows: ['00100', '01110', '11111', '01110', '10101'] },
  { name: '꽃 🌷', rows: ['01010', '11111', '01110', '00100', '01010'] },
  { name: '집 🏠', rows: ['00100', '01110', '11111', '01110', '01010'] },
  { name: '왕관 👑', rows: ['10101', '11111', '11111', '01110', '00000'] },
];
const DEMO = PUZZLES[0]; // 하트 데모

const N = 5;
const toGrid = (rows) => rows.map((r) => r.split('').map((c) => (c === '1' ? 1 : 0)));
function runs(line) {
  const out = []; let run = 0;
  for (const v of line) { if (v === 1) run++; else if (run) { out.push(run); run = 0; } }
  if (run) out.push(run);
  return out.length ? out : [0];
}
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const cluesOf = (sol) => ({
  rows: sol.map((r) => runs(r)),
  cols: Array.from({ length: N }, (_, c) => runs(sol.map((r) => r[c]))),
});

// 단서 + 격자를 그리는 공용 보드
function Board({ sol, cells, clues, onTap, won, cellHint }) {
  const CELL = 50;
  const rowOk = (r) => eq(runs(cells[r]), clues.rows[r]);
  const colOk = (c) => eq(runs(cells.map((row) => row[c])), clues.cols[c]);
  const bg = (r, c) => {
    if (won) return sol[r][c] ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.06)';
    return cells[r][c] === 1 ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.08)';
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${N}, ${CELL}px)`, gap: 4 }}>
      <div />
      {clues.cols.map((cl, c) => (
        <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', color: cellHint && colOk(c) ? '#34d399' : '#fbcfe8', fontFamily: 'var(--num)', fontWeight: 700, fontSize: 14, lineHeight: 1.15, paddingBottom: 4 }}>
          {cl.map((n, i) => <span key={i}>{n}</span>)}
        </div>
      ))}
      {Array.from({ length: N }).map((_, r) => (
        <Frag key={r}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end', color: cellHint && rowOk(r) ? '#34d399' : '#fbcfe8', fontFamily: 'var(--num)', fontWeight: 700, fontSize: 14, paddingRight: 6 }}>
            {clues.rows[r].map((n, i) => <span key={i}>{n}</span>)}
          </div>
          {Array.from({ length: N }).map((_, c) => (
            <button key={c} onClick={onTap ? () => onTap(r, c) : undefined}
              style={{ width: CELL, height: CELL, borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: bg(r, c), cursor: onTap && !won ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f9a8d4', fontSize: 20, fontWeight: 800, transition: 'background .15s' }}>
              {!won && cells[r][c] === 2 ? '✕' : ''}
            </button>
          ))}
        </Frag>
      ))}
    </div>
  );
}
function Frag({ children }) { return <>{children}</>; }

export default function Nonogram({ onWin }) {
  const [phase, setPhase] = useState('demo'); // demo | play

  // ── 데모: 하트를 단서대로 한 칸씩 자동으로 칠해 보여줌 ──
  const demoSol = useMemo(() => toGrid(DEMO.rows), []);
  const demoClues = useMemo(() => cluesOf(demoSol), [demoSol]);
  const demoOrder = useMemo(() => {
    const list = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (demoSol[r][c]) list.push([r, c]);
    return list;
  }, [demoSol]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase !== 'demo' || step >= demoOrder.length) return;
    const id = setTimeout(() => setStep((s) => s + 1), step === 0 ? 700 : 300);
    return () => clearTimeout(id);
  }, [phase, step, demoOrder.length]);

  const demoCells = useMemo(() => {
    const g = Array.from({ length: N }, () => Array(N).fill(0));
    demoOrder.slice(0, step).forEach(([r, c]) => { g[r][c] = 1; });
    return g;
  }, [demoOrder, step]);
  const demoDone = step >= demoOrder.length;

  // ── 실제 게임 ──
  const [pi, setPi] = useState(() => 1 + Math.floor(Math.random() * (PUZZLES.length - 1)));
  const [cells, setCells] = useState(() => Array.from({ length: N }, () => Array(N).fill(0)));
  const [mode, setMode] = useState(1);
  const [won, setWon] = useState(false);
  const puzzle = PUZZLES[pi];
  const solution = useMemo(() => toGrid(puzzle.rows), [puzzle]);
  const clues = useMemo(() => cluesOf(solution), [solution]);

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

  // ───────── 데모 화면 ─────────
  if (phase === 'demo') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
        <div className="bg-title" style={{ fontSize: '1.45rem' }}>🧩 이렇게 푸는 거예요</div>
        <div className="glass-card" style={{ padding: '0.8rem 1rem', maxWidth: 360, color: '#f1f5f9', fontSize: '0.82rem', lineHeight: 1.55 }}>
          <b style={{ color: '#f9a8d4' }}>규칙</b> — 행(왼쪽)·열(위) 숫자 = 그 줄에 <b>연속으로 칠할 칸 수</b>.
          숫자 <b>2 1</b> 이면 <b>2칸 연속 → 띄고 → 1칸</b>. 단서대로 칠하면 그림 완성!
        </div>

        <Board sol={demoSol} cells={demoCells} clues={demoClues} won={demoDone} cellHint={false} />

        <div style={{ minHeight: 26, color: '#fff', fontFamily: 'var(--jua)', fontSize: '0.95rem' }}>
          {demoDone ? '완성! 하트가 나왔죠? 😊' : '단서 숫자만큼 연속으로 칠하는 중…'}
        </div>

        <div style={{ display: 'flex', gap: '0.7rem' }}>
          {!demoDone && (
            <button className="candy" onClick={() => setStep(demoOrder.length)} style={{ ...modeBtn, background: 'rgba(255,255,255,0.18)' }}>건너뛰기</button>
          )}
          <button className="candy" onClick={() => setPhase('play')} style={{ ...modeBtn, padding: '0.7rem 1.3rem', fontSize: '1rem', background: demoDone ? 'linear-gradient(135deg,#f9a8d4,#ec4899)' : 'rgba(255,255,255,0.18)' }}>
            <Play size={16} /> 직접 해볼래!
          </button>
        </div>
      </div>
    );
  }

  // ───────── 플레이 화면 ─────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>🧩 숨은 그림 찾기</div>
      <Board sol={solution} cells={cells} clues={clues} onTap={tap} won={won} cellHint />

      <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="candy" onClick={() => setMode(1)} style={{ ...modeBtn, outline: mode === 1 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}><Brush size={16} /> 칠하기</button>
        <button className="candy" onClick={() => setMode(2)} style={{ ...modeBtn, outline: mode === 2 ? '3px solid #fff' : 'none', background: 'linear-gradient(135deg,#c084fc,#a855f7)' }}><X size={16} /> X 표시</button>
        <button className="candy" onClick={fresh} style={{ ...modeBtn, background: 'rgba(255,255,255,0.18)' }}><RotateCcw size={16} /> 새 그림</button>
        <button className="candy" onClick={() => { setStep(0); setPhase('demo'); }} style={{ ...modeBtn, background: 'rgba(255,255,255,0.12)', fontSize: '0.8rem' }}>설명 다시</button>
      </div>

      {won && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#f9a8d4" /> <b>{puzzle.name} 완성! +14 코인</b>
        </div>
      )}
    </div>
  );
}

const modeBtn = { display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 0.95rem', fontSize: '0.88rem', color: '#fff', borderRadius: 14, boxShadow: '0 4px 0 rgba(0,0,0,0.2)' };
