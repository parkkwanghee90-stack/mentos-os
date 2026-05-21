import React, { useState, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function DynamicProblemAnimation({ data }) {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const hasPages = Array.isArray(data?.pages);
  const [currentPage, setCurrentPage] = useState(0);
  const currentData = hasPages ? data.pages[currentPage] : data;

  useEffect(() => {
    let timer;
    if (isPlaying && currentData) {
      timer = setTimeout(() => {
        if (step < currentData.steps.length - 1) {
          setStep(s => s + 1);
        } else {
          // If auto-play is on, and we have more pages, wait briefly and go to next page
          if (hasPages && currentPage < data.pages.length - 1) {
            setTimeout(() => {
              setCurrentPage(p => p + 1);
              setStep(0);
            }, 1000);
          } else {
            setIsPlaying(false);
          }
        }
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step, currentData, hasPages, currentPage, data]);

  if (!data) return null;

  return (
    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px', color: 'white', marginTop: '1rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#a78bfa' }}><span role="img" aria-label="bot">🤖</span> 실전 문제 맞춤형 해설 애니메이션</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {hasPages && (
            <div style={{ marginRight: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#1e293b', padding: '0.3rem 0.8rem', borderRadius: '8px' }}>
              <button 
                onClick={() => { if (currentPage > 0) { setCurrentPage(p => p - 1); setStep(0); setIsPlaying(false); } }}
                style={{ background: 'none', border: 'none', color: currentPage > 0 ? '#60a5fa' : '#475569', cursor: currentPage > 0 ? 'pointer' : 'default', padding: '0' }}
              >
                ◀
              </button>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>페이지 {currentPage + 1} / {data.pages.length}</span>
              <button 
                onClick={() => { if (currentPage < data.pages.length - 1) { setCurrentPage(p => p + 1); setStep(0); setIsPlaying(false); } }}
                style={{ background: 'none', border: 'none', color: currentPage < data.pages.length - 1 ? '#60a5fa' : '#475569', cursor: currentPage < data.pages.length - 1 ? 'pointer' : 'default', padding: '0' }}
              >
                ▶
              </button>
            </div>
          )}
          <button onClick={() => { setStep(0); setCurrentPage(0); }} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="처음부터"><RotateCcw size={16} /></button>
          <button onClick={() => { 
            if(step >= currentData.steps.length - 1 && (!hasPages || currentPage === data.pages.length - 1)) {
              setStep(0); setCurrentPage(0); setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            } 
          }} style={{ background: '#8b5cf6', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            {isPlaying ? <><Pause size={16}/> 일시정지</> : <><Play size={16}/> 풀이 재생</>}
          </button>
          <button onClick={() => {
            if (step < currentData.steps.length - 1) setStep(s => s + 1);
            else if (hasPages && currentPage < data.pages.length - 1) { setCurrentPage(p => p + 1); setStep(0); }
          }} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            다음 <StepForward size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', height: '350px' }}>
          <svg viewBox="-50 -50 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {currentData.shapes.map((shape, idx) => {
              if (shape.stepIndex > step) return null; // 단계에 도달하기 전엔 숨김
              
              if (shape.type === 'polygon') {
                return <polygon key={idx} points={shape.points.map(p => p.join(',')).join(' ')} fill={shape.fill || 'none'} stroke={shape.stroke || '#cbd5e1'} strokeWidth="2" className="animate-fade-in" />;
              }
              if (shape.type === 'line') {
                return <line key={idx} x1={shape.points[0][0]} y1={shape.points[0][1]} x2={shape.points[1][0]} y2={shape.points[1][1]} stroke={shape.color || '#fcd34d'} strokeWidth="2" strokeDasharray={shape.style === 'dashed' ? '4,4' : 'none'} className="animate-fade-in" />;
              }
              if (shape.type === 'text') {
                return <text key={idx} x={shape.x} y={shape.y} fill={shape.color || '#f8fafc'} fontSize={shape.size || 14} fontWeight="bold" className="animate-fade-in">{shape.text}</text>;
              }
              if (shape.type === 'circle') {
                return <circle key={idx} cx={shape.cx} cy={shape.cy} r={shape.r || 3} fill={shape.color || '#f8fafc'} className="animate-fade-in" />;
              }
              return null;
            })}
          </svg>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
          {currentData.steps.map((txt, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                background: step === idx ? 'rgba(139, 92, 246, 0.2)' : (step > idx ? 'rgba(30, 41, 59, 0.5)' : 'transparent'),
                border: step === idx ? '1px solid #8b5cf6' : '1px solid transparent',
                color: step >= idx ? (step === idx ? '#c4b5fd' : '#cbd5e1') : '#475569',
                transition: 'all 0.3s', opacity: step >= idx ? 1 : 0.4,
                fontSize: '0.9rem'
              }}
            >
              <strong>{idx + 1}단계:</strong> {txt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
