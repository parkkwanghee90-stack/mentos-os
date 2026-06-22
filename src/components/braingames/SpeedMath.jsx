// ⚡ 번개 계산 — 60초 타임어택. 맞히면 콤보·점수, 점수 오를수록 난이도↑.
import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Trophy, RotateCcw } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const DURATION = 60;
const HISCORE_KEY = 'mentos_speedmath_hi';

function makeProblem(score) {
  const hard = score >= 120;
  const mid = score >= 50;
  const r = Math.random();
  let a, b, op, ans;
  if (hard && r < 0.4) { // 곱셈
    a = 2 + Math.floor(Math.random() * 11); b = 2 + Math.floor(Math.random() * 8);
    op = '×'; ans = a * b;
  } else if (mid && r < 0.5) { // 큰 덧/뺄셈
    a = 10 + Math.floor(Math.random() * 40); b = 5 + Math.floor(Math.random() * 30);
    if (Math.random() < 0.5) { op = '+'; ans = a + b; } else { if (b > a) [a, b] = [b, a]; op = '−'; ans = a - b; }
  } else { // 기본 덧/뺄셈
    a = 2 + Math.floor(Math.random() * 18); b = 1 + Math.floor(Math.random() * 12);
    if (Math.random() < 0.5) { op = '+'; ans = a + b; } else { if (b > a) [a, b] = [b, a]; op = '−'; ans = a - b; }
  }
  return { a, b, op, ans };
}

export default function SpeedMath({ onWin }) {
  const [phase, setPhase] = useState('ready'); // ready | play | over
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [prob, setProb] = useState(() => makeProblem(0));
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [hi, setHi] = useState(() => parseInt(localStorage.getItem(HISCORE_KEY) || '0', 10) || 0);
  const tick = useRef(null);

  const start = useCallback(() => {
    setPhase('play'); setTime(DURATION); setScore(0); setCombo(0);
    setProb(makeProblem(0)); setInput('');
    clearInterval(tick.current);
    tick.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(tick.current); setPhase('over'); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(tick.current), []);

  // 게임 종료 처리
  useEffect(() => {
    if (phase !== 'over') return;
    setScore((s) => {
      const coins = Math.floor(s / 10);
      if (s > 0) {
        try { award({ xp: Math.floor(s / 5), coins }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '⚡', title: `${s}점!`, subtitle: `+${coins} 코인` });
        onWin?.();
      }
      if (s > hi) { setHi(s); try { localStorage.setItem(HISCORE_KEY, String(s)); } catch { /* noop */ } }
      return s;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const submit = (val) => {
    if (phase !== 'play') return;
    if (parseInt(val, 10) === prob.ans) {
      const gain = 10 + combo * 2;
      setScore((s) => s + gain);
      setCombo((c) => c + 1);
      setProb(makeProblem(score));
      setInput('');
    } else {
      setCombo(0); setShake(true); setInput('');
      setTimeout(() => setShake(false), 350);
    }
  };

  const press = (d) => {
    if (phase !== 'play') return;
    const next = (input + d).slice(0, 4);
    setInput(next);
    if (parseInt(next, 10) === prob.ans) submit(next);
  };

  if (phase === 'ready' || phase === 'over') {
    const over = phase === 'over';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.3rem', padding: '2rem 1rem' }}>
        <div className="bg-title" style={{ fontSize: '1.7rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={26} color="#67e8f9" fill="#67e8f9" /> 번개 계산
        </div>
        {over && <div className="num-xl" style={{ fontSize: '3.4rem', color: '#a5f3fc', textShadow: '0 4px 0 rgba(0,0,0,.25)' }}>{score}<span style={{ fontSize: '1.2rem', color: '#fff' }}>점</span></div>}
        <div className="glass-card" style={{ padding: '0.7rem 1.2rem', color: '#fff', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Trophy size={16} color="#fbbf24" /> 최고 점수 <b>{hi}</b>
        </div>
        <button className="candy" onClick={start} style={{ padding: '1rem 2.2rem', fontSize: '1.2rem', color: '#06343f', background: 'linear-gradient(135deg,#a5f3fc,#22d3ee)' }}>
          {over ? <><RotateCcw size={18} style={{ marginRight: 6, verticalAlign: -3 }} />다시!</> : '시작!'}
        </button>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem' }}>60초 안에 최대한 많이 · 연속으로 맞히면 점수 폭발 ⚡</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      {/* 상단 HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 340, color: '#fff', fontFamily: 'var(--num)' }}>
        <span>⏱ <b style={{ color: time <= 10 ? '#fca5a5' : '#a5f3fc' }}>{time}</b></span>
        <span>⚡ 콤보 <b style={{ color: '#fde68a' }}>{combo}</b></span>
        <span>점수 <b style={{ color: '#a5f3fc' }}>{score}</b></span>
      </div>
      {/* 타임바 */}
      <div style={{ width: '100%', maxWidth: 340, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <div style={{ width: `${(time / DURATION) * 100}%`, height: '100%', background: time <= 10 ? '#ef4444' : 'linear-gradient(90deg,#67e8f9,#22d3ee)', transition: 'width 1s linear' }} />
      </div>

      {/* 문제 */}
      <div className="num-xl" style={{ fontSize: '3rem', color: '#fff', margin: '0.6rem 0', animation: shake ? 'shake .35s' : 'none' }}>
        {prob.a} {prob.op} {prob.b}
      </div>
      <div className="num-xl" style={{ minHeight: 44, fontSize: '2rem', color: '#a5f3fc', letterSpacing: 2 }}>{input || '?'}</div>

      {/* 키패드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} className="candy" onClick={() => press(d)} style={keyStyle}>{d}</button>
        ))}
        <button className="candy" onClick={() => setInput('')} style={{ ...keyStyle, fontSize: '1rem', background: 'linear-gradient(135deg,#94a3b8,#64748b)' }}>지우기</button>
        <button className="candy" onClick={() => press('0')} style={keyStyle}>0</button>
        <button className="candy" onClick={() => submit(input)} style={{ ...keyStyle, background: 'linear-gradient(135deg,#34d399,#10b981)' }}>✓</button>
      </div>
    </div>
  );
}

const keyStyle = {
  width: 72, height: 60, fontSize: '1.6rem', color: '#06343f',
  background: 'linear-gradient(135deg,#e0f2fe,#a5f3fc)', borderRadius: 16,
};
