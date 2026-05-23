/**
 * MathProblemRenderer.jsx
 * 문제 텍스트를 본문 + 보기로 분리하여 완벽 렌더링
 * - 본문: MathText 파서 ($$...$$ 및 $...$)
 * - 보기: MathText 파서로 KaTeX 렌더링 (모바일 세로 리스트 대응)
 */
import React from 'react';
import { InlineMath, BlockMath } from '@/components/KaTeXWrapper';
import 'katex/dist/katex.min.css';

const OPTION_CHARS = ['①','②','③','④','⑤'];

// ── 1. 수식/텍스트 공통 전처리 (정규화) ──
function normalizeMathText(raw) {
  if (!raw) return '';
  let txt = String(raw);

  // 1. 역슬래시+n 문자열을 실제 줄바꿈으로 변환하되, LaTeX 명령어(\neq, \nabla 등)는 보호
  // 또한, 이미 실제 줄바꿈 문자로 변환되어 버린 LaTeX 명령어들을 다시 \n 형태로 복구
  txt = txt
    .replace(/\n(?=eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\\n')
    .replace(/\\\\n/g, '\n')
    .replace(/\\n(?!eq|abla|u|otin|subseteq|supset|Rightarrow|Leftrightarrow|i|olimits|ormalfont|ewline|exists)/g, '\n');

  // 2. \[ ... \] 를 $$ ... $$ 로 변환 (일부 환경에서 \[ 가 오작동하는 경우 대비)
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

// KaTeX 수식이 섞인 텍스트를 React 요소로 변환 (순수 파서)
export function MathText({ text }) {
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
      <div key={key++} style={{ margin: '0.4rem 0', overflowX: 'auto', maxWidth: '100%' }}>
        <BlockMath math={bMath} errorColor="#ef4444"
          renderError={() => <span style={{ color:'#ef4444' }}>{bFull}</span>} />
      </div>
    );
    lastIdx = bMatch.index + bFull.length;
  }
  if (lastIdx < normalized.length) {
    parts.push(<InlineFrag key={key++} text={normalized.slice(lastIdx)} />);
  }
  return <>{parts}</>;
}

// 인라인 수식 $...$ 파서
function InlineFrag({ text }) {
  if (!text) return null;
  const parts = [];
  const reg = /\$((?:[^$\\]|\\[\s\S])+?)\$/g;
  let last = 0, m, k = 0;
  while ((m = reg.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    const mFull = m[0];
    const mMath = m[1];
    parts.push(
      <InlineMath key={k++} math={mMath} errorColor="#ef4444"
        renderError={() => <span style={{ color:'#ef4444' }}>{mFull}</span>} />
    );
    last = m.index + mFull.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

// 보기 하나 렌더링
function OptionItem({ circle, value, index, isLong = false }) {
  return (
    <div className="math-option-item" style={{
      display: 'flex',
      alignItems: isLong ? 'flex-start' : 'center',
      gap: '10px',
      padding: isLong ? '0.75rem 1rem' : '0.5rem 0.8rem',
      background: 'rgba(59,130,246,0.06)',
      borderRadius: '8px',
      border: '1px solid rgba(59,130,246,0.15)',
      minWidth: 0,
      boxSizing: 'border-box',
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
    }}>
      <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1rem', flexShrink: 0, paddingTop: isLong ? '0.1rem' : 0 }}>
        {circle}
      </span>
      <span style={{ fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.8, minWidth: 0, overflow: 'hidden' }}>
        <MathText text={value} />
      </span>
    </div>
  );
}

// 문장 자동 줄바꿈
function addSmartLineBreaks(body) {
  return body
    .replace(/([이하]다\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(하자\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(있다\.)\s+(?=[가-힣A-Z$])/g, '$1\n')
    .replace(/(라 하자\.)\s+/g, '$1\n')
    .replace(/(\))\s+(이때|이 때|단,|여기서|다음)/g, '$1\n$2')
    .replace(/(이고,)\s+(?=[가-힣$])/g, '$1\n')
    .replace(/(이며,)\s+(?=[가-힣$])/g, '$1\n')
    .replace(/(이라 할 때,)\s+/g, '$1\n')
    .replace(/(라 하면)\s+(?=[가-힣$])/g, '$1\n');
}

export default function MathProblemRenderer({ text, title, sourceImage, selectedAnswer, onOptionSelect, choices }) {
  const [showOriginal, setShowOriginal] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!text) return null;

  // 1. 공통 전처리 적용
  const normalizedText = normalizeMathText(text);

  // 2. 보기 시작점 찾기
  const optStartIdx = normalizedText.search(/[①②③④⑤]/);

  let body = optStartIdx === -1 ? normalizedText : normalizedText.slice(0, optStartIdx);
  const optBlock = optStartIdx === -1 ? '' : normalizedText.slice(optStartIdx);

  // 3. 본문 정규화 (스마트 줄바꿈)
  body = addSmartLineBreaks(body.trim());

  // 보기 추출
  const options = [];
  if (optBlock) {
    const reg = /(①|②|③|④|⑤)\s*([^\n①②③④⑤]*)/g;
    let m;
    while ((m = reg.exec(optBlock)) !== null) {
      options.push({ circle: m[1], value: m[2].trim() });
    }
  }

  const hasOptions = options.length === 5;
  
  // 만약 텍스트 내에 보기가 없고, 외부에서 choices 배열을 넘겨받은 경우 (주관식의 객관식화)
  if (!hasOptions && choices && choices.length === 5) {
    options.length = 0;
    choices.forEach((val, i) => {
      options.push({ circle: OPTION_CHARS[i], value: val });
    });
  }

  const finalHasOptions = options.length === 5;

  return (
    <div className="white-bg-katex math-problem-card" style={{ width: '100%', color: '#0f172a', boxSizing: 'border-box' }}>
      {/* 본문: 전체 단락 렌더링 (멀티라인 $$ 보존) */}
      <div className="math-problem-body" style={{ fontSize: isMobile ? '1rem' : '1.15rem', lineHeight: 2.0, marginBottom: '1.2rem', wordBreak: 'keep-all', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxWidth: '100%' }}>
        <MathText text={body} />
      </div>

      {/* 보기: 세로 리스트 (모바일 친화) */}
      {finalHasOptions && (
        <div className="math-options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(() => {
            const maxLen = Math.max(...options.map(o => (o.value || '').length));
            const isLong = maxLen > 30;
            
            const isCalc19 = title && title.includes('급수') && title.includes('19번');
            let gridCol = isLong ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))';
            let gridGap = isLong ? '0.75rem' : '0.5rem';
            
            if (isMobile) {
              gridCol = '1fr';
              gridGap = '0.6rem';
            } else if (isCalc19) {
              gridCol = 'repeat(5, 1fr)'; // 오직 급수 19번만 가로 한 줄에 5개 다 배치
              gridGap = '0.85rem';       // 간격도 충분히 넓힘
            }

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: gridCol,
                gap: gridGap
              }}>
                {options.map((opt, i) => (
                  <OptionItem key={i} circle={opt.circle} value={opt.value} index={i} isLong={isLong} />
                ))}
              </div>
            );
          })()}
        </div>
      )}
      {/* Toggle Original */}
      {sourceImage && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button 
            onClick={() => setShowOriginal(!showOriginal)}
            style={{ 
              background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#3b82f6', padding: '0.6rem 1.2rem', borderRadius: '10px', 
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {showOriginal ? '📝 텍스트 문제 보기' : '🖼 원본 이미지 보기'}
          </button>
        </div>
      )}

      {showOriginal && sourceImage && (
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <img 
            src={sourceImage} 
            alt="원본 문제"
            style={{ width: '100%', maxWidth: '100%', maxHeight: isMobile ? '320px' : '500px', objectFit: 'contain', borderRadius: '8px' }}
            onError={e => { 
              e.target.style.display = 'none'; 
              if (e.target.parentElement) e.target.parentElement.style.display = 'none';
            }} 
          />
        </div>
      )}
    </div>
  );
}
