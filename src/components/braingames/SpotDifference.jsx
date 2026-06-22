// 👁️ 틀린그림찾기 — '매쓰멘토스 푸는 여학생방'(파스텔 코지룸) 두 그림에서 다른 곳 5군데 찾기.
// 전부 인라인 SVG(래스터 없음). variant B에서 5곳을 바꾸고, 탭 좌표를 핫스팟과 대조.
import { useState } from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const VBW = 300, VBH = 230;
// 다른 곳 핫스팟(뷰박스 좌표, 반경)
const DIFFS = [
  { id: 'clock', cx: 255, cy: 40, r: 22 },   // 시계 바늘 방향
  { id: 'frame', cx: 95, cy: 48, r: 22 },    // 액자: 하트 vs 별
  { id: 'bow', cx: 150, cy: 118, r: 18 },    // 머리 리본 색
  { id: 'plant', cx: 272, cy: 168, r: 24 },  // 화분: 꽃 유무
  { id: 'cup', cx: 95, cy: 182, r: 20 },     // 찻잔: 김 유무
];

function Scene({ b }) {
  return (
    <>
      <defs>
        <linearGradient id="sd-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde4f2" /><stop offset="1" stopColor="#f6d3ec" />
        </linearGradient>
        <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe9ff" /><stop offset="1" stopColor="#e7f7ff" />
        </linearGradient>
        <radialGradient id="sd-lamp" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fff6c8" /><stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 벽 / 바닥 */}
      <rect x="0" y="0" width={VBW} height="165" fill="url(#sd-wall)" />
      <rect x="0" y="160" width={VBW} height="70" fill="#e8c9a6" />
      <rect x="0" y="160" width={VBW} height="6" fill="#d9b487" />
      {/* 러그 */}
      <ellipse cx="150" cy="212" rx="120" ry="16" fill="#f7b8d8" opacity="0.55" />

      {/* 꼬마전구 줄 */}
      <path d="M10 14 Q150 30 290 14" stroke="#d9a7c7" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 9 }).map((_, i) => {
        const x = 20 + i * 32; const y = 18 + Math.sin(i) * 3 + (i % 2) * 4;
        return <circle key={i} cx={x} cy={y} r="3.4" fill={['#fcd34d', '#f9a8d4', '#a7f3d0', '#c4b5fd'][i % 4]} />;
      })}

      {/* 창문 + 커튼 */}
      <rect x="20" y="78" width="62" height="58" rx="6" fill="url(#sd-sky)" stroke="#fff" strokeWidth="4" />
      <line x1="51" y1="78" x2="51" y2="136" stroke="#fff" strokeWidth="3" />
      <line x1="20" y1="107" x2="82" y2="107" stroke="#fff" strokeWidth="3" />
      <circle cx="68" cy="93" r="7" fill="#fde68a" />
      <rect x="14" y="74" width="12" height="66" rx="5" fill="#f7a8cf" />
      <rect x="76" y="74" width="12" height="66" rx="5" fill="#f7a8cf" />

      {/* 액자 (DIFF: 하트 A / 별 B) */}
      <rect x="78" y="32" width="34" height="32" rx="4" fill="#fff" stroke="#caa6e0" strokeWidth="3" />
      {b ? (
        <path d="M95 40 l5 5 5-5 a4 4 0 0 1 0 8 l-10 9 -10-9 a4 4 0 0 1 0-8 z" fill="#f472b6" transform="translate(-5 0)" />
      ) : (
        <path d="M95 38 l3 7 7 1 -5 5 1.5 7 -6.5 -3.5 -6.5 3.5 1.5 -7 -5 -5 7 -1 z" fill="#fbbf24" />
      )}

      {/* 벽시계 (DIFF: 바늘 방향) */}
      <circle cx="255" cy="40" r="18" fill="#fff" stroke="#caa6e0" strokeWidth="3" />
      <circle cx="255" cy="40" r="1.8" fill="#7c3aed" />
      <line x1="255" y1="40" x2="255" y2="29" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />
      {b
        ? <line x1="255" y1="40" x2="266" y2="40" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />
        : <line x1="255" y1="40" x2="255" y2="51" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />}

      {/* 책꽂이 선반 + 책 */}
      <rect x="150" y="58" width="70" height="6" rx="2" fill="#d9b487" />
      {['#f9a8d4', '#a7f3d0', '#fcd34d', '#93c5fd', '#c4b5fd'].map((c, i) => (
        <rect key={i} x={154 + i * 12} y={42} width="9" height="16" rx="1.5" fill={c} />
      ))}

      {/* 책상 */}
      <rect x="60" y="150" width="180" height="12" rx="3" fill="#c98f5e" />
      <rect x="70" y="162" width="10" height="44" fill="#b97e4f" />
      <rect x="220" y="162" width="10" height="44" fill="#b97e4f" />

      {/* 여학생 */}
      {/* 머리 뒤 */}
      <ellipse cx="150" cy="112" rx="26" ry="24" fill="#6b4f3a" />
      {/* 묶은 머리 */}
      <ellipse cx="176" cy="108" rx="9" ry="16" fill="#6b4f3a" />
      {/* 리본 (DIFF: 색) */}
      <path d="M170 96 l8 -4 0 8 z" fill={b ? '#22d3ee' : '#f472b6'} />
      <path d="M182 96 l-8 -4 0 8 z" fill={b ? '#22d3ee' : '#f472b6'} />
      <circle cx="176" cy="96" r="2.4" fill={b ? '#0e7490' : '#be185d'} />
      {/* 얼굴 */}
      <circle cx="150" cy="116" r="17" fill="#ffe0c2" />
      <path d="M133 108 a17 14 0 0 1 34 0 z" fill="#6b4f3a" />
      <circle cx="143" cy="117" r="2" fill="#3b2a1d" /><circle cx="157" cy="117" r="2" fill="#3b2a1d" />
      <circle cx="140" cy="122" r="2.4" fill="#fbb6ce" opacity="0.7" /><circle cx="160" cy="122" r="2.4" fill="#fbb6ce" opacity="0.7" />
      <path d="M146 125 q4 3 8 0" stroke="#c2773f" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* 상체 */}
      <path d="M128 150 q22 -18 44 0 z" fill="#f9a8d4" />
      <rect x="126" y="148" width="48" height="6" rx="3" fill="#ec4899" />

      {/* 태블릿(매쓰멘토스 화면) */}
      <g transform="rotate(-8 110 150)">
        <rect x="92" y="126" width="44" height="30" rx="4" fill="#0f172a" />
        <rect x="95" y="129" width="38" height="24" rx="2" fill="#1e293b" />
        <text x="114" y="139" textAnchor="middle" fontSize="6" fill="#a5f3fc" fontFamily="monospace">8 × 3 = ?</text>
        <text x="114" y="149" textAnchor="middle" fontSize="5" fill="#f9a8d4" fontFamily="monospace">멘토스</text>
      </g>

      {/* 찻잔 (DIFF: 김) */}
      <rect x="84" y="172" width="20" height="14" rx="3" fill="#fff" stroke="#f472b6" strokeWidth="2" />
      <rect x="104" y="176" width="6" height="6" rx="3" fill="none" stroke="#f472b6" strokeWidth="2" />
      {!b && (
        <path d="M90 170 q-3 -5 0 -9 M98 170 q3 -5 0 -9" stroke="#e5e7eb" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}

      {/* 화분 (DIFF: 꽃) */}
      <rect x="262" y="170" width="20" height="16" rx="3" fill="#e08a5b" />
      <path d="M272 170 q-10 -14 -2 -22 q6 6 2 22" fill="#5fb37a" />
      <path d="M272 170 q10 -14 2 -22 q-6 6 -2 22" fill="#6cc488" />
      <path d="M272 170 q0 -16 0 -26" stroke="#5fb37a" strokeWidth="3" fill="none" />
      {!b && <circle cx="272" cy="142" r="5" fill="#f472b6" />}
      {!b && <circle cx="272" cy="142" r="2" fill="#fde68a" />}
    </>
  );
}

