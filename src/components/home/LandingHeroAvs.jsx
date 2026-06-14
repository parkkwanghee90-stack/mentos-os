/**
 * LandingHeroAvs.jsx — 랜딩 Hero의 AVS 자동재생 플레이어.
 *
 * 요구사항:
 *  - 8단계(문제→P→C→B→Step1~3→정답)를 2.5초마다 자동 전환, 무한 반복
 *  - 일시정지/재생 토글
 *  - "음성 설명 듣기" → 기존 mp3(math-tts) 재생 (heroTts.js, 나중에 단계별 TTS로 교체 가능)
 *  - 모바일: 세로로 크게 / PC: 좌(도형) · 우(단계 카드)
 */
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Square, RotateCcw } from 'lucide-react';
import { BlockMath } from '@/components/KaTeXWrapper';
import 'katex/dist/katex.min.css';
import { HERO_AVS } from '@/data/heroAvs';
import { playHeroTts, stopHeroTts } from '@/lib/heroTts';

const STEP_MS = 2500;

/* ── 도형: 원점 원 + 점 A, 원 위 점 Q가 돌며 중점 P가 자취를 그림 ── */
function HeroFigure({ stepIndex }) {
  const { view, circle, point, locus, showLocusFrom } = HERO_AVS.figure;
  const s = 44; // px per math-unit (균일 스케일 → 정원 유지)
  const W = (view.xmax - view.xmin) * s;
  const H = (view.ymax - view.ymin) * s;
  const sx = (v) => (v - view.xmin) * s;
  const sy = (v) => (view.ymax - v) * s;

  const O = [sx(0), sy(0)];
  const showLocus = stepIndex >= showLocusFrom;

  // 정수 격자
  const grid = [];
  for (let gx = Math.ceil(view.xmin); gx <= view.xmax; gx++)
    grid.push(<line key={`gx${gx}`} x1={sx(gx)} y1={0} x2={sx(gx)} y2={H} stroke="#eef2f7" strokeWidth="1" />);
  for (let gy = Math.ceil(view.ymin); gy <= view.ymax; gy++)
    grid.push(<line key={`gy${gy}`} x1={0} y1={sy(gy)} x2={W} y2={sy(gy)} stroke="#eef2f7" strokeWidth="1" />);

  return (
    <svg className="havs-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="원의 방정식 도형">
      {grid}
      {/* 좌표축 */}
      <line x1={0} y1={sy(0)} x2={W} y2={sy(0)} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={sx(0)} y1={0} x2={sx(0)} y2={H} stroke="#94a3b8" strokeWidth="1.5" />

      {/* 주어진 원 x²+y²=4 */}
      <circle cx={O[0]} cy={O[1]} r={circle.r * s} fill="rgba(59,130,246,0.07)" stroke="#3b82f6" strokeWidth="2.5" />

      {/* 결과(자취) 원 — Step3/정답에서 등장 */}
      {showLocus && (
        <circle cx={sx(locus.cx)} cy={sy(locus.cy)} r={locus.r * s}
          fill="rgba(34,197,94,0.10)" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="6 5" />
      )}

      {/* 점 A(4,0) */}
      <circle cx={sx(point.x)} cy={sy(point.y)} r="5.5" fill="#ef4444" />
      <text x={sx(point.x) + 8} y={sy(point.y) - 8} fill="#ef4444" fontSize="15" fontWeight="700">A(4, 0)</text>

      {/* 원 위를 도는 점 Q + 중점 P (순수 SMIL 회전 → 리렌더 없음) */}
      {/* Q: 원점 기준 회전 */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${O[0]} ${O[1]}`} to={`360 ${O[0]} ${O[1]}`} dur="7s" repeatCount="indefinite" />
        <circle cx={sx(circle.r)} cy={sy(0)} r="5" fill="#3b82f6" />
        <text x={sx(circle.r) + 7} y={sy(0) - 6} fill="#2563eb" fontSize="13" fontWeight="700">Q</text>
      </g>
      {/* P(중점): (2,0) 기준, Q와 동일 각속도 → 반지름1 원(자취)을 그림 */}
      <g>
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${sx(locus.cx)} ${sy(0)}`} to={`360 ${sx(locus.cx)} ${sy(0)}`} dur="7s" repeatCount="indefinite" />
        <circle cx={sx(locus.cx + locus.r)} cy={sy(0)} r="5" fill="#16a34a" />
        <text x={sx(locus.cx + locus.r) + 7} y={sy(0) + 16} fill="#15803d" fontSize="13" fontWeight="700">P</text>
      </g>
    </svg>
  );
}

