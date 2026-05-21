import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { speakText, getVoiceForTeacher } from '@/services/ttsService';

function SafeBlockMath({ math }) {
  let html = '';
  try { html = katex.renderToString(math, { throwOnError: false, displayMode: true, strict: false, trust: true }); }
  catch { html = "<span style="color:#ef4444`>${math}</span>`; }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
import MathFormulaView from './MathFormulaView';
import MathGraphBoard from './MathGraphBoard';

export default function WhiteFocusMode({ subject, onClose, teacher }) {
  const [step, setStep] = useState(0);

  const isMath = subject === 'math' || subject === '수학';
  const isEng = subject === 'english' || subject === '영어';
  const isSci = ['physics', 'chemistry', 'biology', 'earthScience', 'earth_science', '물리', '화학', '생명과학', '지구과학', '과학'].includes(subject);

  const data = getSubjectData(subject);

  useEffect(() => {
    if (data && data.steps) {
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < data.steps.length) {
          setStep(prev => prev + 1);
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [subject, data?.steps?.length]);

  const onRead = (text) => {
    speakText(text, { voice: getVoiceForTeacher(teacher), subject });
  };
  const onExplain = (text) => {
    speakText(text, { voice: getVoiceForTeacher(teacher), subject });
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '20px',
      position: 'relative',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    }}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute', top: '2rem', right: '2rem',
          padding: '0.8rem 1.5rem',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: '#000000',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        학습 화면 복귀
      </button>

      <div style={{ width: '85%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center' }}>
        
        {isEng && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
            {data.steps.map((s, idx) => (
              <div 
                key={idx} 
                style={{
                  opacity: step > idx ? 1 : 0, 
                  transform: step > idx ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 1s ease, transform 1s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                  width: '100%'
                }}
              >
                <div style={{ fontSize: '2.2rem', fontWeight: '700', color: '#111827', textAlign: 'center', lineHeight: '1.5' }}>
                  {s.sentence}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => onRead(s.sentence)} style={{ padding: '0.8rem 1.5rem', fontSize: '1.2rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                    ▶ 읽기
                  </button>
                  <button onClick={() => onExplain(s.explanation)} style={{ padding: '0.8rem 1.5rem', fontSize: '1.2rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    💡 설명
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isMath && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3rem', width: '100%', maxWidth: '800px', alignSelf: 'center' }}>
            {data.steps.map((s, idx) => (
              <div 
                key={idx} 
                style={{
                  opacity: step > idx ? 1 : 0, 
                  transform: step > idx ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 1s ease, transform 1s ease',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  padding: '2rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {s.explanation}
                </div>
                
                {s.formulaLatex && (
                  <MathFormulaView latex={s.formulaLatex} />
                )}

                {s.graph && (
                  <MathGraphBoard graphData={s.graph} />
                )}
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button onClick={() => onExplain(s.explanation)} style={{ padding: '0.6rem 1.2rem', fontSize: '1rem', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '8px', cursor: 'pointer', color: '#4f46e5', fontWeight: 'bold' }}>
                    💡 AI 음성 듣기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isSci && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5rem', width: '100%' }}>
            <div style={{ 
               opacity: step > 0 ? 1 : 0, transform: step > 0 ? 'scale(1)' : 'scale(0.9)', transition: 'all 0.8s ease',
               fontSize: '2.5rem', fontWeight: '800', color: '#059669',
               background: '#ecfdf5', padding: '1.5rem 4rem', borderRadius: '24px', border: '3px solid #34d399',
               boxShadow: '0 10px 25px rgba(52, 211, 153, 0.2)'
            }}>
               [개념] {data.concept}
            </div>
            <div style={{ 
               opacity: step > 1 ? 1 : 0, transform: step > 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease',
               fontSize: '4rem', color: '#1e293b'
            }}>
               <SafeBlockMath math={data.formula} />
            </div>
            <div style={{ 
               opacity: step > 2 ? 1 : 0, transform: step > 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease',
               fontSize: '1.8rem', color: '#334155', lineHeight: '1.7', textAlign: 'center',
               background: '#f8fafc', padding: '2.5rem', borderRadius: '20px', borderLeft: '8px solid #94a3b8',
               boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
               <span style={{ fontWeight: '800', color: '#0f172a' }}>[물리적 의미]</span><br/><br/>
               {data.meaning.split('\n').map((line, i) => (
                 <span key={i}>{line}<br/></span>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function getSubjectData(subject) {
  const isMath = subject === 'math' || subject === '수학';
  const isEng = subject === 'english' || subject === '영어';
  const isSci = ['physics', 'chemistry', 'biology', 'earthScience', 'earth_science', '물리', '화학', '생명과학', '지구과학', '과학'].includes(subject);

  if (isEng) {
    return {
      steps: [
        { 
          sentence: "The rapid development of artificial intelligence has significantly altered the way we interact with technology.",
          explanation: "인공지능의 빠른 발전은 우리가 기술과 상호작용하는 방식을 크게 바꾸어 놓았습니다. altered는 changed보다 더 근본적인 변화를 의미합니다."
        },
        {
          sentence: "Not only does it automate mundane tasks, but it also provides creative solutions to complex problems.",
          explanation: "Not only 부정어 도치 구문입니다. 지루한 일상 업무를 자동화할 뿐만 아니라, 복잡한 문제에 창의적인 해결책을 제공합니다."
        }
      ]
    };
  } else if (isMath) {
    return {
      steps: [
        { 
          explanation: "이 함수는 위로 열린 포물선입니다. 꼭짓점은 (0,0)에 위치하며 좌우가 대칭인 이차함수의 가장 기본적인 형태입니다.",
          formulaLatex: "y=x^2",
          graph: {
            expressions: ["y=x^2"],
            viewport: { xmin: -5, xmax: 5, ymin: -2, ymax: 10 }
          }
        },
        { 
          explanation: "이 도형은 중심이 (0,0)이고 반지름이 2인 아름다운 원입니다. 원의 방정식의 본질을 보여줍니다.",
          formulaLatex: "x^2+y^2=4",
          graph: {
            expressions: ["x^2+y^2=4"],
            highlights: [
              { type: "point", x: 0, y: 0, label: "중심 (0,0)" }
            ],
            viewport: { xmin: -4, xmax: 4, ymin: -4, ymax: 4 }
          }
        },
        { 
          explanation: "지수함수입니다. x가 증가함에 따라 값이 폭발적으로 기하급수적으로 커지는 특징을 가집니다.",
          formulaLatex: "y=2^x",
          graph: {
            expressions: ["y=2^x"],
            viewport: { xmin: -4, xmax: 5, ymin: -2, ymax: 16 }
          }
        }
      ]
    };
  } else if (isSci) {
    return {
      concept: "속도 (Velocity)",
      formula: "v = \\frac{\\Delta x}{\\Delta t}",
      meaning: "단위 시간당 위치의 변화량입니다.\n빠르기만이 아니라 '이동 방향'까지 포함하는 벡터 물리량으로, 일상생활의 속력(Speed)과는 차이가 있습니다.",
      steps: [1, 2, 3]
    };
  }
  return { steps: [] };
}