export default function SpotDifference({ onWin }) {
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(null);
  const [round, setRound] = useState(0);
  const won = found.length >= DIFFS.length;

  const click = (e) => {
    if (won) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * VBW;
    const y = ((e.clientY - rect.top) / rect.height) * VBH;
    const hit = DIFFS.find((d) => !found.includes(d.id) && Math.hypot(x - d.cx, y - d.cy) <= d.r);
    if (hit) {
      const nf = [...found, hit.id];
      setFound(nf);
      if (nf.length >= DIFFS.length) {
        try { award({ xp: 25, coins: 12 }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '👁️', title: '5군데 다 찾았다!', subtitle: '+12 코인 · 관찰력 최고!' });
        onWin?.();
      }
    } else {
      setMiss({ x, y, t: round }); setTimeout(() => setMiss(null), 500);
    }
  };

  const reset = () => { setFound([]); setRound((r) => r + 1); };

  const Img = ({ b }) => (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} onClick={click}
      style={{ width: '100%', maxWidth: 330, borderRadius: 16, border: '3px solid rgba(255,255,255,0.35)', cursor: won ? 'default' : 'crosshair', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', background: '#fde4f2' }}>
      <Scene b={b} />
      {found.map((id) => { const d = DIFFS.find((x) => x.id === id); return <circle key={id} cx={d.cx} cy={d.cy} r={d.r} fill="none" stroke="#ef4444" strokeWidth="3" />; })}
      {miss && <text x={miss.x} y={miss.y} fontSize="16" textAnchor="middle">❌</text>}
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>👁️ 틀린 그림 찾기</div>
      <div className="glass-card" style={{ padding: '0.6rem 1rem', color: '#f1f5f9', fontSize: '0.84rem' }}>
        두 그림에서 <b style={{ color: '#f9a8d4' }}>다른 곳 5군데</b>를 찾아 탭하세요! · 찾은 곳 <b style={{ color: '#34d399' }}>{found.length}</b> / 5
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontFamily: 'var(--jua)', marginBottom: 4 }}>그림 A</div><Img b={false} /></div>
        <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontFamily: 'var(--jua)', marginBottom: 4 }}>그림 B</div><Img b /></div>
      </div>

      <button className="candy" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1.1rem', color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 14, fontSize: '0.88rem' }}>
        <RotateCcw size={16} /> 다시
      </button>

      {won && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#f9a8d4" /> <b>5군데 완성! +12 코인</b>
        </div>
      )}
    </div>
  );
}
