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
import { speakText, stopSpeaking } from '../../services/ttsService';
import { buildAvsNarration } from './avsNarration';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from '@/components/KaTeXWrapper';

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

// preprocessLatexString: $ 기호가 명시적으로 없는 텍스트에서 생한글이 있거나 \text{...}가 포함되어 있으면
// 수식 부분만 골라 $로 감싸며, 텍스트 부분은 평문으로 복구하여 모바일에서 자연스러운 줄바꿈을 지원합니다.
// 한글이 아예 없는 순수 수식은 전체를 $$로 통감싸기 처리합니다.
function preprocessLatexString(latex) {
  if (!latex) return '';
  let str = String(latex);
  if (str.includes('$') || str.includes('\\[') || str.includes('\\(')) {
    return str;
  }

  // 1. 생한글이 있거나, \text{...} 내부에 한글이 들어있는지 전체 검사
  const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(str);
  
  if (!hasKorean) {
    // 한글이 하나도 없는 순수 수식은 전체를 $$로 묶어서 블록 수식으로 렌더링
    return `$$${str}$$`;
  }

  // 2. 한글이 포함된 혼합형 텍스트인 경우:
  // 줄바꿈 \\\\ 이나 \n 로 나누고, 각 파트별로 최적의 수식 여부를 판별합니다.
  const parts = str.split(/\\\\|\n/);
  const processedParts = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return part;

    // 한글이 아예 없는가? -> 수식 블록
    const partHasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(trimmed);
    if (!partHasKorean) {
      return `$${trimmed}$`;
    }

    // 한글이 있지만, \text{ 가 포함되어 있는가? -> LaTeX 정형 수식 블록
    if (trimmed.includes('\\text{')) {
      return `$${trimmed}$`;
    }

    // 한글이 있고, \text{ 가 없는가? -> 일반 평문 텍스트 내에서 x^4 = 1 등 쌩 수식 감지하여 $...$로 감싸기
    let result = part;
    const mathCandidateRegex = /([a-zA-Z0-9\^_\+\-\*\/\=\<\>\(\)\\]+(?:\s*[a-zA-Z0-9\^_\+\-\*\/\=\<\>\(\)\\]+)*)/g;
    
    result = part.replace(mathCandidateRegex, (match) => {
      const trimmedMatch = match.trim();
      if (!trimmedMatch) return match;
      
      // 일반 대문자 라벨 명칭(예: P, C, B, A, S 단독 또는 P:, C: 등)은 제외
      if (/^[P|C|B|A|S]\s*:?$/.test(trimmedMatch)) {
        return match;
      }
      
      const hasMathSymbol = /[\^_\+\-\*\/\=\<\>\\()]/.test(trimmedMatch);
      const hasNumber = /[0-9]/.test(trimmedMatch);
      const isSingleVariable = /^[a-zA-Z]$/.test(trimmedMatch);
      
      // 수학 기호가 있거나, 숫자가 있거나, 단일 영어 변수인 경우 수식으로 분류
      if (hasMathSymbol || hasNumber || isSingleVariable) {
        if (/^(EBSi|Vercel|Vite|React|HTML|CSS|JS|UI|AVS)$/i.test(trimmedMatch)) {
          return match;
        }
        
        const leadingSpace = match.match(/^\s*/)[0];
        const trailingSpace = match.match(/\s*$/)[0];
        return `${leadingSpace}$${trimmedMatch}$${trailingSpace}`;
      }
      
      return match;
    });

    return result;
  });

  // 원래 줄바꿈 기호를 복원하며 합침
  let reassembled = '';
  const separators = [...str.matchAll(/\\\\|\n/g)].map(m => m[0]);
  
  for (let i = 0; i < processedParts.length; i++) {
    reassembled += processedParts[i];
    if (i < separators.length) {
      reassembled += separators[i];
    }
  }
  return reassembled;
}