export default function LandingHeroAvs() {
  const steps = HERO_AVS.steps;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const timer = useRef(null);

  // 자동 전환
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setIdx((p) => (p + 1) % steps.length), STEP_MS);
    return () => clearInterval(timer.current);
  }, [playing, steps.length]);

  // 언마운트 시 음성 정리
  useEffect(() => () => stopHeroTts(), []);

  const toggleVoice = () => {
    if (voiceOn) { stopHeroTts(); setVoiceOn(false); return; }
    setVoiceOn(true);
    playHeroTts(HERO_AVS.ttsPath, { onEnd: () => setVoiceOn(false) });
  };

  const cur = steps[idx];

  return (
    <div className="havs">
      <style>{HAVS_CSS}</style>

      <div className="havs-head">
        <span className="havs-badge">AVS 시각화 풀이</span>
        <span className="havs-unit">{HERO_AVS.unit}</span>
      </div>

      <div className="havs-grid">
        {/* 좌: 문제/도형 */}
        <div className="havs-figure">
          <HeroFigure stepIndex={idx} />
        </div>

        {/* 우: 단계 카드 */}
        <div className="havs-card">
          <div className="havs-tabs">
            {steps.map((s, i) => (
              <button key={s.tag} type="button"
                className={`havs-tab ${i === idx ? 'on' : ''} ${i < idx ? 'done' : ''}`}
                onClick={() => { setIdx(i); setPlaying(false); }} aria-label={`${s.tag} 단계`}>
                {s.tag}
              </button>
            ))}
          </div>

          <div className="havs-step" key={idx}>
            <div className="havs-step-title">
              <span className="havs-step-tag">{cur.tag}</span>{cur.title}
            </div>
            <p className="havs-step-text">{cur.text}</p>
            <div className="havs-step-math"><BlockMath math={cur.latex} /></div>
          </div>

          {idx === steps.length - 1 && (
            <div className="havs-answer">정답 <b>{HERO_AVS.answer}</b></div>
          )}

          <div className="havs-controls">
            <button type="button" className="havs-ctrl" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={16} /> : <Play size={16} />}{playing ? '일시정지' : '재생'}
            </button>
            <button type="button" className="havs-ctrl" onClick={() => { setIdx(0); setPlaying(true); }}>
              <RotateCcw size={15} />처음부터
            </button>
            <button type="button" className={`havs-ctrl voice ${voiceOn ? 'on' : ''}`} onClick={toggleVoice}>
              {voiceOn ? <Square size={14} /> : <Volume2 size={16} />}{voiceOn ? '정지' : '음성 설명 듣기'}
            </button>
          </div>
        </div>
      </div>

      <div className="havs-progress">
        <div className="havs-progress-bar" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
      </div>
    </div>
  );
}

const HAVS_CSS = `
.havs{background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.18);border-radius:20px;
  padding:14px;box-shadow:0 24px 60px -24px rgba(0,0,0,0.7);backdrop-filter:blur(8px);width:100%;max-width:640px;}
.havs-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.havs-badge{font-size:12px;font-weight:800;color:#c4b5fd;background:rgba(139,92,246,0.16);
  border:1px solid rgba(139,92,246,0.3);padding:3px 9px;border-radius:999px;}
.havs-unit{font-size:12px;color:#94a3b8;font-weight:600;}
.havs-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.havs-figure{background:#fff;border-radius:14px;padding:8px;display:flex;align-items:center;justify-content:center;min-height:230px;}
.havs-svg{width:100%;height:auto;display:block;}
.havs-card{display:flex;flex-direction:column;gap:10px;min-width:0;}
.havs-tabs{display:flex;flex-wrap:wrap;gap:4px;}
.havs-tab{font-size:11px;font-weight:700;color:#94a3b8;background:rgba(148,163,184,0.1);
  border:1px solid rgba(148,163,184,0.18);border-radius:7px;padding:3px 7px;cursor:pointer;transition:.18s;}
.havs-tab.done{color:#86efac;border-color:rgba(34,197,94,0.3);}
.havs-tab.on{color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-color:transparent;}
.havs-step{background:rgba(2,6,23,0.4);border:1px solid rgba(148,163,184,0.14);border-radius:12px;
  padding:12px;animation:havsIn .35s ease;min-height:120px;}
@keyframes havsIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.havs-step-title{font-size:14px;font-weight:800;color:#e2e8f0;display:flex;align-items:center;gap:7px;margin-bottom:6px;}
.havs-step-tag{font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);
  padding:2px 7px;border-radius:6px;}
.havs-step-text{font-size:13px;color:#cbd5e1;line-height:1.5;margin:0 0 8px;}
.havs-step-math{background:#fff;border-radius:8px;padding:8px 10px;overflow-x:auto;color:#0f172a;}
.havs-answer{font-size:14px;color:#bbf7d0;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);
  border-radius:10px;padding:8px 12px;font-weight:700;}
.havs-answer b{font-size:18px;color:#22c55e;margin-left:4px;}
.havs-controls{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;}
.havs-ctrl{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:700;color:#e2e8f0;
  background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.22);border-radius:9px;
  padding:7px 11px;cursor:pointer;transition:.18s;}
.havs-ctrl:hover{background:rgba(148,163,184,0.2);}
.havs-ctrl.voice{color:#ddd6fe;border-color:rgba(139,92,246,0.35);background:rgba(139,92,246,0.14);}
.havs-ctrl.voice.on{color:#fff;background:#dc2626;border-color:#dc2626;}
.havs-progress{height:4px;background:rgba(148,163,184,0.15);border-radius:4px;margin-top:12px;overflow:hidden;}
.havs-progress-bar{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;transition:width .4s ease;}
@media (max-width:760px){
  .havs{max-width:100%;}
  .havs-grid{grid-template-columns:1fr;}
  .havs-figure{min-height:260px;}
  .havs-step{min-height:140px;}
  .havs-step-text{font-size:14px;}
}
`;
