import React from 'react';
import { motion } from 'framer-motion';

export default function CalculusGraphAnimation({ type = 'cubic' }) {
  // Cubic: y = x^3 - 3x (roots at -sqrt(3), 0, sqrt(3). extremes at -1, 1)
  // Quartic: y = x^4 - 2x^2 (roots at -sqrt(2), 0, sqrt(2). extremes at -1, 0, 1)
  
  const isCubic = type === 'cubic';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl">
      <div className="relative w-96 h-80 border-l-2 border-b-2 border-slate-400">
        <div className="absolute right-[-20px] bottom-[-10px] text-slate-500 font-bold">x</div>
        <div className="absolute left-[-15px] top-[-25px] text-slate-500 font-bold">y</div>

        <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="80" x2="200" y2="80" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
          <line x1="100" y1="0" x2="100" y2="160" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />

          {/* Function Curve */}
          <motion.path
            d={isCubic 
              ? "M 20 140 C 60 20, 140 300, 180 20" // Simplified cubic path
              : "M 20 20 C 60 180, 100 0, 140 180, 180 20" // Simplified quartic path
            }
            fill="none"
            stroke={isCubic ? "#3b82f6" : "#8b5cf6"}
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Extreme Points Indicators */}
          {isCubic ? (
            <>
              <motion.circle cx="70" cy="55" r="5" fill="#ef4444" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
              <text x="50" y="45" fill="#ef4444" fontSize="10" fontWeight="bold">극대 (f'=0)</text>
              <motion.circle cx="130" cy="105" r="5" fill="#2563eb" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }} />
              <text x="135" y="120" fill="#2563eb" fontSize="10" fontWeight="bold">극소 (f'=0)</text>
            </>
          ) : (
            <>
              <motion.circle cx="60" cy="120" r="5" fill="#2563eb" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} />
              <motion.circle cx="100" cy="40" r="5" fill="#ef4444" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7 }} />
              <motion.circle cx="140" cy="120" r="5" fill="#2563eb" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9 }} />
            </>
          )}

          {/* f(x) = k line */}
          <motion.line
            x1="0" y1="70" x2="200" y2="70"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          />
          <text x="10" y="65" fill="#059669" fontSize="10" fontWeight="bold">y = k (방정식의 해)</text>
        </svg>
      </div>

      <div className="mt-6 flex gap-4">
        <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
          {isCubic ? "삼차함수 (극값 2개)" : "사차함수 (극값 3개)"}
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold">
          교점 개수 = 실근 개수
        </div>
      </div>
    </div>
  );
}
