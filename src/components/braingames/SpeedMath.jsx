// ⚡ 번개 계산 — 60초 타임어택. 고등학생용 난이도(2자리 곱/나눗셈·제곱·2단계) + 점수 따라 상승.
import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Trophy, RotateCcw } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const DURATION = 60;
const HISCORE_KEY = 'mentos_speedmath_hi';
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// 난이도 티어(0~3) — 시작 난이도 + 점수에 따라 상승
function makeProblem(score, startTier) {
  const t = Math.min(3, startTier + (score >= 150 ? 3 : score >= 90 ? 2 : score >= 40 ? 1 : 0));
  const r = Math.random();
  let text, ans;
  if (t <= 0) {
    if (r < 0.45) { const a = rnd(13, 89), b = rnd(12, 89); if (Math.random() < 0.5) { text = `${a} + ${b}`; ans = a + b; } else { const [x, y] = a >= b ? [a, b] : [b, a]; text = `${x} − ${y}`; ans = x - y; } }
    else { const a = rnd(4, 12), b = rnd(4, 9); text = `${a} × ${b}`; ans = a * b; }
  } else if (t === 1) {
    if (r < 0.4) { const a = rnd(12, 29), b = rnd(3, 9); text = `${a} × ${b}`; ans = a * b; }
    else if (r < 0.7) { const b = rnd(3, 12), q = rnd(4, 12); text = `${b * q} ÷ ${b}`; ans = q; }
    else { const a = rnd(20, 60), b = rnd(10, 30), c = rnd(5, 20); text = `${a} + ${b} − ${c}`; ans = a + b - c; }
  } else if (t === 2) {
    if (r < 0.35) { const a = rnd(11, 25); text = `${a}²`; ans = a * a; }
    else if (r < 0.65) { const a = rnd(12, 29), b = rnd(11, 19); text = `${a} × ${b}`; ans = a * b; }
    else { const a = rnd(6, 15), b = rnd(4, 9), c = rnd(5, 30); text = `${a} × ${b} − ${c}`; ans = a * b - c; }
  } else {
    if (r < 0.4) { const a = rnd(18, 39), b = rnd(13, 29); text = `${a} × ${b}`; ans = a * b; }
    else if (r < 0.7) { const a = rnd(15, 29); text = `${a}²`; ans = a * a; }
    else { const a = rnd(8, 19), b = rnd(6, 12), c = rnd(10, 50); text = `${a} × ${b} + ${c}`; ans = a * b + c; }
  }
  return { text, ans };
}

const TIERS = [
  { key: 0, label: '보통', desc: '두 자리 ±·구구단' },
  { key: 1, label: '어려움', desc: '두 자리 곱·나눗셈·세 수' },
  { key: 2, label: '고난도', desc: '제곱·두자리×두자리·2단계' },
];

