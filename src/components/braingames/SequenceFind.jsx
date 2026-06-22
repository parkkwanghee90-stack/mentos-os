// 🐸 징검다리 건너기 — 강 위 돌의 숫자가 '규칙'(예: ×2 두배)을 따라. 다음 돌 숫자를 맞혀 폴짝 건너기!
import { useState } from 'react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LEN = 6;       // 돌 개수
const GIVEN = 2;     // 처음 보여주는 돌(인덱스 0,1) — 시작은 1번 돌 위

function makeRiver() {
  const kind = rnd(0, 4);
  let s = [], hint;
  if (kind === 0) { const a = rnd(2, 6), r = 2; for (let i = 0; i < LEN; i++) s.push(a * r ** i); hint = '두 배(×2)'; }
  else if (kind === 1) { const a = rnd(2, 9), d = rnd(2, 9); for (let i = 0; i < LEN; i++) s.push(a + d * i); hint = `+${d} 씩`; }
  else if (kind === 2) { let v = rnd(1, 4), d = rnd(1, 3); for (let i = 0; i < LEN; i++) { s.push(v); v += d; d += 1; } hint = '차이가 1씩 커짐'; }
  else if (kind === 3) { let v = rnd(1, 3); for (let i = 0; i < LEN; i++) { s.push(v); v = v * 2 + 1; } hint = '×2 +1'; }
  else { let x = rnd(1, 3), y = rnd(2, 4); s = [x, y]; for (let i = 0; i < LEN - 2; i++) { const n = x + y; s.push(n); x = y; y = n; } hint = '앞 두 수의 합'; }
  return { s, hint };
}
function optsFor(seq, idx) {
  const ans = seq[idx];
  if (!Number.isFinite(ans)) return []; // 범위 밖(도착 후) — 무한루프 방지
  const set = new Set([ans]);
  const cand = shuffle([ans + 1, ans - 1, ans + 2, ans + (seq[idx - 1] - seq[idx - 2] || 2), ans * 2 - 1, Math.round(ans * 1.5)]);
  for (const c of cand) { if (set.size >= 3) break; if (c > 0 && !set.has(c)) set.add(c); }
  let n = ans + 3, guard = 0; while (set.size < 3 && guard++ < 100) { if (n > 0 && !set.has(n)) set.add(n); n++; }
  return shuffle([...set]);
}

export default function SequenceFind({ onWin }) {
  const [river, setRiver] = useState(makeRiver);
  const [pos, setPos] = useState(GIVEN - 1);  // 개구리가 올라선 돌 인덱스
  const [splash, setSplash] = useState(false);
  const [fails, setFails] = useState(0);
  const [crossed, setCrossed] = useState(0);

  const done = pos >= LEN - 1;
  const opts = done ? [] : optsFor(river.s, pos + 1); // done이면 pos+1이 범위 밖 → optsFor 무한루프 방지

  const hop = (v) => {
    if (done || splash) return;
    if (v === river.s[pos + 1]) {
      const np = pos + 1;
      setPos(np);
      if (np >= LEN - 1) {
        const nc = crossed + 1; setCrossed(nc);
        try { award({ xp: 12, coins: 6 }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '🐸', title: '강 건넜다!', subtitle: '+6 코인 · 규칙 발견 천재!' });
        onWin?.();
        setTimeout(() => { setRiver(makeRiver()); setPos(GIVEN - 1); setFails(0); }, 1100);
      }
    } else {
      setSplash(true); setFails((f) => f + 1);
      setTimeout(() => { setSplash(false); setPos(GIVEN - 1); }, 900);
    }
  };

  const STONE = 50;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>🐸 징검다리 건너기</div>
      <div className="glass-card" style={{ padding: '0.5rem 1rem', color: '#f1f5f9', fontSize: '0.82rem', textAlign: 'center' }}>
        돌의 숫자는 <b style={{ color: '#fcd34d' }}>규칙</b>을 따라요. <b>다음 돌 숫자</b>를 골라 강을 건너요! · 건넌 강 <b style={{ color: '#a5f3fc' }}>{crossed}</b>
      </div>

      {/* 강 + 돌 */}
      <div style={{ position: 'relative', background: 'linear-gradient(180deg,#38bdf8,#0ea5e9)', borderRadius: 18, padding: '2.4rem 0.8rem 1rem', boxShadow: 'inset 0 6px 14px rgba(0,0,0,0.25)', maxWidth: 360, width: '100%', overflowX: 'auto' }}>
        {/* 개구리 */}
        <div style={{ position: 'absolute', top: 6, left: 12, transform: `translateX(${pos * (STONE + 8)}px)`, transition: 'transform .3s cubic-bezier(.3,1.4,.5,1)', fontSize: '1.9rem' }}>
          {splash ? '💦' : '🐸'}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
          {river.s.map((n, i) => {
            const shown = i <= pos;
            const isBank = i === LEN - 1;
            return (
              <div key={i} style={{ position: 'relative', flex: '0 0 auto', width: STONE, height: STONE, borderRadius: '46% 54% 50% 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--num)', fontWeight: 800, fontSize: '1.05rem', color: '#fff', background: isBank ? 'linear-gradient(135deg,#86efac,#22c55e)' : 'linear-gradient(135deg,#a8a29e,#78716c)', boxShadow: '0 4px 0 rgba(0,0,0,0.25)' }}>
                {isBank && <span style={{ position: 'absolute', top: -18, fontSize: '1rem' }}>🏁</span>}
                {shown ? n : '?'}
              </div>
            );
          })}
        </div>
      </div>

      {/* 다음 돌 선택 */}
      {!done && (
        <>
          <div style={{ color: '#fff', fontFamily: 'var(--jua)', fontSize: '0.95rem' }}>다음 돌의 숫자는?</div>
          <div style={{ display: 'flex', gap: 12 }}>
            {opts.map((v) => (
              <button key={v} className="candy" onClick={() => hop(v)} disabled={splash}
                style={{ width: 84, height: 54, fontSize: '1.4rem', color: '#1e3a5f', background: 'linear-gradient(135deg,#fde68a,#fcd34d)' }}>{v}</button>
            ))}
          </div>
        </>
      )}
      {fails >= 1 && !done && (
        <div style={{ color: '#fcd34d', fontSize: '0.8rem' }}>💡 힌트: 규칙은 <b>{river.hint}</b></div>
      )}
    </div>
  );
}
