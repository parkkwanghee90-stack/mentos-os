import React from 'react';
import { motion } from 'framer-motion';

export default function QuadraticGraphAnimation() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
      <div className="relative w-80 h-64 border-l-2 border-b-2 border-slate-500">
        {/* X-axis label */}
        <div className="absolute right-[-20px] bottom-[-10px] text-slate-400 font-bold">x</div>
        {/* Y-axis label */}
        <div className="absolute left-[-15px] top-[-25px] text-slate-400 font-bold">y</div>

        {/* The Curve */}
        <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
          {/* x-axis line extension */}
          <line x1="-10" y1="130" x2="220" y2="130" stroke="#475569" strokeWidth="1" />
          
          {/* Floating Parabola */}
          <motion.path
            d="M 20 20 Q 100 180 180 20" // Upside down logic for SVG coords
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1, y: [0, -10, 0] }}
            transition={{ 
                pathLength: { duration: 1.5, ease: "easeInOut" },
                opacity: { duration: 0.5 },
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }}
            transform="scale(1, -1) translate(0, -140)"
          />

          {/* D < 0 Indicator */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <circle cx="100" cy="80" r="40" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeDasharray="4,4" />
            <text x="65" y="85" fill="#34d399" fontSize="12" fontWeight="bold">D {"<"} 0 (만나지 않음)</text>
          </motion.g>

          {/* ax^2 + bx + c > 0 Label */}
          <motion.text
            x="40"
            y="30"
            fill="#60a5fa"
            fontSize="14"
            fontWeight="black"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 40, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            f(x) {">"} 0 (항상 위에 있음)
          </motion.text>
        </svg>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <span className="text-emerald-400 font-bold">조건 1:</span>
            <p className="text-emerald-200 text-sm">아래로 볼록 (a {">"} 0)</p>
        </div>
        <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl">
            <span className="text-blue-400 font-bold">조건 2:</span>
            <p className="text-blue-200 text-sm">허근 (D {"<"} 0)</p>
        </div>
      </div>
    </div>
  );
}