export default function SpeedMath({ onWin }) {
  const [phase, setPhase] = useState('ready');
  const [startTier, setStartTier] = useState(1);
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prob, setProb] = useState(() => makeProblem(0, 1));
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [hi, setHi] = useState(() => parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10) || 0);
  const tick = useRef(null);
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const start = useCallback(() => {
    setPhase('play'); setTime(DURATION); setScore(0); setCombo(0); scoreRef.current = 0;
    setProb(makeProblem(0, startTier)); setInput('');
    clearInterval(tick.current);
    tick.current = setInterval(() => {
      setTime((t) => { if (t <= 1) { clearInterval(tick.current); setPhase('over'); return 0; } return t - 1; });
    }, 1000);
  }, [startTier]);

  useEffect(() => () => clearInterval(tick.current), []);

  useEffect(() => {
    if (phase !== 'over') return;
    const s = scoreRef.current;
    const coins = Math.floor(s / 12);
    if (s > 0) {
      try { award({ xp: Math.floor(s / 5), coins }); } catch { /* noop */ }
      celebrate({ type: 'game', emoji: '⚡', title: `${s}점!`, subtitle: `+${coins} 코인` });
      onWin?.();
    }
    if (s > hi) { setHi(s); try { localStorage.setItem(HISCORE_KEY, String(s)); } catch { /* noop */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const correct = () => {
    const ns = score + 10 + combo * 3;
    setScore(ns); setCombo((c) => c + 1);
    setProb(makeProblem(ns, startTier)); setInput('');
  };
  const wrong = () => { setCombo(0); setShake(true); setInput(''); setTimeout(() => setShake(false), 350); };

  const press = (d) => {
    if (phase !== 'play') return;
    const next = (input + d).slice(0, 5);
    setInput(next);
    if (parseInt(next, 10) === prob.ans) correct();
  };
  const submit = () => { if (phase !== 'play') return; if (parseInt(input, 10) === prob.ans) correct(); else wrong(); };

  if (phase !== 'play') {
    const over = phase === 'over';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem', padding: '1.6rem 1rem' }}>
        <div className="bg-title" style={{ fontSize: '1.7rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={26} color="#67e8f9" fill="#67e8f9" /> 번개 계산
        </div>
        {over && <div className="num-xl" style={{ fontSize: '3.2rem', color: '#a5f3fc', textShadow: '0 4px 0 rgba(0,0,0,.25)' }}>{scoreRef.current}<span style={{ fontSize: '1.1rem', color: '#fff' }}>점</span></div>}
        <div className="glass-card" style={{ padding: '0.7rem 1.2rem', color: '#fff', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Trophy size={16} color="#fbbf24" /> 최고 점수 <b>{hi}</b>
        </div>
        {!over && (
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.84rem', textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
            60초 안에 최대한 많이! <b>연속으로 맞히면 콤보 보너스</b>로 점수 폭발 ⚡<br />점수가 오를수록 문제도 어려워집니다.
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {TIERS.map((t) => (
            <button key={t.key} onClick={() => setStartTier(t.key)}
              style={{
                border: 'none', cursor: 'pointer', borderRadius: 14, padding: '0.5rem 0.8rem', fontFamily: 'var(--jua)',
                background: startTier === t.key ? 'linear-gradient(135deg,#22d3ee,#3b82f6)' : 'rgba(255,255,255,0.12)',
                color: '#fff', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center',
              }}>
              {t.label}<br /><span style={{ fontSize: '0.62rem', opacity: 0.85 }}>{t.desc}</span>
            </button>
          ))}
        </div>
        <button className="candy" onClick={start} style={{ padding: '1rem 2.4rem', fontSize: '1.2rem', color: '#06343f', background: 'linear-gradient(135deg,#a5f3fc,#22d3ee)' }}>
          {over ? <><RotateCcw size={18} style={{ marginRight: 6, verticalAlign: -3 }} />다시!</> : '시작!'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 340, color: '#fff', fontFamily: 'var(--num)' }}>
        <span>⏱ <b style={{ color: time <= 10 ? '#fca5a5' : '#a5f3fc' }}>{time}</b></span>
        <span>⚡ 콤보 <b style={{ color: '#fde68a' }}>{combo}</b></span>
        <span>점수 <b style={{ color: '#a5f3fc' }}>{score}</b></span>
      </div>
      <div style={{ width: '100%', maxWidth: 340, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <div style={{ width: `${(time / DURATION) * 100}%`, height: '100%', background: time <= 10 ? '#ef4444' : 'linear-gradient(90deg,#67e8f9,#22d3ee)', transition: 'width 1s linear' }} />
      </div>

      <div className="num-xl" style={{ fontSize: '2.8rem', color: '#fff', margin: '0.6rem 0', animation: shake ? 'shake .35s' : 'none' }}>{prob.text}</div>
      <div className="num-xl" style={{ minHeight: 44, fontSize: '2rem', color: '#a5f3fc', letterSpacing: 2 }}>{input || '?'}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="candy" onClick={() => press(d)} style={keyStyle}>{d}</button>
        ))}
        <button className="candy" onClick={() => setInput('')} style={{ ...keyStyle, fontSize: '1rem', background: 'linear-gradient(135deg,#94a3b8,#64748b)' }}>지우기</button>
        <button className="candy" onClick={() => press('0')} style={keyStyle}>0</button>
        <button className="candy" onClick={submit} style={{ ...keyStyle, background: 'linear-gradient(135deg,#34d399,#10b981)' }}>✓</button>
      </div>
    </div>
  );
}

const keyStyle = { width: 72, height: 60, fontSize: '1.6rem', color: '#06343f', background: 'linear-gradient(135deg,#e0f2fe,#a5f3fc)', borderRadius: 16 };
