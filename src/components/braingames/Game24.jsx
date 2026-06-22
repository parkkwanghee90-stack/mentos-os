// 🎯 24 만들기 — 네 숫자를 사칙연산으로 조합해 24 만들기. 탭으로 두 수를 합쳐간다.
import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Undo2, Sparkles } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const EPS = 1e-6;

function solvable(nums) {
  if (nums.length === 1) return Math.abs(nums[0] - 24) < EPS;
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i === j) continue;
      const rest = nums.filter((_, k) => k !== i && k !== j);
      const a = nums[i], b = nums[j];
      const cands = [a + b, a - b, a * b];
      if (Math.abs(b) > EPS) cands.push(a / b);
      for (const c of cands) if (solvable([...rest, c])) return true;
    }
  }
  return false;
}

function gen24() {
  let nums;
  let guard = 0;
  do {
    nums = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 9));
    guard++;
  } while (!solvable(nums) && guard < 200);
  return nums;
}

const OPS = [
  { k: '+', fn: (a, b) => a + b },
  { k: '−', fn: (a, b) => a - b },
  { k: '×', fn: (a, b) => a * b },
  { k: '÷', fn: (a, b) => (Math.abs(b) < EPS ? null : a / b) },
];

function fmt(v) {
  return Math.abs(v - Math.round(v)) < EPS ? String(Math.round(v)) : v.toFixed(2);
}

let TILE_SEQ = 0;

export default function Game24({ onWin }) {
  const [tiles, setTiles] = useState([]);     // [{id, val}]
  const [history, setHistory] = useState([]);
  const [sel, setSel] = useState(null);       // 선택된 tile id
  const [op, setOp] = useState(null);
  const [won, setWon] = useState(false);

  const fresh = useCallback(() => {
    const nums = gen24();
    setTiles(nums.map((v) => ({ id: ++TILE_SEQ, val: v })));
    setHistory([]); setSel(null); setOp(null); setWon(false);
  }, []);

  useEffect(() => { fresh(); }, [fresh]);

  const pickTile = (id) => {
    if (won) return;
    if (sel == null) { setSel(id); return; }
    if (sel === id) { setSel(null); return; }
    if (!op) { setSel(id); return; } // 연산자 없으면 선택만 변경
    // 두 수 합치기
    const a = tiles.find((t) => t.id === sel);
    const b = tiles.find((t) => t.id === id);
    const res = OPS.find((o) => o.k === op).fn(a.val, b.val);
    if (res == null) { setOp(null); return; } // 0으로 나누기 무효
    setHistory((h) => [...h, tiles]);
    const next = tiles.filter((t) => t.id !== sel && t.id !== id);
    const newTile = { id: ++TILE_SEQ, val: res };
    next.push(newTile);
    setTiles(next); setSel(newTile.id); setOp(null);
    if (next.length === 1 && Math.abs(res - 24) < EPS) {
      setWon(true);
      try { award({ xp: 30, coins: 12 }); } catch { /* noop */ }
      celebrate({ type: 'game', emoji: '🎯', title: '24 완성!', subtitle: '+12 코인 · 멋진 식이었어!' });
      onWin?.();
    }
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setTiles(prev); setSel(null); setOp(null); setWon(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem', padding: '1.2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="bg-title" style={{ fontSize: '1.5rem' }}>🎯 네 숫자로 <b style={{ color: '#fde68a' }}>24</b>를 만들어!</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', marginTop: 4 }}>숫자 → 연산 → 다른 숫자 순서로 합쳐요</div>
      </div>

      {/* 숫자 타일 */}
      <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', justifyContent: 'center', minHeight: 92 }}>
        {tiles.map((t) => (
          <button
            key={t.id}
            className="candy"
            onClick={() => pickTile(t.id)}
            style={{
              width: 84, height: 84, fontSize: '2rem', color: '#7c2d12',
              background: sel === t.id ? 'linear-gradient(135deg,#fef08a,#fbbf24)' : 'linear-gradient(135deg,#fffbeb,#fde68a)',
              outline: sel === t.id ? '4px solid #fff' : 'none',
              animation: 'bounceIn .35s both',
            }}
          >
            {fmt(t.val)}
          </button>
        ))}
      </div>

      {/* 연산자 */}
      <div style={{ display: 'flex', gap: '0.7rem' }}>
        {OPS.map((o) => (
          <button
            key={o.k}
            className="candy"
            disabled={won}
            onClick={() => setOp(op === o.k ? null : o.k)}
            style={{
              width: 62, height: 62, fontSize: '1.6rem', color: '#fff',
              background: op === o.k ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'linear-gradient(135deg,#fb923c,#f97316)',
              outline: op === o.k ? '4px solid #fff' : 'none',
            }}
          >
            {o.k}
          </button>
        ))}
      </div>

      {/* 컨트롤 */}
      <div style={{ display: 'flex', gap: '0.7rem' }}>
        <button className="candy" onClick={undo} disabled={!history.length} style={ctrl}>
          <Undo2 size={16} /> 되돌리기
        </button>
        <button className="candy" onClick={fresh} style={ctrl}>
          <RotateCcw size={16} /> 새 문제
        </button>
      </div>

      {won && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Sparkles size={18} color="#fde68a" /> <b>24 완성! +12 코인</b>
        </div>
      )}
    </div>
  );
}

const ctrl = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', fontSize: '0.9rem',
  color: '#fff', background: 'rgba(255,255,255,0.16)', borderRadius: 14,
  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
};
