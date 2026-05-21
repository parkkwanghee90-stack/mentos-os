import React, { useState, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function TriangleAreaAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (step < 5) setStep(s => s + 1);
        else setIsPlaying(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const stepsText = [
    "1. 두 변의 길이 a, b 와 끼인각 C를 아는 삼각형 ABC가 있습니다.",
    "2. 일반적인 넓이 공식은 (밑변 × 높이 ÷ 2) 입니다. 이 삼각형의 밑변은 a 입니다.",
    "3. 꼭짓점 A에서 밑변 BC의 연장선에 수선의 발 H를 내립니다. (높이 h)",
    "4. 빗변이 b인 직각삼각형 AHC가 보입니다. 삼각비에 의해 sin(C) = h / b 입니다.",
    "5. 정리하면 h = b·sin(C) 가 됩니다.",
    "6. 기본 넓이 공식 S = 1/2 · a · h 에 h를 대입하면, S = 1/2 · a · b·sin(C) 가 증명됩니다!"
  ];

  return (
    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px', color: 'white', marginTop: '1rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#34d399' }}><span role="img" aria-label="sparkles">📐</span> 삼각형의 넓이 증명 시각화</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setStep(0)} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="처음부터"><RotateCcw size={16} /></button>
          <button onClick={() => { if(step >= 5) {setStep(0); setIsPlaying(true);} else {setIsPlaying(!isPlaying);} }} style={{ background: '#10b981', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            {isPlaying ? <><Pause size={16}/> 일시정지</> : <><Play size={16}/> 자동 재생</>}
          </button>
          <button onClick={() => setStep(Math.min(5, step + 1))} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            다음 단계 <StepForward size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', height: '350px' }}>
          <svg viewBox="-70 -120 220 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Draw Sub-Triangle conditionally for highlights */}
            {step >= 3 && step <= 4 && (
              <polygon points="0,-90 100,60 0,60" fill="rgba(52, 211, 153, 0.2)" stroke="none" />
            )}

            {/* Main Triangle ABC: A(0,-90), B(-60,60), C(100,60). Let's shift so C is angle. */}
            <path d="M 0 -90 L -60 60 L 100 60 Z" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            
            <circle cx="0" cy="-90" r="4" fill="#f8fafc" />
            <text x="-5" y="-100" fill="#f8fafc" fontSize="14" fontWeight="bold">A</text>
            
            <circle cx="-60" cy="60" r="4" fill="#f8fafc" />
            <text x="-75" y="70" fill="#f8fafc" fontSize="14" fontWeight="bold">B</text>
            
            <circle cx="100" cy="60" r="4" fill="#f8fafc" />
            <text x="110" y="70" fill="#f8fafc" fontSize="14" fontWeight="bold">C</text>

            {/* Angle C Highlight */}
            <path d="M 80 60 L 82 45 Q 90 40 100 45" fill="none" stroke="#34d399" strokeWidth="2" opacity={step >= 0 ? 1 : 0} />
            <text x="75" y="40" fill="#34d399" fontSize="14" fontWeight="bold">C</text>

            <text x="55" y="-20" fill="#60a5fa" fontSize="14" fontWeight="bold">b</text>
            {step < 5 && <text x="20" y="80" fill="#a78bfa" fontSize="14" fontWeight="bold">a</text>}

            {/* Step 1 & 2: Base a highlight */}
            {step >= 1 && (
              <line x1="-60" y1="60" x2="100" y2="60" stroke="#a78bfa" strokeWidth="4" />
            )}

            {/* Step 2: Altitude AH */}
            {step >= 2 && (
              <g className="animate-fade-in">
                <line x1="0" y1="-90" x2="0" y2="60" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4,4" />
                <circle cx="0" cy="60" r="4" fill="#fcd34d" />
                <text x="-15" y="55" fill="#fcd34d" fontSize="14" fontWeight="bold">H</text>
                {/* 90 deg box */}
                <path d="M 0 50 L 10 50 L 10 60" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                
                {step < 4 && <text x="5" y="-10" fill="#fcd34d" fontSize="14" fontWeight="bold">h</text>}
              </g>
            )}

            {/* Step 4: Show h = b sin C */}
            {step >= 4 && (
              <g className="animate-fade-in">
                <text x="5" y="-10" fill="#fcd34d" fontSize="14" fontWeight="bold">b·sin(C)</text>
              </g>
            )}

            {/* Step 5: Final Formula */}
            {step >= 5 && (
              <g className="animate-fade-in">
                <rect x="-65" y="90" width="180" height="30" fill="rgba(52,211,153,0.2)" rx="5" />
                <text x="-50" y="110" fill="#6ee7b7" fontSize="16" fontWeight="bold">
                  S = ½ a (b·sin C)
                </text>
              </g>
            )}
          </svg>
        </div>

        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
          {stepsText.map((txt, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '0.8rem 1rem', 
                borderRadius: '8px', 
                background: step === idx ? 'rgba(52, 211, 153, 0.2)' : (step > idx ? 'rgba(30, 41, 59, 0.5)' : 'transparent'),
                border: step === idx ? '1px solid #10b981' : '1px solid transparent',
                color: step >= idx ? (step === idx ? '#6ee7b7' : '#cbd5e1') : '#475569',
                transition: 'all 0.3s', opacity: step >= idx ? 1 : 0.4,
                fontSize: '0.9rem'
              }}
            >
              {txt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
