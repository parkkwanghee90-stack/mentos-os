/**
 * GeometryHintPlayer.jsx  (MathCanvas 버전)
 *
 * step.math.objects 배열로 선언형 수학 객체를 그림
 * step.shapes 구형 SVG 배열도 하위호환 지원
 *
 * 새로운 JSON 형식 예시:
 * {
 *   "type": "geometry",
 *   "steps": [
 *     {
 *       "label": "1단계",
 *       "text": "삼각형 ABC 설정",
 *       "math": {
 *         "objects": [
 *           { "type": "triangle_angles",
 *             "angles": {"A": 30, "B": 45, "C": 105},
 *             "side": {"name": "BC", "value": 6} },
 *           { "type": "text", "x": 0, "y": -0.5,
 *             "content": "BC=6√2", "color": "#10b981" }
 *         ]
 *       }
 *     }
 *   ]
 * }
 */
import React, { useState } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import MathCanvas from './MathCanvas';
import TTS_UNIT_MAP from '../../data/tts_map.json';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';

// RichText: 한글+LaTeX 혼합 텍스트를 완벽하게 렌더링
// $...$ → InlineMath, $$...$$ / \[...\] → BlockMath, 나머지 → 텍스트
// ── 1. 수식/텍스트 공통 전처리 (정규화) ──
function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);

  // 1. 역슬래시+n 문자열을 실제 줄바꿈으로 변환하되, LaTeX 명령어(\neq, \nabla 등)는 보호
  txt = txt
    .replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');

  // 2. \[ ... \] 를 $$ ... $$ 로 변환
  txt = txt.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$$');

  // 3. \( ... \) 를 $ ... $ 로 변환
  txt = txt.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 4. $$ ... $$ 내부에 줄바꿈(\\)이 있으면 \begin{aligned} 로 자동 감싸기 (빨간 글씨 에러 방지)
  txt = txt.replace(/\$\$([\s\S]+?)\$\$/g, (match, inner) => {
    if (inner.includes('\\begin{aligned}') || inner.includes('\\begin{cases}') || inner.includes('\\begin{array}')) {
      return match;
    }
    if (inner.includes('\\\\')) {
      return `$$ \\begin{aligned} ${inner} \\end{aligned} $$`;
    }
    return match;
  });

  return txt;
}

// 인라인 수식 $...$ 파서
function InlineFrag({ text }) {
  if (!text) return null;
  const parts = [];
  const reg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  let last = 0, m, k = 0;
  while ((m = reg.exec(text)) !== null) {
    if (m.index > last) {
      parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    }
    const mFull = m[0];
    const mMath = m[1];
    parts.push(
      <InlineMath key={k++} math={mMath} errorColor="#94a3b8"
        renderError={() => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{mFull}</span>} />
    );
    last = m.index + mFull.length;
  }
  if (last < text.length) {
    parts.push(<span key={k++}>{text.slice(last)}</span>);
  }
  return <>{parts}</>;
}

// KaTeX 수식이 섞인 텍스트를 React 요소로 변환
function MathText({ text }) {
  if (!text) return null;
  const normalized = normalizeMathText(String(text));
  const parts = [];
  let key = 0;

  // $$...$$ 먼저 처리
  const blockReg = /\$\$([\s\S]+?)\$\$/g;
  let bMatch;
  let lastIdx = 0;
  blockReg.lastIndex = 0;
  while ((bMatch = blockReg.exec(normalized)) !== null) {
    if (bMatch.index > lastIdx) {
      parts.push(<InlineFrag key={key++} text={normalized.slice(lastIdx, bMatch.index)} />);
    }
    const bFull = bMatch[0];
    const bMath = bMatch[1];
    parts.push(
      <div key={key++} style={{ margin: '0.5rem 0', overflowX: 'auto', maxWidth: '100%' }}>
        <BlockMath math={bMath} errorColor="#94a3b8"
          renderError={() => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{bFull}</span>} />
      </div>
    );
    lastIdx = bMatch.index + bFull.length;
  }
  if (lastIdx < normalized.length) {
    parts.push(<InlineFrag key={key++} text={normalized.slice(lastIdx)} />);
  }
  return <>{parts}</>;
}

