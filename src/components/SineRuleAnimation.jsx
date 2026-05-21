import React, { useState, useEffect } from 'react';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';

export default function SineRuleAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (step < 4) setStep(s => s + 1);
        else setIsPlaying(false);
      }, 3000); // 3초마다 다음 스텝
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const stepsText = [
    "1. 삼각형 ABC와 외접원(반지름 R)이 주어졌습니다. 목표: sin A = a / 2R 증명",
    "2. 점 B에서 원의 중심 O를 지나도록 지름(2R)을 긋고 반대편에 점 A'를 찍습니다.",
    "3. 같은 호(BC)에 대한 원주각은 같으므로, ∠A = ∠A' 입니다.",
    "4. 지름(BA')에 대한 원주각은 항상 직각(90°)이므로, ∠BCA' = 90° 입니다.",
    "5. 직각삼각형 A'BC에서 빗변은 2R, 높이는 a이므로 sin(A') = a/2R. 즉, sin(A) = a/2R !"
  ];

  return (
    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '16px', color: 'white', marginTop: '1rem', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#60a5fa' }}><span role="img" aria-label="sparkles">✨</span> 사인법칙 시각화 애니메이션</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setStep(0)} 
            style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="처음부터"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => { if(step >= 4) {setStep(0); setIsPlaying(true);} else {setIsPlaying(!isPlaying);} }} 
            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
          >
            {isPlaying ? <><Pause size={16}/> 일시정지</> : <><Play size={16}/> 자동 재생</>}
          </button>
          <button 
            onClick={() => setStep(Math.min(4, step + 1))} 
            style={{ background: '#334155', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            다음 단계 <StepForward size={16} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* SVG Drawing Area */}
        <div style={{ flex: '1 1 300px', background: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', height: '350px' }}>
          <svg viewBox="-120 -120 240 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
            </defs>
            
            {/* Circumcircle */}
            <circle cx="0" cy="0" r="100" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />
            <circle cx="0" cy="0" r="3" fill="#cbd5e1" />
            <text x="5" y="15" fill="#cbd5e1" fontSize="12">O</text>
            
            {/* Radius R Indicator */}
            {step === 0 && (
                <g className="animate-fade-in">
                    <line x1="0" y1="0" x2="70.7" y2="-70.7" stroke="#64748b" strokeDasharray="4,4" />
                    <text x="30" y="-45" fill="#94a3b8" fontSize="12">R</text>
                </g>
            )}

            {/* Base Points of Triangle: A (-40, -91), B (-80, 60), C (80, 60) */}
            <g>
              <circle cx="-40" cy="-91.6" r="4" fill="#3b82f6" />
              <text x="-50" y="-100" fill="#3b82f6" fontSize="14" fontWeight="bold">A</text>
              
              <circle cx="-80" cy="60" r="4" fill="#60a5fa" />
              <text x="-100" y="70" fill="#60a5fa" fontSize="14">B</text>
              
              <circle cx="80" cy="60" r="4" fill="#60a5fa" />
              <text x="90" y="70" fill="#60a5fa" fontSize="14">C</text>

              {/* Angle A Highlight */}
              <path d="M -30 -80 Q -25 -70 -20 -95" fill="none" stroke={step >= 2 ? "#f59e0b" : "#3b82f6"} strokeWidth="2" />
            </g>

            {/* Original Triangle */}
            <path d="M -40 -91.6 L -80 60 L 80 60 Z" fill="none" stroke="#2563eb" strokeWidth="2" opacity={step >= 2 ? 0.3 : 1} transition="all 0.5s" />
            {/* Side a (BC) */}
            <text x="0" y="80" fill="#ec4899" fontSize="14" fontWeight="bold">a</text>
            <line x1="-80" y1="60" x2="80" y2="60" stroke="#ec4899" strokeWidth="3" />

            {/* Step 1 & 2: Draw A' through Center O from B */}
            {step >= 1 && (
              <g className="animate-fade-in" style={{ transition: 'opacity 0.5s' }}>
                {/* A' is diametrically opposite to B. B = (-80, 60), A' = (80, -60) */}
                <circle cx="80" cy="-60" r="4" fill="#f59e0b" />
                <text x="90" y="-65" fill="#f59e0b" fontSize="14" fontWeight="bold">A'</text>
                <line x1="-80" y1="60" x2="80" y2="-60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                <text x="0" y="-10" fill="#f59e0b" fontSize="12" fontWeight="bold">2R</text>
              </g>
            )}

            {/* Step 2 & 3: Connect A' to C and show Angles */}
            {step >= 2 && (
              <g className="animate-fade-in">
                <line x1="80" y1="-60" x2="80" y2="60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3,3" />
                {/* Highlight Arc BC */}
                <path d="M -80 60 A 100 100 0 0 0 80 60" fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.6" />
                {/* Angle A' Highlight */}
                <path d="M 75 -45 Q 65 -45 70 -65" fill="none" stroke="#f59e0b" strokeWidth="2" />
              </g>
            )}

            {/* Step 3: Show 90 degree angle at C */}
            {step >= 3 && (
              <g className="animate-fade-in">
                {/* Right angle square at C (80, 60) for triangle BA'C */}
                {/* B=(-80,60), C=(80,60), A'=(80,-60) */}
                <path d="M 68 60 L 68 48 L 80 48" fill="none" stroke="#10b981" strokeWidth="2" />
                <text x="50" y="45" fill="#10b981" fontSize="12" fontWeight="bold">90°</text>
              </g>
            )}

            {/* Step 4: Final Right Triangle Highlight */}
            {step >= 4 && (
              <g className="animate-fade-in">
                <polygon points="-80,60 80,-60 80,60" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="3" />
                {/* Math focus */}
                <text x="-25" y="-30" fill="#fcd34d" fontSize="16" fontWeight="bold" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>
                  sin(A') = a / 2R
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Text Steps Component */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          {stepsText.map((txt, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                background: step === idx ? 'rgba(59, 130, 246, 0.2)' : (step > idx ? 'rgba(30, 41, 59, 0.5)' : 'transparent'),
                border: step === idx ? '1px solid #3b82f6' : '1px solid transparent',
                color: step >= idx ? (step === idx ? '#93c5fd' : '#cbd5e1') : '#475569',
                transition: 'all 0.3s',
                opacity: step >= idx ? 1 : 0.4
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
