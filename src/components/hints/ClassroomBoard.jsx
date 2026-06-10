/**
 * ClassroomBoard.jsx — 교실 칠판 AVS 플레이어 (내신 완벽대비 풀코스 전용)
 *
 * 진짜 학교 녹색 칠판 위에 선생님이 분필로 단계별 풀이를 써내려가는 컨셉.
 * 공유 컴포넌트(GeometryHintPlayer/AlgebraHintPlayer/HintPlayerRouter)는 건드리지 않는다.
 *
 * props:
 *   steps:  [{ phase:'P'|'C'|'B'|'S'|'A', title, content }]  // PCBSA AVS 단계
 *   answer: string|number                                     // 최종 정답 (있으면 마지막에 표시)
 *   onSpeak?: () => void   speaking?: boolean                 // 외부 TTS 토글(선택)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, StepForward, StepBack, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';
import ProblemFigure from '@/components/ProblemFigure';

// PCBSA 단계 메타 — 분필색 배지
const PHASE = {
  P: { label: '목표', chalk: '#fde68a', glyph: '◎' }, // 노랑 분필
  C: { label: '조건', chalk: '#7dd3fc', glyph: '▤' }, // 파랑 분필
  B: { label: '개념', chalk: '#f9a8d4', glyph: '✦' }, // 분홍 분필
  S: { label: '풀이', chalk: '#bef264', glyph: '➜' }, // 연두 분필
  A: { label: '정답', chalk: '#fca5a5', glyph: '★' }, // 빨강 분필
};

// 칠판용 경량 수식+한글 혼합 렌더러.
// 깨끗한 $...$ / $$...$$ 구분자만 처리한다(AVS 본문은 이 규약을 따름).
function ChalkText({ text }) {
  if (!text) return null;
  const str = String(text);
  // $$블록$$ 과 $인라인$ 토큰화
  const tokens = str.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g).filter(Boolean);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('$$') && tok.endsWith('$$')) {
          const m = tok.slice(2, -2).trim();
          return (
            <span key={i} className="cb-mathblock">
              <BlockMath math={m} errorColor="#cbd5e1"
                renderError={() => <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{m}</span>} />
            </span>
          );
        }
        if (tok.startsWith('$') && tok.endsWith('$') && tok.length > 2) {
          const m = tok.slice(1, -1).trim();
          return (
            <InlineMath key={i} math={m} errorColor="#e2e8f0"
              renderError={() => <span style={{ fontFamily: 'monospace', color: '#e2e8f0' }}>{m}</span>} />
          );
        }
        // 일반 텍스트: 줄바꿈 보존
        return tok.split(/\n/).map((line, li, arr) => (
          <React.Fragment key={`${i}-${li}`}>
            {line}
            {li < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </>
  );
}

// 단계 데이터 정규화: {phase,title,content} 객체 / 평문 문자열 배열 둘 다 지원
const PHASE_SEQ = ['P', 'C', 'B', 'S', 'A'];
function normalizeSteps(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const n = arr.length;
  return arr.map((s, i) => {
    if (s && typeof s === 'object') {
      return { phase: s.phase, title: s.title, content: s.content ?? s.text ?? '' };
    }
    // 평문 문자열 → 위치 기반 PCBSA 매핑
    let phase;
    if (n === 5) phase = PHASE_SEQ[i];
    else if (i === 0) phase = 'P';
    else if (i === n - 1) phase = 'A';
    else if (i === 1) phase = 'C';
    else if (i === 2) phase = 'B';
    else phase = 'S';
    return { phase, title: '', content: String(s ?? '') };
  }).filter(s => s.content || s.title);
}

export default function ClassroomBoard({ steps: rawSteps = [], answer, onSpeak, speaking, figure = null }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const bodyRef = useRef(null);

  const steps = useMemo(() => normalizeSteps(rawSteps), [rawSteps]);
  const total = steps.length;
  useEffect(() => { setStep(0); setPlaying(false); }, [total, steps]);

  // 자동재생: 단계 자동 전진
  useEffect(() => {
    if (!playing) return;
    if (step >= total - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => Math.min(total - 1, s + 1)), 3800 / speed);
    return () => clearTimeout(t);
  }, [playing, step, total, speed]);

  // 새 단계가 써지면 맨 아래로 스크롤(선생님이 방금 쓴 줄로 시선 이동)
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [step]);

  if (!total) return null;

  const go = (d) => setStep(s => Math.max(0, Math.min(total - 1, s + d)));
  const play = () => { if (step >= total - 1) { setStep(0); setPlaying(true); } else setPlaying(p => !p); };

  const visible = steps.slice(0, step + 1);
  const atEnd = step >= total - 1;

  return (
    <div className="cb-wrap">
      {/* 도형(figure)이 있으면 칠판 상단에 함께 표시 — AVS 도형렌더러 */}
      {figure?.objects?.length > 0 && (
        <div style={{ marginBottom: 10 }}><ProblemFigure figure={figure} height={240} /></div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Nanum+Pen+Script&display=swap');

        .cb-wrap {
          --frame:#6b4423; --frame-lo:#3f2713; --board:#1f3b30; --board-lo:#162c23;
          --chalk:#f4f6f3; --dust:rgba(244,246,243,0.06);
          font-family:'Gaegu','Nanum Pen Script',system-ui,sans-serif;
          margin-top:1rem; border-radius:18px; position:relative;
          padding:14px; background:linear-gradient(160deg,var(--frame),var(--frame-lo));
          box-shadow:0 18px 40px -12px rgba(0,0,0,.6), inset 0 2px 4px rgba(255,255,255,.18);
        }
        /* 나무 프레임 결 */
        .cb-wrap::before{content:'';position:absolute;inset:0;border-radius:18px;pointer-events:none;
          background:repeating-linear-gradient(95deg,rgba(0,0,0,.10) 0 2px,transparent 2px 9px);
          mix-blend-mode:multiply;opacity:.5;}

        .cb-board{position:relative;border-radius:10px;padding:1.25rem 1.25rem 0;
          background:radial-gradient(120% 120% at 30% 10%,var(--board),var(--board-lo));
          box-shadow:inset 0 0 60px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.04);
          overflow:hidden;}
        /* 분필 가루 텍스처 */
        .cb-board::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:10px;
          background:
            radial-gradient(circle at 18% 28%,var(--dust) 0 1px,transparent 1px),
            radial-gradient(circle at 72% 62%,var(--dust) 0 1px,transparent 1px),
            radial-gradient(circle at 45% 85%,var(--dust) 0 1px,transparent 1px);
          background-size:13px 13px,17px 17px,11px 11px;opacity:.7;}

        .cb-head{display:flex;align-items:center;justify-content:space-between;gap:8px;
          margin-bottom:.8rem;position:relative;z-index:1;}
        .cb-title{font-family:'Gaegu',sans-serif;font-weight:700;color:var(--chalk);
          font-size:1.35rem;letter-spacing:.5px;display:flex;align-items:center;gap:8px;
          text-shadow:0 0 6px rgba(255,255,255,.18);}
        .cb-title .dot{width:9px;height:9px;border-radius:50%;background:#fca5a5;
          box-shadow:0 0 8px #fca5a5;}
        .cb-spk{font-family:'Gaegu',sans-serif;border:1px dashed rgba(244,246,243,.45);
          background:transparent;color:var(--chalk);border-radius:9px;padding:5px 11px;
          cursor:pointer;font-size:.95rem;display:flex;align-items:center;gap:5px;}
        .cb-spk:hover{background:rgba(244,246,243,.08);}

        .cb-body{position:relative;z-index:1;max-height:60vh;overflow-y:auto;
          padding-bottom:.6rem;scrollbar-width:thin;scrollbar-color:rgba(244,246,243,.25) transparent;}
        .cb-body::-webkit-scrollbar{width:6px;}
        .cb-body::-webkit-scrollbar-thumb{background:rgba(244,246,243,.22);border-radius:3px;}

        .cb-step{position:relative;padding:.55rem 0 .9rem 0;
          border-bottom:1px dashed rgba(244,246,243,.10);
          animation:cb-write .5s ease both;}
        .cb-step:last-child{border-bottom:none;}
        @keyframes cb-write{from{opacity:0;transform:translateY(6px);filter:blur(2px);}
          to{opacity:1;transform:none;filter:none;}}

        .cb-chip{display:inline-flex;align-items:center;gap:6px;font-family:'Gaegu',sans-serif;
          font-weight:700;font-size:1.02rem;padding:2px 12px 3px;border-radius:999px;
          border:1.5px solid currentColor;margin-bottom:.5rem;
          text-shadow:0 0 5px rgba(0,0,0,.3);}
        .cb-steptitle{color:var(--chalk);font-size:1.18rem;font-weight:700;margin-bottom:.25rem;
          font-family:'Gaegu',sans-serif;opacity:.96;}
        .cb-content{color:var(--chalk);font-size:1.18rem;line-height:1.85;
          font-family:'Gaegu','Nanum Pen Script',sans-serif;opacity:.95;}
        /* 칠판 위 수식: 분필 흰색, 살짝 발광 */
        .cb-content .katex{color:var(--chalk)!important;font-size:1.04em;}
        .cb-mathblock{display:block;margin:.35rem 0;overflow-x:auto;}
        .cb-mathblock .katex-display{margin:.25rem 0;}

        .cb-answer{margin-top:.6rem;display:flex;align-items:center;gap:10px;flex-wrap:wrap;
          padding:.7rem 1rem;border:2px solid rgba(252,165,165,.55);border-radius:12px;
          background:rgba(252,165,165,.08);animation:cb-write .5s ease both;}
        .cb-answer .lbl{font-family:'Gaegu',sans-serif;font-weight:700;color:#fca5a5;font-size:1.2rem;}
        .cb-answer .val{font-family:'Gaegu',sans-serif;color:var(--chalk);font-size:1.4rem;font-weight:700;}

        /* 분필 트레이 + 분필 조각 */
        .cb-tray{position:relative;z-index:1;display:flex;align-items:center;gap:8px;
          margin-top:10px;padding:8px 12px;border-radius:0 0 10px 10px;
          background:linear-gradient(180deg,#5a3a1e,#2e1c0e);
          box-shadow:inset 0 3px 6px rgba(0,0,0,.5);}
        .cb-chalk-piece{height:7px;border-radius:4px;opacity:.9;
          box-shadow:0 1px 1px rgba(0,0,0,.4);}

        .cb-ctrl{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto;}
        .cb-btn{font-family:'Gaegu',sans-serif;background:rgba(244,246,243,.10);color:var(--chalk);
          border:1px solid rgba(244,246,243,.25);border-radius:9px;padding:5px 11px;cursor:pointer;
          display:flex;align-items:center;gap:4px;font-size:.95rem;font-weight:700;white-space:nowrap;}
        .cb-btn:hover:not(:disabled){background:rgba(244,246,243,.2);}
        .cb-btn:disabled{opacity:.4;cursor:default;}
        .cb-step-n{font-family:'Gaegu',sans-serif;color:#fde68a;font-weight:700;min-width:64px;
          text-align:center;font-size:1.02rem;}

        @media (max-width:768px){
          .cb-board{padding:.9rem .9rem 0;}
          .cb-title{font-size:1.12rem;}
          .cb-steptitle,.cb-content{font-size:1.05rem;}
          .cb-tray{flex-wrap:wrap;gap:6px;}
          .cb-step-n{min-width:52px;font-size:.9rem;}
          .cb-btn{padding:5px 9px;font-size:.88rem;}
        }
      `}</style>

      <div className="cb-board">
        <div className="cb-head">
          <div className="cb-title"><span className="dot" /> AVS 풀이 칠판</div>
          {onSpeak && (
            <button className="cb-spk" onClick={onSpeak}>
              {speaking ? <><VolumeX size={16} /> 정지</> : <><Volume2 size={16} /> 선생님 설명</>}
            </button>
          )}
        </div>

        <div className="cb-body" ref={bodyRef}>
          {visible.map((s, i) => {
            const ph = PHASE[s.phase] || { label: '', chalk: '#f4f6f3', glyph: '·' };
            return (
              <div className="cb-step" key={i}>
                {(s.phase || s.title) && (
                  <div className="cb-chip" style={{ color: ph.chalk }}>
                    <span>{ph.glyph}</span>{ph.label || s.phase}
                  </div>
                )}
                {s.title && <div className="cb-steptitle"><ChalkText text={s.title} /></div>}
                {s.content && <div className="cb-content"><ChalkText text={s.content} /></div>}
              </div>
            );
          })}
          {atEnd && (answer !== undefined && answer !== null && String(answer).length > 0) && (
            <div className="cb-answer">
              <span className="lbl">★ 정답</span>
              <span className="val"><ChalkText text={String(answer)} /></span>
            </div>
          )}
        </div>
      </div>

      {/* 분필 트레이 + 컨트롤 */}
      <div className="cb-tray">
        {['#f4f6f3', '#fde68a', '#fca5a5'].map((c, i) => (
          <span key={i} className="cb-chalk-piece" style={{ background: c, width: 26 + i * 6 }} />
        ))}
        <div className="cb-ctrl">
          <button className="cb-btn" onClick={() => { setStep(0); setPlaying(false); }} title="처음"><RotateCcw size={14} /></button>
          <button className="cb-btn" onClick={() => go(-1)} disabled={step === 0}><StepBack size={14} /> 이전</button>
          <span className="cb-step-n">{step + 1} / {total}</span>
          <button className="cb-btn" onClick={() => go(1)} disabled={atEnd}>다음 <StepForward size={14} /></button>
          <button className="cb-btn" onClick={play}>
            {playing ? <><Pause size={14} /> 정지</> : <><Play size={14} /> 재생</>}
          </button>
          <button className="cb-btn" onClick={() => setSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))} title="속도">{speed}x</button>
        </div>
      </div>
    </div>
  );
}