// RichText: 한글+LaTeX 혼합 텍스트를 완벽하게 렌더링
// $...$ → InlineMath, $$...$$ / \[...\] → BlockMath, 나머지 → 텍스트
const RichText = ({ content }) => {
  if (typeof content !== 'string') return <span>{JSON.stringify(content)}</span>;
  if (!content.trim()) return null;

  // 1. 마크다운 이미지 정규식: !\[(.*?)\]\((.*?)\)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let images = [];
  let m;
  while ((m = imageRegex.exec(content)) !== null) {
    images.push({ alt: m[1], src: m[2] });
  }

  // 2. 텍스트에서는 마크다운 이미지 구문을 완전히 제거
  const cleanContent = content.replace(imageRegex, '').trim();

  // 줄바꿈(\n 또는 \\\\) 단위로 먼저 분리해서 각 줄을 처리
  const lines = cleanContent.split(/\n|\\\\/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {cleanContent ? (
        <span style={{ fontSize: '1.3rem', lineHeight: '2.1', whiteSpace: 'pre-wrap', wordBreak: 'keep-all', color: '#f8fafc' }}>
          {lines.map((line, li) => (
            <span key={li}>
              <MathText text={line} />
              {li < lines.length - 1 && <br />}
            </span>
          ))}
        </span>
      ) : null}
      
      {/* 파싱된 이미지 렌더링 */}
      {images.map((img, idx) => (
        <div key={idx} style={{ marginTop: '0.8rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #475569' }}>
          <img 
            src={img.src} 
            alt={img.alt || '해설 이미지'} 
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'contain', backgroundColor: '#ffffff', padding: '10px' }} 
          />
        </div>
      ))}
    </div>
  );
};





// ─── 구형 SVG shapes 렌더러 (하위호환) ─────────────────────
import katex from 'katex';

function SvgLatex({ x, y, content, color = '#fcd34d', size = 11 }) {
  const safeColor = color || '#fcd34d';
  const html = katex.renderToString(content, { throwOnError: false });
  return (
    <foreignObject x={x - 5} y={y - size} width={130} height={size * 3.5}>
      <div xmlns="http://www.w3.org/1999/xhtml"
        style={{ fontSize: size, color: safeColor, lineHeight: 1 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  );
}

function LegacySvgCanvas({ shapes }) {
  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 280, height: 'auto', overflow: 'visible' }}>
      {shapes.map((s, i) => {
        switch (s.type) {
          case 'polygon':
            return <polygon key={i} points={s.points.map(p => p.join(',')).join(' ')}
              fill={s.fill || 'none'} stroke={s.stroke || '#60a5fa'} strokeWidth={s.strokeWidth || 2} />;
          case 'line':
            return <line key={i} x1={s.points[0][0]} y1={s.points[0][1]}
              x2={s.points[1][0]} y2={s.points[1][1]}
              stroke={s.color || '#f59e0b'} strokeWidth={s.strokeWidth || 1.8}
              strokeDasharray={s.style === 'dashed' ? '5,4' : undefined} />;
          case 'circle':
            return <circle key={i} cx={s.cx} cy={s.cy} r={s.r || 3} fill={s.color || '#fff'} />;
          case 'label':
            return <text key={i} x={s.x} y={s.y} fill={s.color || '#e2e8f0'}
              fontSize={s.size || 12} fontWeight="bold">{s.text}</text>;
          case 'latex':
            return <SvgLatex key={i} x={s.x} y={s.y} content={s.content} color={s.color} size={s.size} />;
          case 'arc': {
            const r = s.r || 20, D = Math.PI / 180;
            const x1 = s.cx + r * Math.cos(s.startAngle * D);
            const y1 = s.cy + r * Math.sin(s.startAngle * D);
            const x2 = s.cx + r * Math.cos(s.endAngle * D);
            const y2 = s.cy + r * Math.sin(s.endAngle * D);
            const large = Math.abs(s.endAngle - s.startAngle) > 180 ? 1 : 0;
            return <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
              fill="none" stroke={s.color || '#f59e0b'} strokeWidth={1.5} />;
          }
          case 'rightangle': {
            const sz = s.size || 10;
            return <path key={i}
              d={`M ${s.x} ${s.y - sz} L ${s.x + sz} ${s.y - sz} L ${s.x + sz} ${s.y}`}
              fill="none" stroke={s.color || '#10b981'} strokeWidth={1.5} />;
          }
          default: return null;
        }
      })}
    </svg>
  );
}

const SUPABASE_TTS_BASE = (import.meta.env.VITE_SUPABASE_URL || '') + '/storage/v1/object/public/math-tts';

