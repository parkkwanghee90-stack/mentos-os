// 👁️ 틀린그림찾기 — 레벨↑로 정교해짐.
//  · Lv1~5: 내장 벡터('여학생방', 소품·차이 점증)
//  · Lv6+ : public/spot_levels/manifest.json 에 넣은 "실사 이미지 팩"(A·B 사진 + 차이 좌표) 자동 추가
//    → ChatGPT 등으로 사진 2장 + 좌표 JSON 만들어 폴더에 떨구면 끝.
import { useState, useEffect } from 'react';
import { RotateCcw, Check, ArrowRight } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const VBW = 300, VBH = 230;
const HOTSPOT = {
  clock: { cx: 255, cy: 40, r: 20 }, frame: { cx: 95, cy: 48, r: 22 }, bow: { cx: 176, cy: 96, r: 16 },
  plant: { cx: 272, cy: 148, r: 22 }, cup: { cx: 94, cy: 170, r: 18 }, book: { cx: 170, cy: 50, r: 13 },
  light: { cx: 84, cy: 22, r: 11 }, rug: { cx: 150, cy: 212, r: 26 },
};
const VECTOR_LEVELS = [
  { type: 'vector', detail: 0, diffs: ['clock', 'frame', 'plant'] },
  { type: 'vector', detail: 0, diffs: ['clock', 'frame', 'bow', 'cup'] },
  { type: 'vector', detail: 1, diffs: ['clock', 'frame', 'bow', 'plant', 'cup'] },
  { type: 'vector', detail: 1, diffs: ['clock', 'frame', 'bow', 'plant', 'cup', 'book'] },
  { type: 'vector', detail: 2, diffs: ['frame', 'bow', 'plant', 'cup', 'book', 'light', 'rug'] },
];

