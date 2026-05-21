import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Play, Pause, StepForward, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SafeBlockMath({ math }) {
  let html = '';
  try { html = katex.renderToString(math, { throwOnError: false, displayMode: true, strict: false, trust: true }); }
  catch { html = `<span style="color:#ef4444">${math}</span>`; }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ArithmeticSumAnimation() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (step < 4) setStep(s => s + 1);
        else setIsPlaying(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const steps = [
    { text: "1. 등차수열의 첫째항부터 n항까지의 합 S_n을 나열합니다.", math: "S_n = a + (a+d) + (a+2d) + \\cdots + (l-d) + l" },
    { text: "2. 이번엔 순서를 거꾸로 뒤집어서 다시 나열해 봅니다.", math: "S_n = l + (l-d) + (l-2d) + \\cdots + (a+d) + a" },
    { text: "3. 위 두 식을 위아래로 더합니다. 중간의 공차 d들이 서로 상쇄됩니다!", math: "2S_n = (a+l) + (a+l) + (a+l) + \\cdots + (a+l) + (a+l)" },
    { text: "4. (a+l)이 총 n개 생기므로, 우변은 n(a+l)이 됩니다.", math: "2S_n = n(a+l)" },
    { text: "5. 양변을 2로 나누면, 우리가 아는 등차수열의 합 공식이 완성됩니다!", math: "S_n = \\frac{n(a+l)}{2}" }
  ];

  return (
    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl my-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-blue-400 text-xl font-bold">✨ 가우스의 아이디어: 등차수열 합공식 유도</h3>
        <div className="flex gap-2">
          <button onClick={() => setStep(0)} className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"><RotateCcw size={18} /></button>
          <button onClick={() => { if(step >= 4) {setStep(0); setIsPlaying(true);} else setIsPlaying(!isPlaying); }} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors text-white flex items-center gap-2 font-bold">
            {isPlaying ? <><Pause size={18}/> 정지</> : <><Play size={18}/> 자동 재생</>}
          </button>
          <button onClick={() => setStep(Math.min(4, step + 1))} className="bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-white flex items-center gap-2">
            다음 <StepForward size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {steps.map((s, i) => (
          <AnimatePresence key={i}>
            {step >= i && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-xl border ${step === i ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800 border-gray-700'} transition-colors`}
              >
                <div className="text-gray-300 mb-4">{s.text}</div>
                <div className="text-2xl text-white overflow-x-auto text-center">
                  <SafeBlockMath math={s.math} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
}
