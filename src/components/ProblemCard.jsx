import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderMixed(text) {
  if (!text) return null;
  const parts = text.split(/(\$\$[^$]+?\$\$|\$[^$]+?\$)/g);
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
  const [showOriginal, setShowOriginal] = React.useState(!finalBody || finalBody.trim() === '');
  
  React.useEffect(() => {
    setShowOriginal(!finalBody || finalBody.trim() === '');
  }, [finalBody]);
  
  if (!data && !fallbackText) return null;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1a1a2e, #16213e, #0f3460)',
      borderRadius: '16px', padding: '2rem', color: '#e2e8f0',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      marginBottom: '2rem'
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
      <div style={{ fontSize: '1.15rem', lineHeight: 1.9, marginBottom: '1.5rem', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
        {renderMixed(finalBody)}
      </div>

      {/* Formulas */}
      {data.formulas?.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
          padding: '1.2rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {data.formulas.map((f, i) => {
            try {
              return <div key={i} style={{ textAlign: 'center', margin: '0.6rem 0', color: '#e2e8f0' }}
                dangerouslySetInnerHTML={{ __html: katex.renderToString(f, { throwOnError: false, displayMode: true }) }} />;
            } catch { return <div key={i} style={{ textAlign: 'center', color: '#fbbf24' }}>{f}</div>; }
          })}
        </div>
      )}

      {/* Choices */}
      {data.choices?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: data.choices.length === 5 || data.choices.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '0.6rem', marginBottom: '1.5rem' }}>
          {data.choices.map((c, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
              padding: '0.7rem 1rem', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '1rem', color: '#cbd5e1', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'pre-wrap' }}
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
            style={{ width: '100%', height: '400px', objectFit: 'contain', borderRadius: '8px' }}
            onError={e => { e.target.style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
}