function Scene({ detail, on }) {
  const d = (id) => on.has(id);
  return (
    <>
      <defs>
        <linearGradient id="sd-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde4f2" /><stop offset="1" stopColor="#f6d3ec" /></linearGradient>
        <linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe9ff" /><stop offset="1" stopColor="#e7f7ff" /></linearGradient>
      </defs>
      <rect x="0" y="0" width={VBW} height="165" fill="url(#sd-wall)" />
      {detail >= 2 && Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={15 + (i % 6) * 50} cy={36 + Math.floor(i / 6) * 42} r="2.2" fill="#fff" opacity="0.5" />)}
      <rect x="0" y="160" width={VBW} height="70" fill="#e8c9a6" /><rect x="0" y="160" width={VBW} height="6" fill="#d9b487" />
      <ellipse cx="150" cy="212" rx="120" ry="16" fill={d('rug') ? '#a5d8f0' : '#f7b8d8'} opacity="0.55" />
      <path d="M10 14 Q150 30 290 14" stroke="#d9a7c7" strokeWidth="1.5" fill="none" />
      {Array.from({ length: detail >= 1 ? 11 : 9 }).map((_, i) => {
        const x = 20 + i * (detail >= 1 ? 26 : 32); const y = 18 + Math.sin(i) * 3 + (i % 2) * 4;
        const base = ['#fcd34d', '#f9a8d4', '#a7f3d0', '#c4b5fd'][i % 4];
        return <circle key={i} cx={x} cy={y} r="3.4" fill={i === 2 && d('light') ? '#a855f7' : base} />;
      })}
      <rect x="20" y="78" width="62" height="58" rx="6" fill="url(#sd-sky)" stroke="#fff" strokeWidth="4" />
      <line x1="51" y1="78" x2="51" y2="136" stroke="#fff" strokeWidth="3" /><line x1="20" y1="107" x2="82" y2="107" stroke="#fff" strokeWidth="3" />
      <circle cx="68" cy="93" r="7" fill="#fde68a" />
      <rect x="14" y="74" width="12" height="66" rx="5" fill="#f7a8cf" /><rect x="76" y="74" width="12" height="66" rx="5" fill="#f7a8cf" />
      <rect x="78" y="32" width="34" height="32" rx="4" fill="#fff" stroke="#caa6e0" strokeWidth="3" />
      {!d('frame') ? <path d="M90 40 l5 5 5-5 a4 4 0 0 1 0 8 l-10 9 -10-9 a4 4 0 0 1 0-8 z" fill="#f472b6" /> : <path d="M95 38 l3 7 7 1 -5 5 1.5 7 -6.5 -3.5 -6.5 3.5 1.5 -7 -5 -5 7 -1 z" fill="#fbbf24" />}
      {detail >= 1 && <rect x="116" y="36" width="22" height="22" rx="3" fill="#fff" stroke="#caa6e0" strokeWidth="2.5" />}
      {detail >= 1 && <circle cx="127" cy="47" r="6" fill="#a7f3d0" />}
      <circle cx="255" cy="40" r="18" fill="#fff" stroke="#caa6e0" strokeWidth="3" /><circle cx="255" cy="40" r="1.8" fill="#7c3aed" />
      <line x1="255" y1="40" x2="255" y2="29" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />
      {d('clock') ? <line x1="255" y1="40" x2="266" y2="40" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" /> : <line x1="255" y1="40" x2="255" y2="51" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" />}
      <rect x="150" y="58" width={detail >= 1 ? 86 : 70} height="6" rx="2" fill="#d9b487" />
      {['#f9a8d4', '#a7f3d0', '#fcd34d', '#93c5fd', '#c4b5fd', '#fca5a5', '#86efac'].slice(0, detail >= 1 ? 7 : 5).map((c, i) => (
        <rect key={i} x={154 + i * 12} y={42} width="9" height="16" rx="1.5" fill={i === 1 && d('book') ? '#34d399' : c} />
      ))}
      <rect x="60" y="150" width="180" height="12" rx="3" fill="#c98f5e" /><rect x="70" y="162" width="10" height="44" fill="#b97e4f" /><rect x="220" y="162" width="10" height="44" fill="#b97e4f" />
      <ellipse cx="150" cy="112" rx="26" ry="24" fill="#6b4f3a" /><ellipse cx="176" cy="108" rx="9" ry="16" fill="#6b4f3a" />
      <path d="M170 96 l8 -4 0 8 z" fill={d('bow') ? '#22d3ee' : '#f472b6'} /><path d="M182 96 l-8 -4 0 8 z" fill={d('bow') ? '#22d3ee' : '#f472b6'} /><circle cx="176" cy="96" r="2.4" fill={d('bow') ? '#0e7490' : '#be185d'} />
      <circle cx="150" cy="116" r="17" fill="#ffe0c2" /><path d="M133 108 a17 14 0 0 1 34 0 z" fill="#6b4f3a" />
      <circle cx="143" cy="117" r="2" fill="#3b2a1d" /><circle cx="157" cy="117" r="2" fill="#3b2a1d" />
      <circle cx="140" cy="122" r="2.4" fill="#fbb6ce" opacity="0.7" /><circle cx="160" cy="122" r="2.4" fill="#fbb6ce" opacity="0.7" />
      <path d="M146 125 q4 3 8 0" stroke="#c2773f" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M128 150 q22 -18 44 0 z" fill="#f9a8d4" /><rect x="126" y="148" width="48" height="6" rx="3" fill="#ec4899" />
      <g transform="rotate(-8 110 150)"><rect x="92" y="126" width="44" height="30" rx="4" fill="#0f172a" /><rect x="95" y="129" width="38" height="24" rx="2" fill="#1e293b" /><text x="114" y="139" textAnchor="middle" fontSize="6" fill="#a5f3fc" fontFamily="monospace">8 × 3 = ?</text><text x="114" y="149" textAnchor="middle" fontSize="5" fill="#f9a8d4" fontFamily="monospace">멘토스</text></g>
      <rect x="84" y="172" width="20" height="14" rx="3" fill="#fff" stroke="#f472b6" strokeWidth="2" /><rect x="104" y="176" width="6" height="6" rx="3" fill="none" stroke="#f472b6" strokeWidth="2" />
      {!d('cup') && <path d="M90 170 q-3 -5 0 -9 M98 170 q3 -5 0 -9" stroke="#e5e7eb" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      <rect x="262" y="170" width="20" height="16" rx="3" fill="#e08a5b" />
      <path d="M272 170 q-10 -14 -2 -22 q6 6 2 22" fill="#5fb37a" /><path d="M272 170 q10 -14 2 -22 q-6 6 -2 22" fill="#6cc488" /><path d="M272 170 q0 -16 0 -26" stroke="#5fb37a" strokeWidth="3" fill="none" />
      {!d('plant') && <circle cx="272" cy="142" r="5" fill="#f472b6" />}{!d('plant') && <circle cx="272" cy="142" r="2" fill="#fde68a" />}
      {detail >= 2 && <g><ellipse cx="44" cy="205" rx="16" ry="9" fill="#9ca3af" /><circle cx="30" cy="200" r="7" fill="#9ca3af" /><path d="M26 195 l-2 -5 4 3 z M34 195 l2 -5 -4 3 z" fill="#9ca3af" /></g>}
    </>
  );
}

