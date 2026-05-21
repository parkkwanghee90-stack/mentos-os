import React from 'react';
import { motion } from 'framer-motion';

export default function GeometricSeriesAnimation({ type = 'fractal_squares' }) {
  const renderScene = () => {
    switch(type) {
      case 'coordinate_path':
        // Spiral path: 1, 1/2, 1/4...
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <motion.path
              d="M 100 100 L 160 100 L 160 140 L 130 140 L 130 120 L 145 120"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3 }}
            />
            {[1, 2, 3, 4, 5].map(i => (
              <motion.circle 
                key={i}
                cx={i === 1 ? 160 : i === 2 ? 160 : i === 3 ? 130 : 130}
                cy={i === 1 ? 100 : i === 2 ? 140 : i === 3 ? 140 : 120}
                r="3" fill="#f43f5e"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5 }}
              />
            ))}
            <text x="165" y="100" fill="#e11d48" fontSize="8">P1</text>
            <text x="165" y="145" fill="#e11d48" fontSize="8">P2</text>
            <text x="120" y="150" fill="#e11d48" fontSize="8">P3</text>
          </svg>
        );
      
      case 'circles_in_triangle':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M 20 180 L 180 180 L 100 20 Z" fill="none" stroke="#64748b" strokeWidth="2" />
            {[0, 1, 2, 3].map(i => (
              <motion.circle
                key={i}
                cx="100"
                cy={180 - 40 * Math.pow(0.6, i)}
                r={30 * Math.pow(0.6, i)}
                fill="rgba(244, 63, 94, 0.2)"
                stroke="#f43f5e"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.5 }}
              />
            ))}
          </svg>
        );

      case 'arc_fractal':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.path
                key={i}
                d={`M ${100 - 80 * Math.pow(0.5, i)} 100 A ${80 * Math.pow(0.5, i)} ${80 * Math.pow(0.5, i)} 0 0 1 ${100 + 80 * Math.pow(0.5, i)} 100`}
                fill="none"
                stroke="#f43f5e"
                strokeWidth={4 - i}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: i * 0.5, duration: 1 }}
              />
            ))}
            <line x1="20" y1="100" x2="180" y2="100" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        );

      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute border-2 border-rose-500 bg-rose-500/10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: Math.pow(0.5, i), opacity: 1, rotate: i * 45 }}
                transition={{ delay: i * 0.5, duration: 1 }}
                style={{ width: '100%', height: '100%', borderRadius: i % 2 === 0 ? '0%' : '50%' }}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-xl">
      <div className="relative w-80 h-80 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
        {renderScene()}
        <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-lg border border-rose-200">
          <span className="text-rose-600 font-black text-sm">
            {type === 'coordinate_path' ? '유형 7. 점의 좌표 극한' : 
             type === 'circles_in_triangle' ? '유형 8. 프랙탈 넓이' : 
             type === 'arc_fractal' ? '유형 9. 수능형 활꼴' : 'Fractal Animation'}
          </span>
        </div>
      </div>
      <div className="mt-6 text-center">
        <div className="px-6 py-2 bg-rose-600 text-white rounded-full text-sm font-black shadow-lg mb-2">
          무한등비급수 시각화 리포트
        </div>
      </div>
    </div>
  );
}
