import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function preprocessRawMath(text) {
  if (!text) return '';
  let str = String(text);
  if (str.includes('$') || str.includes('\\[') || str.includes('\\(')) {
    return str;
  }
  
  const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(str);
  if (!hasKorean) {
    return `$${str}$`;
  }
  
  const mathCandidateRegex = /([a-zA-Z0-9\^_\+\-\*\/\=\<\>\(\)\\]+(?:\s*[a-zA-Z0-9\^_\+\-\*\/\=\<\>\(\)\\]+)*)/g;
  
  return str.replace(mathCandidateRegex, (match) => {
    const trimmedMatch = match.trim();
    if (!trimmedMatch) return match;
    
    if (/^[P|C|B|A|S]\s*:?$/.test(trimmedMatch)) {
      return match;
    }
    
    const hasMathSymbol = /[\^_\+\-\*\/\=\<\>\\()]/.test(trimmedMatch);
    const hasNumber = /[0-9]/.test(trimmedMatch);
    const isSingleVariable = /^[a-zA-Z]$/.test(trimmedMatch);
    
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
}

function renderMixed(text) {
  if (!text) return null;
  
  // 쌩 수식 텍스트들을 실시간 감지하여 $...$로 전처리 포장합니다.
  const processedText = preprocessRawMath(text);
  
  const parts = processedText.split(/(\$\$[^$]+?\$\$|\$[^$]+?\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      try {
        return <div key={i} style={{ margin: '0.5rem 0', textAlign: 'center' }}
          dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false, displayMode: true }) }} />;
      } catch { return <code key={i}>{part}</code>; }
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      try {
        return <span key={i}
          dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(1, -1), { throwOnError: false }) }} />;
      } catch { return <code key={i}>{part}</code>; }
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ProblemCard({ data, sourceImage, title, fallbackText }) {
  const finalBody = data?.body?.trim() ? data.body : fallbackText;
  const [showOriginal, setShowOriginal] = useState(!finalBody || finalBody.trim() === '');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  useEffect(() => {
    setShowOriginal(!finalBody || finalBody.trim() === '');
  }, [finalBody]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!data && !fallbackText) return null;

  return (
    <div style={{
      background: isMobile ? 'transparent' : 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
      borderRadius: isMobile ? '0px' : '16px',
      padding: isMobile ? '1.2rem 1rem' : '2rem',
      color: '#e2e8f0',
      border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isMobile ? 'none' : '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      marginBottom: isMobile ? '0px' : '1rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
            #{data.problem_id || '문제'}
          </span>
          {(data.title || title) && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{data.title || title}</span>}
        </div>
        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399',
          padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>📝 칠판 모드</span>
      </div>

      {/* Body */}
      <div style={{ fontSize: isMobile ? '1rem' : '1.15rem', lineHeight: 1.9, marginBottom: '1.5rem', color: '#f1f5f9', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {renderMixed(finalBody)}
      </div>

      {/* Formulas */}
      {data.formulas?.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
          padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {data.formulas.map((f, i) => {
            try {
              return <div key={i} style={{ textAlign: 'center', margin: '0.6rem 0', color: '#e2e8f0', overflowX: 'auto' }}
                dangerouslySetInnerHTML={{ __html: katex.renderToString(f, { throwOnError: false, displayMode: true }) }} />;
            } catch { return <div key={i} style={{ textAlign: 'center', color: '#fbbf24' }}>{f}</div>; }
          })}
        </div>
      )}

      {/* Choices */}
      {data.choices?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : (data.choices.length === 5 || data.choices.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'),
          gap: '0.6rem', marginBottom: '1.5rem' }}>
          {data.choices.map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
              padding: '0.7rem 1rem', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '1rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
              {renderMixed(c)}
            </div>
          ))}
        </div>
      )}

      {/* Toggle Original */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowOriginal(!showOriginal)}
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          {showOriginal ? '📝 문제 카드 보기' : '🖼 원본 이미지 보기'}
        </button>
      </div>

      {showOriginal && (sourceImage || data.source_image) && (
        <div style={{ marginTop: '1rem', background: 'white', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <img src={sourceImage || data.source_image} alt="원본 문제"
            style={{ width: '100%', height: isMobile ? 'auto' : '400px', maxHeight: isMobile ? '320px' : 'none', objectFit: 'contain', borderRadius: '8px' }}
            onError={e => { 
              e.target.style.display = 'none'; 
              if (e.target.parentElement) e.target.parentElement.style.display = 'none';
            }} />
        </div>
      )}
    </div>
  );
}