export default function SpotDifference({ onWin }) {
  const [imgLevels, setImgLevels] = useState([]);
  const [level, setLevel] = useState(0);
  const [found, setFound] = useState([]);
  const [miss, setMiss] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // 실사 이미지 팩 로드(폴더에 있으면 상위 레벨로 추가)
  useEffect(() => {
    fetch('/spot_levels/manifest.json').then((r) => r.ok ? r.json() : []).then((list) => {
      if (Array.isArray(list)) setImgLevels(list.filter((x) => x && Array.isArray(x.diffs) && (x.img || (x.a && x.b))).map((x) => ({ type: x.type || (x.img ? 'combo' : 'image'), ...x })));
    }).catch(() => {});
  }, []);

  const LEVELS = [...imgLevels, ...VECTOR_LEVELS]; // 실사 스토리 먼저(Lv1=우는여학생), 그 뒤 벡터
  const cfg = LEVELS[level] || VECTOR_LEVELS[0];
  const total = cfg.diffs.length;
  const cleared = found.length >= total;
  const isLast = level >= LEVELS.length - 1;

  // 클릭 → 차이 판정 (벡터: 뷰박스 좌표 / 이미지: 0~1 비율 좌표)
  const click = (e) => {
    if (cleared) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let hit = -1;
    if (cfg.type === 'vector') {
      const x = ((e.clientX - rect.left) / rect.width) * VBW, y = ((e.clientY - rect.top) / rect.height) * VBH;
      const id = cfg.diffs.find((dd) => !found.includes(dd) && Math.hypot(x - HOTSPOT[dd].cx, y - HOTSPOT[dd].cy) <= HOTSPOT[dd].r);
      hit = id ?? -1;
    } else {
      // 픽셀 기준 정원 판정(이미지가 가로로 넓어 fx,fy 혼용 시 세로로 헛클릭됨) + 25% 여유
      const W = rect.width, H = rect.height;
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const idx = cfg.diffs.findIndex((dd, i) => !found.includes(i) && Math.hypot(px - dd.x * W, py - dd.y * H) <= (dd.r || 0.06) * W * 1.25);
      hit = idx >= 0 ? idx : -1;
    }
    if (hit !== -1) {
      const nf = [...found, hit];
      setFound(nf);
      if (nf.length >= total) {
        const coins = 8 + level * 3;
        try { award({ xp: 15 + level * 5, coins }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: '👁️', title: `Lv.${level + 1} 클리어!`, subtitle: isLast ? '틀린그림 마스터! 🏆' : `+${coins} 코인 · 다음은 더 어려워요!` });
        onWin?.();
      }
    } else { const mx = (e.clientX - rect.left) / rect.width, my = (e.clientY - rect.top) / rect.height; setMiss({ x: mx, y: my }); setTimeout(() => setMiss(null), 450); }
  };

  const next = () => { setLevel((l) => Math.min(LEVELS.length - 1, l + 1)); setFound([]); setRevealed(false); };
  const restart = () => { setLevel(0); setFound([]); setRevealed(false); };
  const Mark = ({ dd, color }) => <span style={{ position: 'absolute', left: `${dd.x * 100}%`, top: `${dd.y * 100}%`, width: `${(dd.r || 0.06) * 200}%`, paddingBottom: `${(dd.r || 0.06) * 200}%`, transform: 'translate(-50%,-50%)', border: `3px solid ${color}`, borderRadius: '50%', pointerEvents: 'none' }} />;

  const FoundMarks = () => (cfg.type === 'vector'
    ? found.map((id) => <circle key={id} cx={HOTSPOT[id].cx} cy={HOTSPOT[id].cy} r={HOTSPOT[id].r} fill="none" stroke="#ef4444" strokeWidth="3" />)
    : null);

  const Img = ({ b }) => {
    if (cfg.type === 'vector') {
      return (
        <svg viewBox={`0 0 ${VBW} ${VBH}`} onClick={click} style={imgStyle(cleared)}>
          <Scene detail={cfg.detail} on={b ? new Set(cfg.diffs) : new Set()} />
          <FoundMarks />
          {miss && b === false && <text x={miss.x * VBW} y={miss.y * VBH} fontSize="16" textAnchor="middle">❌</text>}
        </svg>
      );
    }
    // 이미지 레벨
    return (
      <div onClick={click} style={{ position: 'relative', width: '100%', maxWidth: 330, ...imgStyle(cleared), overflow: 'hidden', padding: 0 }}>
        <img src={b ? cfg.b : cfg.a} alt={b ? 'B' : 'A'} style={{ width: '100%', display: 'block' }} draggable={false} />
        {found.map((i) => { const dd = cfg.diffs[i]; return <span key={i} style={{ position: 'absolute', left: `${dd.x * 100}%`, top: `${dd.y * 100}%`, width: `${(dd.r || 0.06) * 200}%`, paddingBottom: `${(dd.r || 0.06) * 200}%`, transform: 'translate(-50%,-50%)', border: '3px solid #ef4444', borderRadius: '50%', pointerEvents: 'none' }} />; })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.4rem' }}>👁️ 틀린 그림 찾기</div>
      <div className="glass-card" style={{ padding: '0.6rem 1rem', color: '#f1f5f9', fontSize: '0.84rem' }}>
        <b style={{ color: '#c4b5fd' }}>Lv.{level + 1}</b>{(cfg.type === 'image' || cfg.type === 'combo') && <span style={{ color: '#fcd34d' }}> 📷{cfg.title ? cfg.title.replace(/^[0-9]+\.\s*/, '') : '실사'}</span>} · 다른 곳 <b style={{ color: '#f9a8d4' }}>{total}군데</b> · 찾음 <b style={{ color: '#34d399' }}>{found.length}</b>/{total}
      </div>
      {cfg.type === 'combo' ? (
        <>
        <div style={{ color: '#fde68a', fontSize: '0.8rem', fontFamily: 'var(--jua)' }}>👉 오른쪽 그림에서 다른 곳을 누르세요</div>
        <div onClick={click} style={{ position: 'relative', width: '100%', maxWidth: 560, ...imgStyle(cleared), padding: 0, overflow: 'hidden' }}>
          <img src={cfg.img} alt="puzzle" style={{ width: '100%', display: 'block' }} draggable={false} />
          {found.map((i) => <Mark key={i} dd={cfg.diffs[i]} color="#ef4444" />)}
          {revealed && cfg.diffs.map((dd, i) => (found.includes(i) ? null : <Mark key={`r${i}`} dd={dd} color="#fbbf24" />))}
        </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontFamily: 'var(--jua)', marginBottom: 4 }}>그림 A</div><Img b={false} /></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: '#fff', fontFamily: 'var(--jua)', marginBottom: 4 }}>그림 B</div><Img b /></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="candy" onClick={restart} style={ctrl}><RotateCcw size={15} /> Lv.1부터</button>
        {cfg.type === 'combo' && !cleared && <button className="candy" onClick={() => setRevealed((v) => !v)} style={ctrl}>💡 정답 보기</button>}
        {cleared && !isLast && <button className="candy" onClick={next} style={{ ...ctrl, background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}>다음 레벨 <ArrowRight size={15} /></button>}
      </div>
      {cleared && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#f9a8d4" /> <b>{isLast ? '마스터! 모든 레벨 클리어 🏆' : `Lv.${level + 1} 클리어! 다음 레벨로`}</b>
        </div>
      )}
    </div>
  );
}

const imgStyle = (cleared) => ({ width: '100%', maxWidth: 330, borderRadius: 16, border: '3px solid rgba(255,255,255,0.35)', cursor: cleared ? 'default' : 'crosshair', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', background: '#fde4f2' });
const ctrl = { display: 'flex', alignItems: 'center', gap: 5, padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#fff', background: 'rgba(255,255,255,0.18)', borderRadius: 14, boxShadow: '0 4px 0 rgba(0,0,0,0.2)' };
