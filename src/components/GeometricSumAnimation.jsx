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

export default function GeometricSumAnimation() {
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
    { text: "1. 등비수열의 첫째항부터 n항까지의 합 S_n을 나열합니다.", math: "S_n = a + ar + ar^2 + \\cdots + ar^{n-1}" },
    { text: "2. 이 식의 양변에 공비 r을 곱합니다. 모든 항의 차수가 하나씩 올라갑니다.", math: "rS_n = ar + ar^2 + ar^3 + \\cdots + ar^n" },
    { text: "3. 위 식에서 아래 식을 뺍니다. 중간에 겹치는 항들이 모두 도미노처럼 소거됩니다!", math: "S_n - rS_n = a - ar^n" },
    { text: "4. 좌변을 S_n으로, 우변을 a로 묶어줍니다.", math: "(1 - r)S_n = a(1 - r^n)" },
    { text: "5. 양변을 (1-r)로 나누면 등비수열의 합 공식이 유도됩니다! (단, r ≠ 1)", math: "S_n = \\frac{a(1 - r^n)}{1 - r} = \\frac{a(r^n - 1)}{r - 1}" }
  ];

  return (
    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-2xl my-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="m-0 text-emerald-400 text-xl font-bold">✨ 빼서 소거하기: 등비수열 합공식 유도</h3>
        <div className="flex gap-2">
          <button onClick={() => setStep(0)} className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors text-white"><RotateCcw size={18} /></button>
          <button onClick={() => { if(step >= 4) {setStep(0); setIsPlaying(true);} else setIsPlaying(!isPlaying); }} className="bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors text-white flex items-center gap-2 font-bold">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-xl border ${step === i ? 'bg-emerald-900/30 border-emerald-500' : 'bg-gray-800 border-gray-700'} transition-colors`}
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
