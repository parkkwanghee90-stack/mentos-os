import React from 'react';
import { motion } from 'framer-motion';

export default function TrigonometricGraph({ mode = 'sin', props = {} }) {
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  const scaleX = 40; // 1 unit (rad) = 40px, so 2pi is ~250px
  const scaleY = 60; // 1 unit = 60px

  const generatePoints = (func, xStart, xEnd) => {
    const points = [];
    for (let x = xStart; x <= xEnd; x += 0.05) {
      const y = func(x);
      if (isNaN(y) || !isFinite(y)) {
        if (points.length > 0) points.push("BREAK");
        continue;
      }
      if (Math.abs(y) * scaleY > height / 2 + 100) {
        if (points.length > 0) points.push("BREAK");
        continue;
      }
      const px = cx + x * scaleX;
      const py = cy - y * scaleY;
      points.push(`${px},${py}`);
    }
    
    if (points.length === 0) return "";
    
    // Split by BREAK for discontinuous functions like tan
    const segments = [];
    let current = [];
    points.forEach(p => {
      if (p === "BREAK") {
        if (current.length > 0) segments.push(`M ${current.join(' L ')}`);
        current = [];
      } else {
        current.push(p);
      }
    });
    if (current.length > 0) segments.push(`M ${current.join(' L ')}`);
    return segments.join(' ');
  };

  const getLines = () => {
    switch (mode) {
      case 'sin-cos':
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#3b82f6', label: 'y=sin(x)' },
          { path: generatePoints(x => Math.cos(x), -7, 7), color: '#ef4444', label: 'y=cos(x)' }
        ];
      case 'transformed':
        const a = props.a || 1.5;
        const b = props.b || 2;
        const c = props.c || 0;
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#94a3b8', label: 'y=sin(x)', dashed: true },
          { path: generatePoints(x => a * Math.sin(b * x) + c, -7, 7), color: '#3b82f6', label: `y=${a}sin(${b}x)+${c}` }
        ];
      case 'tan':
        return [
          { path: generatePoints(x => Math.tan(x), -7, 7), color: '#10b981', label: 'y=tan(x)' }
        ];
      case 'symmetry':
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#3b82f6', label: 'y=sin(x)' },
          { path: `M ${cx + Math.PI/2 * scaleX},0 L ${cx + Math.PI/2 * scaleX},${height}`, color: '#ef4444', label: 'x=π/2', dashed: true }
        ];
      case 'absolute':
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#94a3b8', label: 'y=sin(x)', dashed: true },
          { path: generatePoints(x => Math.abs(Math.sin(x)), -7, 7), color: '#f59e0b', label: 'y=|sin(x)|' }
        ];
      case 'equation':
        const k = props.k || 0.5;
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#3b82f6', label: 'y=sin(x)' },
          { path: `M 0,${cy - k * scaleY} L ${width},${cy - k * scaleY}`, color: `#ef4444`, label: `y=${k}`, dashed: true }
        ];
      case 'inequality':
        const ki = props.k || 0.5;
        const op = props.op || 'gt';
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#94a3b8', label: 'y=sin(x)', dashed: true },
          { path: generatePoints(x => {
              const val = Math.sin(x);
              if (op === 'gt' && val > ki) return val;
              if (op === 'lt' && val < ki) return val;
              return NaN;
            }, -7, 7), color: '#10b981', label: `sin(x) ${op === 'gt' ? '>' : '<'} ${ki}`, strokeWidth: 5 }
        ];
      default:
        return [
          { path: generatePoints(x => Math.sin(x), -7, 7), color: '#3b82f6', label: 'y=sin(x)' }
        ];
    }
  };

  const lines = getLines();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '16px', backgroundColor: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        {/* Axes */}
        <line x1={0} y1={cy} x2={width} y2={cy} stroke="#cbd5e1" strokeWidth="2" />
        <line x1={cx} y1={0} x2={cx} y2={height} stroke="#cbd5e1" strokeWidth="2" />
        
        {/* Pi marks */}
        {[ -2, -1, 1, 2 ].map(n => {
           const x = cx + n * Math.PI * scaleX;
           return (
             <g key={n}>
               <line x1={x} y1={cy - 5} x2={x} y2={cy + 5} stroke="#64748b" strokeWidth="2" />
               <text x={x - 10} y={cy + 20} fill="#64748b" fontSize="12" fontWeight="bold">{n}π</text>
             </g>
           );
        })}

        {/* Functions */}
        {lines.map((line, idx) => (
          <motion.path
            key={idx}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={line.path}
            fill="none"
            stroke={line.color}
            strokeWidth="4"
            strokeDasharray={line.dashed ? "8,8" : "none"}
            strokeLinecap="round"
          />
        ))}

        <text x={width - 25} y={cy - 10} fill="#475569" fontSize="14" fontWeight="black">x</text>
        <text x={cx + 15} y={25} fill="#475569" fontSize="14" fontWeight="black">y</text>
      </svg>
      
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '24px', height: '4px', backgroundColor: line.color, borderRadius: '2px' }} />
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
