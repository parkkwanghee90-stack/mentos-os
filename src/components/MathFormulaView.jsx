import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathFormulaView({ latex }) {
  if (!latex) return null;

  let html = '';
  try {
    html = katex.renderToString(latex, { throwOnError: false, displayMode: true, strict: false, trust: true });
  } catch {
    html = "<span style="color:#ef4444`>${latex}</span>`;
  }

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      borderLeft: '8px solid #3b82f6', // Blueprint color
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      overflowX: 'auto',
      width: '100%'
    }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