// MathText: 플레이스홀더가 포함된 텍스트를 받아서 원래 수식을 복원하며 렌더링
function MathText({ text, mathBlocks }) {
  if (!text) return null;
  const parts = [];
  const regex = /___MATH_BLOCK_(\d+)___/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(<span key={key++}>{text.slice(lastIdx, match.index)}</span>);
    }

    const idx = parseInt(match[1], 10);
    const originalMath = mathBlocks[idx];

    if (originalMath) {
      const normalized = normalizeMathText(originalMath);

      if (normalized.startsWith('$$') && normalized.endsWith('$$')) {
        const mathContent = normalized.slice(2, -2);
        parts.push(
          <div key={key++} className="avs-katex-block" style={{ margin: '0.4rem 0', overflowX: 'auto', maxWidth: '100%' }}>
            <BlockMath math={mathContent} errorColor="#94a3b8"
              renderError={() => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{originalMath}</span>} />
          </div>
        );
      } else if (normalized.startsWith('$') && normalized.endsWith('$')) {
        const mathContent = normalized.slice(1, -1);
        parts.push(
          <InlineMath key={key++} math={mathContent} errorColor="#94a3b8"
            renderError={() => <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{originalMath}</span>} />
        );
      } else {
        parts.push(<span key={key++}>{originalMath}</span>);
      }
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }

  return <>{parts}</>;
}

