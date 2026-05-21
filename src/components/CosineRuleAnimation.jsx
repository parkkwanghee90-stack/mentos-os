import React, { useState, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function CosineRuleAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (step < 5) setStep(s => s + 1);
        else setIsPlaying(false);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const stepsText = [
    "1. 삼각형 ABC가 주어져 있습니다. 목표: b² = a² + c² - 2ac cos(B) 증명",
    "2. 점 A에서 밑변 BC로 수선의 발 H를 내립니다. (직각삼각형 2개 생성)",
    "3. 왼쪽 직각삼각형 ABH에서 빗변이 c이므로, 높이 AH = c·sin(B), 밑변 BH = c·cos(B) 가 됩니다.",
    "4. 전체 밑변 BC의 길이가 a이므로, 남은 선분 HC의 길이는 a - c·cos(B) 가 됩니다.",
    "5. 이제 오른쪽 직각삼각형 AHC에서 피타고라스 정리를 씁니다: b² = AH² + HC²",
    "6. 대입하여 전개: b² = (c·sinB)² + (a - c·cosB)² = c²sin²B + a² - 2ac·cosB + c²cos²B. \nsin²B + cos²B = 1 이므로, b² = a² + c² - 2ac·cosB 완성!"
  ];

  return (
    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px', color: 'white', marginTop: '1rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#fca5a5' }}><span role="img" aria-label="sparkles">📐</span> 코사인법칙 시각화 애니메이션</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setStep(0)} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="처음부터"><RotateCcw size={16} /></button>
          <button onClick={() => { if(step >= 5) {setStep(0); setIsPlaying(true);} else {setIsPlaying(!isPlaying);} }} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
            {isPlaying ? <><Pause size={16}/> 일시정지</> : <><Play size={16}/> 자동 재생</>}
          </button>
          <button onClick={() => setStep(Math.min(5, step + 1))} style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            다음 단계 <StepForward size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', height: '350px' }}>
          <svg viewBox="-100 -120 250 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Base Triangle: A(0, -90), B(-70, 70), C(110, 70) => H(0, 70) */}
            
            {/* Draw Sub-Triangles conditionally for highlights */}
            {step >= 2 && step <= 3 && (
              <polygon points="0,-90 -70,70 0,70" fill="rgba(96, 165, 250, 0.2)" stroke="none" />
            )}
            {step >= 4 && (
              <polygon points="0,-90 110,70 0,70" fill="rgba(248, 113, 113, 0.2)" stroke="none" />
            )}

            {/* Main Triangle ABC */}
            <path d="M 0 -90 L -70 70 L 110 70 Z" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            
            <circle cx="0" cy="-90" r="4" fill="#f8fafc" />
            <text x="-5" y="-100" fill="#f8fafc" fontSize="14" fontWeight="bold">A</text>
            
            <circle cx="-70" cy="70" r="4" fill="#f8fafc" />
            <text x="-85" y="80" fill="#f8fafc" fontSize="14" fontWeight="bold">B</text>
            
            <circle cx="110" cy="70" r="4" fill="#f8fafc" />
            <text x="120" y="80" fill="#f8fafc" fontSize="14" fontWeight="bold">C</text>

            <text x="-45" y="-10" fill="#60a5fa" fontSize="14" fontWeight="bold">c</text>
            <text x="65" y="-10" fill="#f87171" fontSize="14" fontWeight="bold">b</text>
            {step < 3 && <text x="20" y="90" fill="#a78bfa" fontSize="14" fontWeight="bold">a</text>}

            {/* Step 1: Draw Altitude AH */}
            {step >= 1 && (
              <g className="animate-fade-in">
                <line x1="0" y1="-90" x2="0" y2="70" stroke="#fcd34d" strokeWidth="2" strokeDasharray="4,4" />
                <circle cx="0" cy="70" r="4" fill="#fcd34d" />
                <text x="-5" y="90" fill="#fcd34d" fontSize="14" fontWeight="bold">H</text>
                {/* 90 deg box */}
                <path d="M 0 60 L 10 60 L 10 70" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
                <path d="M 0 60 L -10 60 L -10 70" fill="none" stroke="#fcd34d" strokeWidth="1.5" />
              </g>
            )}

            {/* Step 2: Show AH and BH using trig */}
            {step >= 2 && (
              <g className="animate-fade-in">
                <text x="5" y="5" fill="#60a5fa" fontSize="12" fontWeight="bold" transform="rotate(-90 5,5)">c·sin(B)</text>
                <text x="-55" y="65" fill="#60a5fa" fontSize="12" fontWeight="bold">c·cos(B)</text>
              </g>
            )}

            {/* Step 3: Show HC = a - c cos B */}
            {step >= 3 && (
              <g className="animate-fade-in">
                <text x="25" y="65" fill="#a78bfa" fontSize="12" fontWeight="bold">a - c·cos(B)</text>
              </g>
            )}

            {/* Step 4 & 5: Highlight Right side Pythagorean */}
            {step >= 4 && (
              <g className="animate-fade-in">
                <text x="-20" y="120" fill="#f87171" fontSize="16" fontWeight="bold" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>
                  b² = (c·sinB)² + (a - c·cosB)²
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
                background: step === idx ? 'rgba(239, 68, 68, 0.2)' : (step > idx ? 'rgba(30, 41, 59, 0.5)' : 'transparent'),
                border: step === idx ? '1px solid #ef4444' : '1px solid transparent',
                color: step >= idx ? (step === idx ? '#fca5a5' : '#cbd5e1') : '#475569',
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
