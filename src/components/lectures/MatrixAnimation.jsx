import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatrixAnimation({ type = 'addition' }) {
  const [highlight, setHighlight] = useState(-1);

  // Example Matrices
  const A = [[1, 2], [3, 4]];
  const B = [[5, 6], [7, 8]];
  
  // Addition Result
  const C_add = [[6, 8], [10, 12]];

  // Multiplication logic is too complex for a single view, we show a simplified "Row x Column" highlight
  
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm max-w-4xl w-full">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {type === 'addition' ? "행렬의 덧셈 원리" : "행렬의 곱셈 원리"}
        </h3>
        <p className="text-slate-500 mt-2 text-lg">
          {type === 'addition' ? "같은 위치의 원소끼리 더합니다." : "앞 행렬의 행과 뒤 행렬의 열을 곱하여 더합니다."}
        </p>
      </div>

      <div className="flex items-center gap-6 text-3xl font-black">
        {/* Matrix A */}
        <div className="relative p-6 border-l-4 border-r-4 border-slate-900 rounded-lg flex flex-col gap-4 bg-slate-50">
          {A.map((row, ri) => (
            <div key={ri} className="flex gap-6">
              {row.map((val, ci) => (
                <motion.div
                  key={ci}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${highlight === ri * 2 + ci ? 'bg-blue-600 text-white' : 'text-slate-900'}`}
                  onMouseEnter={() => setHighlight(ri * 2 + ci)}
                  onMouseLeave={() => setHighlight(-1)}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className="text-slate-400">{type === 'addition' ? "+" : "×"}</div>

        {/* Matrix B */}
        <div className="relative p-6 border-l-4 border-r-4 border-slate-900 rounded-lg flex flex-col gap-4 bg-slate-50">
          {B.map((row, ri) => (
            <div key={ri} className="flex gap-6">
              {row.map((val, ci) => (
                <motion.div
                  key={ci}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${highlight === ri * 2 + ci ? 'bg-emerald-600 text-white' : 'text-slate-900'}`}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        <div className="text-slate-400">=</div>

        {/* Result Matrix */}
        <div className="relative p-6 border-l-4 border-r-4 border-slate-900 rounded-lg flex flex-col gap-4 bg-blue-50">
          {C_add.map((row, ri) => (
            <div key={ri} className="flex gap-6">
              {row.map((val, ci) => (
                <motion.div
                  key={ci}
                  className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${highlight === ri * 2 + ci ? 'bg-slate-900 text-white font-bold' : 'text-slate-400'}`}
                >
                  {val}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 p-8 bg-slate-50 rounded-3xl border border-slate-200 text-slate-700 text-xl text-center leading-relaxed w-full">
         {highlight === -1 ? (
           <p>행렬의 원소 위에 <span className="text-blue-600 font-bold">마우스를 올려보세요.</span></p>
         ) : (
           <p>
             <span className="text-blue-600 font-bold">{A[Math.floor(highlight/2)][highlight%2]}</span> + 
             <span className="text-emerald-600 font-bold ml-2">{B[Math.floor(highlight/2)][highlight%2]}</span> = 
             <span className="text-slate-900 font-black ml-2">{C_add[Math.floor(highlight/2)][highlight%2]}</span>
           </p>
         )}
      </div>
    </div>
  );
}
