/**
 * AlgebraHintPlayer.jsx — 해설 이미지 Pan-and-Scan 플레이어
 * 
 * 해설 이미지(001a.webp 등)를 단계에 따라 위→아래로 스크롤하며 보여줍니다.
 * 가짜 텍스트 해설 없음. 실제 해설 이미지 그대로 보여줌.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ── CJS prop-types require 런타임 크래시 회피용 커스텀 KaTeX 컴포넌트 (main #8a6e8a4) ──
function BlockMath({ math, errorColor }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, { displayMode: true, throwOnError: false, errorColor: errorColor || '#cbd5e1' });
      } catch (e) {
        ref.current.textContent = math;
      }
    }
  }, [math, errorColor]);
  return <div ref={ref} />;
}
function InlineMath({ math, errorColor }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, { displayMode: false, throwOnError: false, errorColor: errorColor || '#94a3b8' });
      } catch (e) {
        ref.current.textContent = math;
      }
    }
  }, [math, errorColor]);
  return <span ref={ref} />;
}

export default function AlgebraHintPlayer({ data }) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [imgNaturalH, setImgNaturalH] = useState(0);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  if (!data || !data.steps) return null;
  const steps = data.steps;
  const totalSteps = steps.length;

  // 해설 이미지 URL (steps에서 a.webp 찾기)
  const solutionImg = steps.find(s => s.picture?.endsWith('a.webp'))?.picture || null;
  // 문제 이미지 URL
  const problemImg = steps.find(s => s.picture && !s.picture.endsWith('a.webp'))?.picture || null;

  // 현재 단계의 스크롤 퍼센트 (0~100)
  const pct = steps[step]?.focus_point?.[1] ?? Math.round((step / (totalSteps - 1)) * 100);

  // 이미지 실제 픽셀 높이 기반 스크롤 위치 계산
  const getScrollTop = useCallback(() => {
    const containerH = containerRef.current?.clientHeight || 480;
    const imgH = imgNaturalH > 0
      ? imgRef.current?.clientHeight || imgNaturalH
      : (imgRef.current?.clientHeight || 0);
    const scrollable = Math.max(0, imgH - containerH);
    return -(scrollable * pct / 100);
  }, [pct, imgNaturalH]);

  // 자동 재생
  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => {
      if (step < totalSteps - 1) setStep(s => s + 1);
      else { setIsPlaying(false); }
    }, 3000 / playbackSpeed);
    return () => clearTimeout(t);
  }, [isPlaying, step, totalSteps, playbackSpeed]);

  const handlePlay = () => {
    if (step >= totalSteps - 1) { setStep(0); setIsPlaying(true); }
    else setIsPlaying(v => !v);
  };

  const chalkYellow = '#fde047';
  const dark = '#11402e';
  const darkCard = '#1c5640';

  return (
    <div style={{ background: dark, borderRadius: 16, overflow: 'hidden', border: '6px solid #475569', boxShadow: 'inset 0 0 24px rgba(0,0,0,0.45)' }}>

      {/* 헤더 */}
      <div style={{ background: darkCard, padding: '0.7rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '1.15rem' }}>AVS 풀이</span>
          <span style={{ background: 'rgba(52,211,153,0.18)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 'bold', border: '1px solid rgba(52,211,153,0.4)', letterSpacing: '0.5px' }}>Beta</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => { setStep(0); setIsPlaying(false); }} style={btnS('#334155')}><RotateCcw size={13} /> 다시 보기</button>
        </div>
      </div>

      {/* 진행 바 */}
      <div style={{ display: 'flex', gap: 2, padding: '0.4rem 0.8rem', background: '#0a0f1a' }}>
        {steps.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 6, borderRadius: 3, cursor: 'pointer',
            background: i <= step ? chalkYellow : '#1e293b',
            transition: 'background 0.25s',
          }} />
        ))}
      </div>

      {/* 단계 표시 */}
      <div style={{ padding: '0.3rem 1rem', background: '#0a0f1a', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.85rem', background: '#1e293b', padding: '2px 10px', borderRadius: 20 }}>
          {step + 1} / {totalSteps}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
          해설 이미지를 단계별로 스크롤합니다
        </span>
      </div>

      {/* 핵심: 해설 이미지 Pan & Scan 뷰어 */}
      {solutionImg ? (
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '500px',
            background: '#ffffff',
            margin: '0.5rem',
            borderRadius: 8,
            border: '2px solid #334155',
          }}
        >
          {/* 빨간 위치 마커 (우측 스크롤바처럼) */}
          <div style={{
            position: 'absolute', right: 0, top: `${pct}%`,
            width: 5, height: 40, background: '#dc2626', zIndex: 20,
            borderRadius: '3px 0 0 3px',
            transform: 'translateY(-50%)',
            transition: 'top 0.8s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: '0 0 10px rgba(220,38,38,0.9)',
          }} />

          {/* 해설 이미지 */}
          <img
            ref={imgRef}
            src={solutionImg}
            alt="해설"
            onLoad={(e) => setImgNaturalH(e.target.naturalHeight)}
            style={{
              width: '100%',
              position: 'absolute',
              left: 0,
              top: `${getScrollTop()}px`,
              transition: 'top 0.8s cubic-bezier(0.4,0,0.2,1)',
              display: 'block',
            }}
          />

          {/* 단계 숫자 오버레이 */}
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 10,
            background: 'rgba(220,38,38,0.92)', color: '#fff',
            borderRadius: 8, padding: '4px 12px',
            fontWeight: 700, fontSize: '0.9rem',
          }}>
            {step + 1}단계
          </div>
        </div>
      ) : (steps[step]?.latex || steps[step]?.lines?.length) ? (
        /* 이미지가 없는 텍스트/LaTeX 형식 해설(type:'algebra')은 단계별 수식 카드로 렌더 */
        <div style={{ margin: '0.5rem', background: darkCard, borderRadius: 8, border: '1px solid #334155', padding: '1.1rem 1.2rem', minHeight: 220, color: '#e2e8f0', maxWidth: '100%', overflowX: 'hidden', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          {steps[step]?.label && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: chalkYellow, fontWeight: 700, fontSize: '0.98rem', marginBottom: '0.7rem' }}>
              <span style={{ color: chalkYellow, fontSize: '0.95em' }}>✦</span>
              {steps[step].label}
            </div>
          )}
          <div style={{ border: '1px solid rgba(253,224,71,0.28)', borderRadius: '12px', padding: '0.9rem 1.1rem', background: 'rgba(0,0,0,0.18)', color: '#f8fafc', lineHeight: 1.9 }}>
            {steps[step]?.latex && <RichSolutionText text={steps[step].latex} />}
            {steps[step]?.lines?.map((ln, i) => (
              <RichSolutionText key={i} text={typeof ln === 'string' ? ln : (ln?.content || '')} />
            ))}
          </div>
          {step === totalSteps - 1 && (data.finalAnswer || data.correctAnswer) && (
            <div style={{ marginTop: '1.1rem', padding: '0.7rem 1rem', background: '#0a0f1a', borderRadius: 8, border: `1px solid ${chalkYellow}55`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ color: chalkYellow, fontWeight: 700 }}>정답</span>
              <RichSolutionText text={String(data.finalAnswer || data.correctAnswer)} />
            </div>
          )}
        </div>
      ) : (
        /* 최고급 텍스트 스크롤링 뷰포트 (이미지 분실/텍스트 전용 대비 최고급 폴백) */
        <div style={{
          height: '480px',
          overflowY: 'auto',
          background: '#0b1329',
          margin: '0.5rem',
          borderRadius: 8,
          border: '2px solid #334155',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
          color: '#f8fafc',
          textAlign: 'left'
        }}>
          {steps.map((s, idx) => (
            <div key={idx} style={{
              background: idx === step ? '#1e293b' : idx < step ? '#0f172a' : 'transparent',
              border: `1px solid ${idx === step ? chalkYellow : 'transparent'}`,
              opacity: idx <= step ? 1 : 0.3,
              padding: '0.8rem 1rem',
              borderRadius: 8,
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: idx === step ? chalkYellow : '#94a3b8', marginBottom: '0.3rem' }}>
                {s.label || `${idx + 1}단계`}
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#f8fafc', wordBreak: 'keep-all' }}>
                {s.latex ? (
                  <div className="avs-katex-block" style={{ margin: '0.4rem 0', overflowX: 'auto', maxWidth: '100%' }}>
                    <BlockMath math={s.latex.replace(/\\\\/g, '\\\\\n')} errorColor="#cbd5e1" />
                  </div>
                ) : (
                  s.text || s.caption || s.content || ''
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 하단 컨트롤 바: 단계 이동 · 풀이 컨트롤 (lecture.png 정합) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', padding: '0.8rem 1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>단계 이동</span>
          <button onClick={() => { setStep(0); setIsPlaying(false); }} style={btnS('#334155')}>처음</button>
          <button onClick={() => step > 0 && setStep(s => s - 1)} style={btnS('#334155')} disabled={step === 0}><ChevronLeft size={13} /> 이전</button>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fde047', fontSize: '0.85rem', minWidth: 56, textAlign: 'center' }}>STEP {step + 1} / {totalSteps}</span>
          <button onClick={() => step < totalSteps - 1 && setStep(s => s + 1)} style={btnS('#334155')} disabled={step === totalSteps - 1}>다음 <ChevronRight size={13} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>풀이 컨트롤</span>
          <button onClick={handlePlay} style={btnS(isPlaying ? '#7c3aed' : '#7c3aed')}>
            {isPlaying ? <><Pause size={13} /> 정지</> : <><Play size={13} /> 재생</>}
          </button>
          <button onClick={() => setPlaybackSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))} style={btnS('#334155')} title="재생 속도">
            {playbackSpeed.toFixed(1)}x
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 텍스트 + 인라인 LaTeX($...$) + LaTeX 줄바꿈(\\)이 섞인 해설 문자열을 토큰 배열로 파싱.
 * 수식($...$)을 먼저 분리하므로 수식 내부의 백슬래시는 보존된다.
 * 반환: [{ type: 'text'|'math'|'br', value? }]
 */
export function parseRichSolution(text) {
  if (!text) return [];
  const parts = String(text).split(/\$([^$]+)\$/); // 홀수 인덱스 = 수식
  const tokens = [];
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      tokens.push({ type: 'math', value: part });
      return;
    }
    if (!part) return;
    part.split(/\\\\/).forEach((line, j) => { // LaTeX 줄바꿈
      if (j > 0) tokens.push({ type: 'br' });
      if (line) tokens.push({ type: 'text', value: line });
    });
  });
  return tokens;
}

/**
 * parseRichSolution 토큰을 텍스트/인라인수식/줄바꿈으로 렌더.
 */
function RichSolutionText({ text }) {
  const tokens = parseRichSolution(text);
  if (tokens.length === 0) return null;
  return (
    <div style={{ lineHeight: 1.8, fontSize: '0.95rem', wordBreak: 'break-word' }}>
      {tokens.map((t, i) => {
        if (t.type === 'br') return <br key={i} />;
        if (t.type === 'math') return <InlineMath key={i} math={t.value} errorColor="#94a3b8" />;
        return <span key={i}>{t.value}</span>;
      })}
    </div>
  );
}

function btnS(bg) {
  return {
    background: bg, border: 'none', color: 'white',
    padding: '0.3rem 0.6rem', borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', fontWeight: 600,
  };
}
