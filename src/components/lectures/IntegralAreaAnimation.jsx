import React from 'react';
import { motion } from 'framer-motion';

export default function IntegralAreaAnimation({ type = 'quadratic' }) {
  const isCubic = type === 'cubic';
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-indigo-200 shadow-xl">
      <div className="relative w-96 h-80 border-l-2 border-b-2 border-slate-400">
        <div className="absolute right-[-20px] bottom-[-10px] text-slate-500 font-bold">x</div>
        <div className="absolute left-[-15px] top-[-25px] text-slate-500 font-bold">y</div>

        <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
          {/* Shaded Area */}
          <motion.path
            d={isCubic 
              ? "M 40 80 C 60 20, 140 140, 160 80 L 160 80 Z" // Shaded area for cubic
              : "M 40 80 Q 100 180 160 80 Z" // Shaded area for quadratic
            }
            fill="rgba(99, 102, 241, 0.2)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />

          {/* X-axis */}
          <line x1="0" y1="80" x2="200" y2="80" stroke="#94a3b8" strokeWidth="2" />

          {/* Function Curve */}
          <motion.path
            d={isCubic 
              ? "M 20 140 C 60 20, 140 300, 180 20" 
              : "M 20 20 Q 100 220 180 20"
            }
            fill="none"
            stroke="#6366f1"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Points Alpha and Beta */}
          <circle cx="40" cy="80" r="4" fill="#4f46e5" />
          <text x="35" y="95" fill="#4f46e5" fontSize="12" fontWeight="bold">α</text>
          <circle cx="160" cy="80" r="4" fill="#4f46e5" />
          <text x="155" y="95" fill="#4f46e5" fontSize="12" fontWeight="bold">β</text>

          {/* Formula Tooltip */}
          <motion.g
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <rect x="50" y="30" width="100" height="30" rx="8" fill="#4f46e5" />
            <text x="60" y="50" fill="white" fontSize="10" fontWeight="bold">
              {isCubic ? "S = |a|/12 * (β-α)^4" : "S = |a|/6 * (β-α)^3"}
            </text>
          </motion.g>
        </svg>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-black shadow-lg">
          정적분과 넓이 공식
        </div>
        <p className="text-slate-500 text-xs font-bold">알파(α)부터 베타(β)까지의 둘러싸인 면적</p>
      </div>
    </div>
  );
}