// RichText: 한글+LaTeX 혼합 텍스트를 완벽하게 렌더링
// 수식 내 줄바꿈이나 기호가 split(/\n|\\\\/)으로 인해 깨지는 것을 완벽하게 예방하기 위해
// 먼저 모든 LaTeX 수식 블록을 안전한 임시 플레이스홀더로 치환한 뒤 줄바꿈을 쪼개고, 렌더링 시점에 안전하게 복구합니다.
const RichText = ({ content, isMobile = false }) => {
  if (typeof content !== 'string') return <span>{JSON.stringify(content)}</span>;
  if (!content.trim()) return null;

  // Auto-preprocess unescaped LaTeX strings
  const preprocessed = preprocessLatexString(content);

  // 1. 마크다운 이미지 정규식: !\[(.*?)\]\((.*?)\)
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let images = [];
  let m;
  while ((m = imageRegex.exec(preprocessed)) !== null) {
    images.push({ alt: m[1], src: m[2] });
  }

  // 2. 텍스트에서는 마크다운 이미지 구문을 완전히 제거
  const cleanContent = preprocessed.replace(imageRegex, '').trim();

  // 3. LaTeX 수식 블록 추출 및 플레이스홀더 치환
  const mathBlocks = [];
  let tempContent = cleanContent;

  // $$ ... $$ 패턴
  tempContent = tempContent.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
    const placeholder = `___MATH_BLOCK_${mathBlocks.length}___`;
    mathBlocks.push(match);
    return placeholder;
  });

  // \[ ... \] 패턴
  tempContent = tempContent.replace(/\\\[([\s\S]+?)\\\]/g, (match) => {
    const placeholder = `___MATH_BLOCK_${mathBlocks.length}___`;
    mathBlocks.push(match);
    return placeholder;
  });

  // \( ... \) 패턴
  tempContent = tempContent.replace(/\\\(([\s\S]+?)\\\)/g, (match) => {
    const placeholder = `___MATH_BLOCK_${mathBlocks.length}___`;
    mathBlocks.push(match);
    return placeholder;
  });

  // $ ... $ 패턴 (인라인 수식, 탈출된 백슬래시 $ 등 무시)
  tempContent = tempContent.replace(/\$((?:[^$\\]|\\[\s\S])+?)\$/g, (match) => {
    const placeholder = `___MATH_BLOCK_${mathBlocks.length}___`;
    mathBlocks.push(match);
    return placeholder;
  });

  // 4. 일반 텍스트 줄바꿈 분리
  const lines = tempContent.split(/\n|\\\\/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {cleanContent ? (
        <span className="avs-rich-text" style={{ 
          fontSize: isMobile ? '0.8rem' : '1.3rem', 
          lineHeight: isMobile ? '1.4' : '2.1', 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'keep-all', 
          color: '#f8fafc' 
        }}>
          {lines.map((line, li) => (
            <span key={li}>
              <MathText text={line} mathBlocks={mathBlocks} />
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
  const html = katex.renderToString(content, { throwOnError: false, strict: 'ignore', trust: true });
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

export default function GeometryHintPlayer({ data, ttsUnit, ttsProblemId, geminiTts = false }) {
  const [step, setStep]       = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [imgH, setImgH] = useState(0);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsAudio, setTtsAudio] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('text');

  // Gemini 런타임 TTS 모드: 언마운트 시 재생 중인 음성 정리
  React.useEffect(() => {
    if (!geminiTts) return undefined;
    return () => { stopSpeaking(); };
  }, [geminiTts]);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  React.useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(() => {
      if (step < stepsData.length - 1) setStep(s => s + 1);
      else setIsPlaying(false);
    }, 4000 / playbackSpeed);
    return () => clearTimeout(t);
  }, [isPlaying, step, stepsData.length, playbackSpeed]);

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
    <div className="avs-container" style={{
      background: ebsGreen, padding: '1.5rem', borderRadius: 16,
      color: chalkWhite, border: '8px solid #475569', marginTop: '1rem',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {/* 모바일 및 데스크톱 강제 반응형 스타일 시트 (Tailwind 비활성화 완벽 대처) */}
      <style>{`
        /* ── 가로 스크롤 방지: 보드/열/수식이 절대로 가로폭을 넘기지 않도록 봉쇄 ── */
        .avs-container, .avs-container * { box-sizing: border-box; }
        .avs-container { max-width: 100% !important; overflow-x: hidden !important; }
        .avs-body-wrapper { min-width: 0 !important; max-width: 100% !important; }
        .avs-text-col { min-width: 0 !important; }
        .avs-card-body, .avs-rich-text {
          min-width: 0 !important; max-width: 100% !important;
          overflow-wrap: anywhere !important; word-break: break-word !important;
        }
        /* 한 개의 초장문 수식만 그 블록 내부에서 스크롤(보드 자체는 안 늘어남) */
        .avs-katex-block, .avs-text-col .katex-display {
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch;
        }

        /* 공통 및 데스크톱 기본 레이아웃 */
        .avs-body-wrapper {
          display: flex !important;
          flex-direction: row !important;
          gap: 1.5rem !important;
          align-items: flex-start !important;
          width: 100% !important;
        }
        .avs-text-col {
          width: 58% !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.6rem !important;
          /* 단계가 늘어나면 칠판이 아래로 확장되도록 내부 스크롤 제거 */
          max-height: none !important;
          overflow-y: visible !important;
          overflow-x: hidden !important;
          padding-right: 10px !important;
        }
        .avs-text-col.w-full {
          width: 100% !important;
        }
        .avs-canvas-col {
          width: 40% !important;
          background: #1e293b !important;
          border-radius: 12px !important;
          position: -webkit-sticky !important;
          position: sticky !important;
          top: 1.5rem !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 1rem !important;
          margin-bottom: 1rem !important;
          height: 480px !important;
          overflow: hidden !important;
        }
        .avs-canvas-col.order-first {
          order: -1 !important;
        }
        .avs-canvas-col.order-last {
          order: 1 !important;
        }

        @media (max-width: 768px) {
          .avs-container {
            padding: 0.6rem !important;
            border-width: 4px !important;
          }
          .avs-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            display: flex !important;
          }
          .avs-title {
            font-size: 0.82rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            width: 100% !important;
            flex-shrink: 0 !important;
          }
          .avs-title span {
            font-size: 0.62rem !important;
            padding: 1px 4px !important;
            flex-shrink: 0 !important;
          }
          .avs-btn-container {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 4px !important;
            justify-content: flex-end !important;
          }
          .avs-btn {
            padding: 2px 6px !important;
            font-size: 0.65rem !important;
            justify-content: center !important;
            align-items: center !important;
            height: 28px !important;
            width: auto !important;
            min-width: 0 !important;
            white-space: nowrap !important;
            gap: 2px !important;
            box-sizing: border-box !important;
            border-radius: 6px !important;
          }
          .avs-btn svg {
            width: 10px !important;
            height: 10px !important;
            flex-shrink: 0 !important;
          }
          .avs-body-wrapper {
            flex-direction: column !important;
            gap: 0.8rem !important;
          }
          .avs-text-col {
            width: 100% !important;
            max-height: none !important;
            overflow-y: visible !important;
            padding-right: 0 !important;
            order: 2 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          .avs-canvas-col {
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
            height: 230px !important;
            order: 1 !important;
            margin-bottom: 0.4rem !important;
            padding: 0.6rem !important;
          }
          .avs-card-body {
            font-size: 0.82rem !important;
            line-height: 1.5 !important;
            word-break: keep-all !important;
            word-wrap: break-word !important;
          }
          .avs-rich-text {
            font-size: 0.82rem !important;
            line-height: 1.5 !important;
            word-break: keep-all !important;
            word-wrap: break-word !important;
          }
          .katex {
            font-size: 0.85em !important;
          }
          .katex-display {
            margin: 0.15em 0 !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
        }
      `}</style>

      {/* 헤더 */}
      <div className="avs-header" style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        marginBottom: '1rem',
        gap: isMobile ? '8px' : '0'
      }}>
        <h3 className="avs-title" style={{ 
          margin: 0, 
          color: chalkYellow, 
          fontSize: isMobile ? '0.85rem' : '1.1rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          flexWrap: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontWeight: 800, color: chalkWhite, fontSize: isMobile ? '0.98rem' : '1.18rem', letterSpacing: '0.2px' }}>AVS 풀이</span>
          <span style={{ background: 'rgba(52,211,153,0.18)', color: '#6ee7b7', padding: '2px 8px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 'bold', flexShrink: 0, border: '1px solid rgba(52,211,153,0.4)', letterSpacing: '0.5px' }}>Beta</span>
        </h3>
        <div className="avs-btn-container" style={{ 
          display: 'flex', 
          gap: 6,
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          width: isMobile ? '100%' : 'auto',
          alignItems: 'center'
        }}>
          {/* 🔊 TTS 음성 듣기 버튼 (Gemini 런타임 모드) — 스텝 나레이션을 Aoede 보이스로 낭독 */}
          {geminiTts && (() => {
            const handleGeminiTts = () => {
              if (ttsPlaying) { stopSpeaking(); setTtsPlaying(false); return; }
              const narration = buildAvsNarration(stepsData);
              if (!narration) return;
              setTtsPlaying(true);
              speakText(narration, {
                isReplay: true, // 사용자 클릭 재생: 출력횟수 스킵 로직 우회
                onEnd: () => setTtsPlaying(false),
                onError: () => setTtsPlaying(false),
              });
            };
            return (
              <button onClick={handleGeminiTts} className="avs-btn" style={{
                ...btn(ttsPlaying ? '#dc2626' : '#7c3aed', isMobile),
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                {ttsPlaying ? '⏹ 정지' : '🔊 음성(Gemini)'}
              </button>
            );
          })()}
          {/* 🔊 TTS 음성 듣기 버튼 (정적 파일 모드) */}
          {!geminiTts && ttsUnit && ttsProblemId && (() => {
            const NAVER_TTS_FOLDERS = [
              '20260504모의고사1회미적분', '20260504모의고사1회확통',
              '2024060504미적분2회', '2024060504확통2회모의고사',
              '20230605043회모의고사미적분', '20230605043회모의고사확통',
              'CSAT_2025수능_미적분', 'CSAT_2025수능_확통',
              'CSAT_2024수능_미적분', 'CSAT_2024수능_확통',
              'CSAT_2023수능_미적분', 'CSAT_2023수능_확통'
            ];

            const isNaverTts = NAVER_TTS_FOLDERS.includes(ttsUnit);
            
            // 1회 모의고사(20260504모의고사1회미적분/확통)의 1번~10번 문항(001~010)의 OpenAI Shimmer 음성 제거 (잡담 제거 요청 반영)
            const isVolume1 = ttsUnit === '20260504모의고사1회미적분' || ttsUnit === '20260504모의고사1회확통';
            const probNum = parseInt(ttsProblemId, 10);
            if (isVolume1 && probNum >= 1 && probNum <= 10) {
              return null;
            }

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
              <button onClick={handleTts} className="avs-btn" style={{
                ...btn(ttsPlaying ? '#dc2626' : '#7c3aed', isMobile),
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                {ttsPlaying ? '정지' : '음성 설명'}
              </button>
            );
          })()}
          <button onClick={() => { setStep(0); setIsPlaying(false); }} className="avs-btn" style={{ ...btn('#334155', isMobile), display: 'flex', alignItems: 'center', gap: 4 }}>
            <RotateCcw size={isMobile ? 12 : 15} /> {isMobile ? '' : '다시 보기'}
          </button>
        </div>
      </div>

      {/* 모바일 세그먼트형 탭 버튼 바 (EBSi급 다크 글래스모피즘) */}
      {isMobile && (
        <div className="avs-tabs-bar" style={{
          display: 'flex',
          background: ebsDarkGreen,
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <button 
            onClick={() => setActiveTab('text')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'text' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: activeTab === 'text' ? '#ffffff' : '#94a3b8',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            📝 단계별 해설 ({stepsData.length}스텝)
          </button>
          {(hasMath || hasShapes || cur?.picture || (isV3 && (data.base_figure?.objects||[]).some(o => ['polygon','circle','segment','line','point','drawSegment','drawCircle','drawInscribedQuadrilateral','triangle_angles','triangle', 'drawPolygon', 'markLength', 'markAngle'].includes(o.type)))) && (
            <button 
              onClick={() => setActiveTab('graph')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'graph' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: activeTab === 'graph' ? '#ffffff' : '#94a3b8',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              📊 기하 렌더링
            </button>
          )}
        </div>
      )}

      <div className="avs-body-wrapper">
        {/* 좌측 세로 단계 레일 (1~N) */}
        {!isMobile && (
          <div className="avs-step-rail" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0, paddingTop: '4px' }}>
            {stepsData.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={`${i + 1}단계`}
                style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  border: i === step ? '2px solid #fde047' : '1px solid rgba(255,255,255,0.18)',
                  background: i === step ? 'rgba(253,224,71,0.18)' : i < step ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: i <= step ? '#fde047' : '#94a3b8',
                  fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        {/* 스텝 텍스트 영역 (5개 단위 페이징) - 상단/하단 배치 */}
        <div
          className={`avs-text-col ${!((hasMath || hasShapes || cur?.picture || data.problem_image || data.diagramAsset || data.imageAsset || data.graphAsset || (isV3 && (data.base_figure?.objects||[]).some(o => ['polygon','circle','segment','line','point','drawSegment','drawCircle','drawInscribedQuadrilateral','triangle_angles','triangle'].includes(o.type))))) ? 'w-full' : ''}`}
          style={{
            display: isMobile && activeTab !== 'text' ? 'none' : 'flex'
          }}
        >
          {stepsData.map((s, idx) => {
            const stepLabel = s.label || [s.phase ? `[${s.phase}]` : '', s.title].filter(Boolean).join(' ') || `${idx + 1}단계 해설`;
            return (
              <div key={idx} onClick={() => setStep(idx)} style={{
              padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
              background: idx === step ? ebsCard : idx < step ? ebsDarkGreen : 'transparent',
              border: `1px solid ${idx === step ? chalkYellow : idx < step ? '#1e293b' : 'transparent'}`,
              opacity: idx <= step ? 1 : 0.35, transition: 'all 0.3s',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                fontSize: isMobile ? '0.85rem' : '0.98rem', fontWeight: 700,
                color: idx <= step ? chalkYellow : '#94a3b8',
                marginBottom: idx <= step ? '0.5rem' : 0,
                letterSpacing: '0.01em',
              }}>
                <span style={{ color: chalkYellow, fontSize: '0.95em', flexShrink: 0 }}>✦</span>
                {stepLabel}
              </div>
              {idx <= step && (
                <div className="avs-card-body" style={{ fontSize: isMobile ? '0.85rem' : '1.5rem', color: chalkWhite, lineHeight: isMobile ? 1.4 : 2.0, border: '1px solid rgba(253, 224, 71, 0.28)', borderRadius: '12px', padding: isMobile ? '0.6rem 0.8rem' : '0.9rem 1.15rem', background: 'rgba(0, 0, 0, 0.18)' }}>
                  {/* V5 Caption (Pure Text) / CSAT content */}
                  {s.caption && <div style={{ marginBottom: '0.4rem', color: chalkWhite, fontWeight: 500, lineHeight: isMobile ? '1.4' : '2.0', whiteSpace: 'pre-wrap' }}><RichText content={s.caption} isMobile={isMobile} /></div>}
                  {s.content && <div style={{ marginBottom: '0.4rem', color: chalkWhite, fontWeight: 500, lineHeight: isMobile ? '1.4' : '2.0', whiteSpace: 'pre-wrap' }}><RichText content={s.content} isMobile={isMobile} /></div>}

                  {/* V5 Formula Raw (RichText) */}
                  {s.formula_raw && (
                    <div style={{ marginBottom: '0.5rem', padding: '0.2rem 0' }}>
                       <RichText content={s.formula_raw} isMobile={isMobile} />
                    </div>
                  )}

                  {/* V5 Formula Lines (Math Array) */}
                  {s.formula_lines && s.formula_lines.map((fline, fi) => (
                    <div key={fi} style={{ marginBottom: '0.3rem', padding: '0.2rem 0' }}>
                      {fline.formula_latex ? (
                        <BlockMath math={normalizeMathText(fline.formula_latex)} errorColor="#cbd5e1" />
                      ) : (
                        <div style={{ color: '#cbd5e1', fontSize: isMobile ? '0.8rem' : '1.2rem' }}>{fline.formula_text}</div>
                      )}
                    </div>
                  ))}

                  {/* Legacy Support */}
                  {s.text && <div><RichText content={s.text} isMobile={isMobile} /></div>}
                  {s.lines && s.lines.map((line, li) => {
                    const isLatex = line.type === 'latex';
                    const content = line.content || line;
                    return (
                      <div key={li} style={{ marginBottom: '0.2rem' }}>
                        {isLatex ? <BlockMath math={normalizeMathText(content)} /> : <RichText content={content} isMobile={isMobile} />}
                      </div>
                    );
                  })}
                  {s.latex && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <RichText content={preprocessLatexString(s.latex)} isMobile={isMobile} />
                    </div>
                  )}
                </div>
              )}
              {/* 수식 추가 표시 (이전 하위 호환성 유지) */}
              {idx === step && s.math?.latex && (
                <div style={{ marginTop: '0.4rem' }}>
                  <RichText content={preprocessLatexString(s.math.latex)} isMobile={isMobile} />
                </div>
              )}
            </div>
            );
          })}
          {step >= stepsData.length - 1 && (data.finalAnswer || data.correctAnswer) && (
            <div style={{ marginTop: '0.9rem', padding: '0.7rem 1rem', background: '#0a0f1a', borderRadius: 10, border: `1px solid ${chalkYellow}66`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ color: chalkYellow, fontWeight: 700 }}>정답</span>
              <RichText content={String(data.finalAnswer || data.correctAnswer)} isMobile={isMobile} />
            </div>
          )}
        </div>

        {/* 그래프 영역: 기하(geometry) 도형이 있는 경우에만 렌더링 (단순 문제 이미지 fallback 제거) */}
        {(hasMath || hasShapes || cur?.picture || (isV3 && (data.base_figure?.objects||[]).some(o => ['polygon','circle','segment','line','point','drawSegment','drawCircle','drawInscribedQuadrilateral','triangle_angles','triangle', 'drawPolygon', 'markLength', 'markAngle'].includes(o.type)))) ? (
          <div 
            className="avs-canvas-col order-first lg:order-last" 
            style={{ 
              position: 'relative',
              display: isMobile && activeTab !== 'graph' ? 'none' : 'flex'
            }}
          >
            {hasMath && <MathCanvas objects={accumulatedObjects} height={450} viewBox={isV3 ? data.viewBox : cur.math?.viewBox} />}
            {hasShapes && !isV3 && <LegacySvgCanvas shapes={cur.shapes} />}
          </div>
        ) : null}
      </div>

      {/* 하단 컨트롤 바: 단계 이동 · 풀이 컨트롤 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '1.5rem', flexWrap: 'wrap', marginTop: '1.1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>단계 이동</span>
          <button onClick={() => { setStep(0); setIsPlaying(false); }} className="avs-btn" style={btn('#334155', isMobile)}>처음</button>
          <button onClick={handlePrev} className="avs-btn" style={btn('#334155', isMobile)}>이전</button>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#fde047', fontSize: '0.85rem', minWidth: 56, textAlign: 'center' }}>STEP {step + 1} / {stepsData.length}</span>
          <button onClick={handleNext} className="avs-btn" style={btn('#334155', isMobile)}>다음 <StepForward size={isMobile ? 12 : 15} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: isMobile ? 0 : 'auto', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>풀이 컨트롤</span>
          <button onClick={handlePlay} className="avs-btn" style={btn('#7c3aed', isMobile)}>
            {isPlaying ? <><Pause size={isMobile ? 12 : 15} /> 정지</> : <><Play size={isMobile ? 12 : 15} /> 재생</>}
          </button>
          <button onClick={() => setPlaybackSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))} className="avs-btn" style={btn('#334155', isMobile)} title="재생 속도">
            {playbackSpeed.toFixed(1)}x
          </button>
        </div>
      </div>
    </div>
  );
}

function btn(bg, isMobile = false) {
  return {
    background: bg, border: 'none', color: 'white',
    padding: isMobile ? '2px 4px' : '0.4rem 0.8rem', borderRadius: isMobile ? 6 : 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: isMobile ? 2 : 5, fontSize: isMobile ? '0.65rem' : '0.85rem', fontWeight: 600,
    whiteSpace: 'nowrap', height: isMobile ? 28 : 'auto'
  };
}
