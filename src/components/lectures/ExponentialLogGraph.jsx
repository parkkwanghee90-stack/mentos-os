import React from 'react';
import { motion } from 'framer-motion';

export default function ExponentialLogGraph({ mode = 'exp-growth' }) {
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const scale = 40; // 1 unit = 40px

  const generatePoints = (func, xStart, xEnd) => {
    const points = [];
    for (let x = xStart; x <= xEnd; x += 0.05) {
      const y = func(x);
      // Skip undefined or infinity
      if (isNaN(y) || !isFinite(y)) continue;
      // Skip out of bounds to avoid SVG breaking
      if (Math.abs(y) * scale > height / 2 + 100) continue;
      const px = cx + x * scale;
      const py = cy - y * scale;
      points.push(`${px},${py}`);
    }
    if (points.length === 0) return "";
    return `M ${points.join(' L ')}`;
  };

  const getLines = () => {
    switch (mode) {
      case 'exp-growth':
        return [
          { path: generatePoints(x => Math.pow(2, x), -8, 8), color: '#3b82f6', label: 'y=2^x' },
          { path: generatePoints(x => Math.pow(3, x), -8, 8), color: '#ef4444', label: 'y=3^x' },
          { path: generatePoints(x => Math.pow(4, x), -8, 8), color: '#10b981', label: 'y=4^x' }
        ];
      case 'exp-decay':
        return [
          { path: generatePoints(x => Math.pow(0.5, x), -8, 8), color: '#3b82f6', label: 'y=(1/2)^x' },
          { path: generatePoints(x => Math.pow(0.333, x), -8, 8), color: '#ef4444', label: 'y=(1/3)^x' }
        ];
      case 'log-growth':
        return [
          { path: generatePoints(x => Math.log(x) / Math.log(2), 0.01, 8), color: '#3b82f6', label: 'y=log₂(x)' },
          { path: generatePoints(x => Math.log(x) / Math.log(3), 0.01, 8), color: '#ef4444', label: 'y=log₃(x)' },
          { path: generatePoints(x => Math.log(x) / Math.log(4), 0.01, 8), color: '#10b981', label: 'y=log₄(x)' }
        ];
      case 'log-decay':
        return [
          { path: generatePoints(x => Math.log(x) / Math.log(0.5), 0.01, 8), color: '#3b82f6', label: 'y=log_½(x)' },
          { path: generatePoints(x => Math.log(x) / Math.log(0.333), 0.01, 8), color: '#ef4444', label: 'y=log_⅓(x)' }
        ];
      case 'inverse':
        return [
          { path: generatePoints(x => Math.pow(2, x), -8, 8), color: '#3b82f6', label: 'y=2^x' },
          { path: generatePoints(x => x, -8, 8), color: '#94a3b8', label: 'y=x', dashed: true },
          { path: generatePoints(x => Math.log(x) / Math.log(2), 0.01, 8), color: '#ef4444', label: 'y=log₂(x)' }
        ];
      default:
        return [];
    }
  };

  const lines = getLines();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
        {/* Axes */}
        <line x1={0} y1={cy} x2={width} y2={cy} stroke="#94a3b8" strokeWidth="2" />
        <line x1={cx} y1={0} x2={cx} y2={height} stroke="#94a3b8" strokeWidth="2" />
        
        {/* Grid Marks */}
        {[...Array(15)].map((_, i) => {
          const x = cx + (i - 7) * scale;
          const y = cy + (i - 7) * scale;
          return (
            <React.Fragment key={i}>
              <line x1={x} y1={cy - 4} x2={x} y2={cy + 4} stroke="#94a3b8" strokeWidth="1" />
              <line x1={cx - 4} y1={y} x2={cx + 4} y2={y} stroke="#94a3b8" strokeWidth="1" />
            </React.Fragment>
          );
        })}
        
        {/* Functions */}
        {lines.map((line, idx) => (
          <motion.path
            key={idx}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: idx * 0.5, ease: "easeInOut" }}
            d={line.path}
            fill="none"
            stroke={line.color}
            strokeWidth="3"
            strokeDasharray={line.dashed ? "6,6" : "none"}
          />
        ))}

        <text x={width - 20} y={cy - 10} fill="#64748b" fontSize="14" fontWeight="bold">x</text>
        <text x={cx + 10} y={20} fill="#64748b" fontSize="14" fontWeight="bold">y</text>
        <text x={cx - 15} y={cy + 15} fill="#64748b" fontSize="14" fontWeight="bold">O</text>
      </svg>
      
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '15px' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '20px', height: '4px', backgroundColor: line.color, position: 'relative' }}>
               {line.dashed && <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity: 0.5, zIndex: 1 }} />}
            </div>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#334155' }}>{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
