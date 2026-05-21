import React from 'react';
import { motion } from 'framer-motion';

export default function TrigSubstitutionVisual({ equation = 'X^2 + 2X + 3', range = [-1, 1] }) {
  const width = 400;
  const height = 300;
  const cx = width / 2;
  const cy = height - 100;
  const scale = 50;

  const getPoints = () => {
    const points = [];
    // Calculate based on the formula string (hardcoded simple cases for this component)
    const func = (x) => {
      if (equation === 'X^2 + 2X + 3') return x*x + 2*x + 3;
      if (equation === '-X^2 - 2X + 2') return -x*x - 2*x + 2;
      return x*x;
    };

    for (let x = -3; x <= 3; x += 0.1) {
      const y = func(x);
      points.push(`${cx + x * scale},${cy - y * scale}`);
    }
    return `M ${points.join(' L ')}`;
  };

  const getRangePath = () => {
    const points = [];
    const func = (x) => {
        if (equation === 'X^2 + 2X + 3') return x*x + 2*x + 3;
        if (equation === '-X^2 - 2X + 2') return -x*x - 2*x + 2;
        return x*x;
    };
    for (let x = range[0]; x <= range[1]; x += 0.1) {
        const y = func(x);
        points.push(`${cx + x * scale},${cy - y * scale}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line x1={20} y1={cy} x2={width-20} y2={cy} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx} y1={20} x2={cx} y2={height-20} stroke="#94a3b8" strokeWidth="2" />
        
        {/* Full Parabola */}
        <path d={getPoints()} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
        
        {/* Highlighted Domain */}
        <motion.path 
            d={getRangePath()} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="5" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
        />

        {/* Max/Min points */}
        <circle cx={cx + range[0]*scale} cy={cy - (equation.startsWith('-') ? -1 : 2)*scale} r="6" fill="#ef4444" />
        <circle cx={cx + range[1]*scale} cy={cy - (equation.startsWith('-') ? -1 : 6)*scale} r="6" fill="#ef4444" />

        <text x={cx + range[0]*scale - 10} y={cy + 25} className="fill-slate-600 font-bold text-sm">X={range[0]}</text>
        <text x={cx + range[1]*scale - 10} y={cy + 25} className="fill-slate-600 font-bold text-sm">X={range[1]}</text>
        <text x={cx + 10} y={40} className="fill-slate-400 font-bold text-xs">Y = {equation}</text>
      </svg>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm font-bold">
        범위: -1 ≤ X ≤ 1 에 주의!
      </div>
    </div>
  );
}