export default function GeometryHintPlayer({ data, ttsUnit, ttsProblemId }) {
  const [step, setStep]       = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgH, setImgH] = useState(0);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsAudio, setTtsAudio] = useState(null);

  if (!data?.steps && !data?.overlay_steps) return null;
  const isV3 = !!(data.overlay_steps || (data.base_figure && data.base_figure.preset === 'custom'));
  const stepsData = data.overlay_steps || data.steps;

  const handlePlay = () => {
    if (step >= stepsData.length - 1) { setStep(0); setIsPlaying(true); }
    else setIsPlaying(!isPlaying);
  };
  const handleNext = () => {
    if (step < stepsData.length - 1) setStep(s => s + 1);
    else setIsPlaying(false);
  };

  React.useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => {
      if (step < stepsData.length - 1) setStep(s => s + 1);
      else setIsPlaying(false);
    }, 4000);
    return () => clearTimeout(t);
  }, [isPlaying, step, stepsData.length]);

  const cur = stepsData[step];
  
  // 현재 스텝까지의 모든 math.objects를 누적
  const accumulatedObjects = [];
  
  // V3 구조인 경우 Base Figure(1층)를 항상 먼저 렌더링
  if (isV3 && data.base_figure?.objects) {
    accumulatedObjects.push(...data.base_figure.objects);
  }

  for (let i = 0; i <= step; i++) {
    const s = stepsData[i];
    if (!s) continue;
    const objs = isV3 ? s.objects : s.math?.objects;
    if (objs) {
      accumulatedObjects.push(...objs);
    }
  }
  
  const hasMath   = accumulatedObjects.length > 0;
  const hasShapes = !hasMath && Array.isArray(cur?.shapes) && cur.shapes.length > 0;
  const ebsGreen = '#1b3b2e';
  const ebsDarkGreen = '#112b20';
  const ebsCard = '#26503c';
  const chalkWhite = '#f8fafc';
  const chalkYellow = '#fde047';

  return (
    <div style={{
      background: ebsGreen, padding: '1.5rem', borderRadius: 16,
      color: chalkWhite, border: '8px solid #475569', marginTop: '1rem',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
    }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: chalkYellow, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ background: '#2563eb', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>EBSi style</span>
          📐 {data.title || '단계별 해설 특강'}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* 🔊 TTS 음성 듣기 버튼 */}
          {ttsUnit && ttsProblemId && (() => {
            const NAVER_TTS_FOLDERS = [
              '20260504모의고사1회미적분', '20260504모의고사1회확통',
              '2024060504미적분2회', '2024060504확통2회모의고사',
              '20230605043회모의고사미적분', '20230605043회모의고사확통',
              'CSAT_2025수능_미적분', 'CSAT_2025수능_확통',
              'CSAT_2024수능_미적분', 'CSAT_2024수능_확통',
              'CSAT_2023수능_미적분', 'CSAT_2023수능_확통'
            ];

            const isNaverTts = NAVER_TTS_FOLDERS.includes(ttsUnit);
            let audioUrl = '';

            if (isNaverTts) {
              const qNum = String(ttsProblemId).padStart(3, '0');
              audioUrl = `/audio/suneung_tts/${ttsUnit}_${qNum}.mp3`;
            } else {
              let cleanUnit = (ttsUnit || '').replace(/\s+/g, '').replace(/[()]/g, '').replace(/\//g, '');
              const stepMatch = cleanUnit.match(/\[(\d+)단계\]/);
              if (stepMatch) {
                const stepStr = stepMatch[1] + '단계';
                cleanUnit = cleanUnit.replace(/\[\d+단계\]/, '') + stepStr;
              }
              const engPath = TTS_UNIT_MAP[cleanUnit];
              if (!engPath) return null;
              audioUrl = `${SUPABASE_TTS_BASE}/${engPath}/${ttsProblemId}.mp3`;
            }

            const handleTts = () => {
              if (ttsPlaying && ttsAudio) {
                ttsAudio.pause();
                setTtsPlaying(false);
                return;
              }
              const audio = new Audio(audioUrl);
              audio.onended = () => setTtsPlaying(false);
              audio.onerror = () => { setTtsPlaying(false); };
              audio.play();
              setTtsAudio(audio);
              setTtsPlaying(true);
            };

            return (
              <button onClick={handleTts} style={{
                ...btn(ttsPlaying ? '#dc2626' : '#7c3aed'),
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                {ttsPlaying ? '⏹ 정지' : '🔊 음성'}
              </button>
            );
          })()}
          <button onClick={() => { setStep(0); setIsPlaying(false); }} style={btn('#334155')}>
            <RotateCcw size={15} />
          </button>
          <button onClick={handlePlay} style={btn('#ea580c')}>
            {isPlaying ? <><Pause size={15} /> 정지</> : <><Play size={15} /> 재생</>}
          </button>
          <button onClick={handleNext} style={btn('#334155')}>
            다음 <StepForward size={15} />
          </button>
        </div>
      </div>

      {/* 진행 바 */}
      <div style={{ display: 'flex', gap: 5, marginBottom: '1rem' }}>
        {stepsData.map((_, i) => (
          <div key={i} onClick={() => setStep(i)} style={{
            flex: 1, height: 4, borderRadius: 4, cursor: 'pointer',
            background: i <= step ? chalkYellow : ebsDarkGreen, transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <div className="flex flex-col lg:flex-row" style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* 스텝 텍스트 영역 (5개 단위 페이징) - 상단/하단 배치 */}
        <div className={`w-full ${((hasMath || hasShapes || cur?.picture || data.problem_image || data.diagramAsset || data.imageAsset || data.graphAsset || (isV3 && (data.base_figure?.objects||[]).some(o => ['polygon','circle','segment','line','point','drawSegment','drawCircle','drawInscribedQuadrilateral','triangle_angles','triangle'].includes(o.type))))) ? 'lg:w-7/12' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
          {stepsData.map((s, idx) => {
            return (
              <div key={idx} onClick={() => setStep(idx)} style={{
              padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
              background: idx === step ? ebsCard : idx < step ? ebsDarkGreen : 'transparent',
              border: `1px solid ${idx === step ? chalkYellow : idx < step ? '#1e293b' : 'transparent'}`,
              opacity: idx <= step ? 1 : 0.35, transition: 'all 0.3s',
            }}>
              <div style={{
                fontSize: '0.78rem', fontWeight: 700,
                color: idx === step ? chalkYellow : '#94a3b8',
                marginBottom: idx <= step ? '0.3rem' : 0,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {s.label}
              </div>
              {idx <= step && (
                <div style={{ fontSize: '1.5rem', color: chalkWhite, lineHeight: 2.0 }}>
                  {/* V5 Caption (Pure Text) */}
                  {s.caption && <div style={{ marginBottom: '0.4rem', color: chalkWhite, fontWeight: 500, lineHeight: '2.0', whiteSpace: 'pre-wrap' }}><RichText content={s.caption} /></div>}

                  {/* V5 Formula Raw (RichText) */}
                  {s.formula_raw && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.2rem 0' }}>
                       <RichText content={s.formula_raw} />
                    </div>
                  )}

                  {/* V5 Formula Lines (Math Array) */}
                  {s.formula_lines && s.formula_lines.map((fline, fi) => (
                    <div key={fi} style={{ marginBottom: '0.3rem', padding: '0.2rem 0' }}>
                      {fline.formula_latex ? (
                        <BlockMath math={normalizeMathText(fline.formula_latex)} errorColor="#cbd5e1" />
                      ) : (
                        <div style={{ color: '#cbd5e1' }}>{fline.formula_text}</div>
                      )}
                    </div>
                  ))}

                  {/* Legacy Support */}
                  {s.text && <div><RichText content={s.text} /></div>}
                  {s.lines && s.lines.map((line, li) => {
                    const isLatex = line.type === 'latex';
                    const content = line.content || line;
                    return (
                      <div key={li} style={{ marginBottom: '0.2rem' }}>
                        {isLatex ? <BlockMath math={normalizeMathText(content)} /> : <RichText content={content} />}
                      </div>
                    );
                  })}
                  {s.latex && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <RichText content={(s.latex.includes('$') || s.latex.includes('\\[') || s.latex.includes('\\(')) ? s.latex : `$$${s.latex}$$`} />
                    </div>
                  )}
                </div>
              )}
              {/* 수식 추가 표시 (이전 하위 호환성 유지) */}
              {idx === step && s.math?.latex && (
                <div style={{ marginTop: '0.4rem' }}>
                  <RichText content={(s.math.latex.includes('$') || s.math.latex.includes('\\[') || s.math.latex.includes('\\(')) ? s.math.latex : `$$${s.math.latex}$$`} />
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* 그래프 영역: 기하(geometry) 도형이 있는 경우에만 렌더링 (단순 문제 이미지 fallback 제거) */}
        {(hasMath || hasShapes || cur?.picture || (isV3 && (data.base_figure?.objects||[]).some(o => ['polygon','circle','segment','line','point','drawSegment','drawCircle','drawInscribedQuadrilateral','triangle_angles','triangle', 'drawPolygon', 'markLength', 'markAngle'].includes(o.type)))) ? (
          <div className="w-full lg:w-5/12 lg:sticky order-first lg:order-last" style={{
            background: '#1e293b', borderRadius: 12, top: '1.5rem',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            padding: '1rem', marginBottom: '1rem',
            height: '480px', overflow: 'hidden', position: 'relative'
          }}>
            {hasMath && <MathCanvas objects={accumulatedObjects} height={450} viewBox={isV3 ? data.viewBox : cur.math?.viewBox} />}
            {hasShapes && !isV3 && <LegacySvgCanvas shapes={cur.shapes} />}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function btn(bg) {
  return {
    background: bg, border: 'none', color: 'white',
    padding: '0.4rem 0.8rem', borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', fontWeight: 600,
  }
;
}
