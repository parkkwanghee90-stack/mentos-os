import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StarsAndBarsAnimation() {
  const [showBars, setShowBars] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm max-w-4xl w-full">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">중복조합의 원리: <span className="text-blue-600">칸막이 모델</span></h3>
        <p className="text-slate-500 mt-2 text-lg">3종류의 과일(n=3) 중 5개(r=5)를 뽑는 상황</p>
      </div>

      <div className="relative flex items-center justify-center h-48 bg-slate-50 rounded-3xl w-full border border-slate-100 overflow-hidden px-10">
        <div className="flex items-center gap-6 z-10">
          {/* 5 Stars */}
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={`star-${i}`}
              className="w-14 h-14 rounded-full bg-amber-400 border-4 border-amber-500 flex items-center justify-center text-amber-900 text-3xl shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              ★
            </motion.div>
          ))}
        </div>

        {/* 2 Bars */}
        <AnimatePresence>
          {showBars && (
            <>
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute w-2.5 h-32 bg-blue-500 rounded-full shadow-lg"
                style={{ left: '35%' }}
              />
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute w-2.5 h-32 bg-blue-500 rounded-full shadow-lg"
                style={{ left: '65%' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Labels when bars are shown */}
        {showBars && (
          <div className="absolute inset-0 flex justify-between px-16 items-end pb-4 pointer-events-none">
             <span className="text-blue-600 font-black text-sm uppercase">Group 1</span>
             <span className="text-blue-600 font-black text-sm uppercase">Group 2</span>
             <span className="text-blue-600 font-black text-sm uppercase">Group 3</span>
          </div>
        )}
      </div>

      <div className="mt-12 w-full">
        <div className="flex flex-col items-center gap-8">
          <button 
            onClick={() => setShowBars(!showBars)}
            className={`px-10 py-4 rounded-2xl font-black text-xl transition-all shadow-lg active:scale-95 ${showBars ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showBars ? "칸막이 제거" : "칸막이로 종류 나누기"}
          </button>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 text-slate-700 text-xl text-center leading-relaxed w-full">
            {showBars ? (
              <p>
                별 5개와 칸막이 2개를 일렬로 세우는 <span className="text-emerald-600 font-black underline">같은 것이 있는 순열</span> 문제입니다. <br/>
                전체 <span className="text-blue-600 font-black">7개</span>의 자리 중 별이 들어갈 <span className="text-blue-600 font-black">5개</span>를 고르는 것과 같습니다!
              </p>
            ) : (
              <p>서로 다른 <span className="text-blue-600 font-bold underline">3종류</span>를 구분하기 위해선 <span className="text-emerald-600 font-bold underline">2개</span>의 칸막이가 필요합니다.</p>
            )}
          </div>

          <div className="text-4xl font-black text-slate-900 bg-white px-10 py-4 rounded-2xl border-4 border-slate-100">
            3H5 = <span className="text-blue-600">(3 + 5 - 1)</span>C5 = <span className="text-emerald-600">7C5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
