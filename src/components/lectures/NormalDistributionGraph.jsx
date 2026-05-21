import React from 'react';
import { motion } from 'framer-motion';

export default function NormalDistributionGraph({ mode = 'default' }) {
  // mode: 'default', 'wide' (large variance), 'narrow' (small variance), 'empirical' (68-95-99.7)
  const width = 600;
  const height = 300;
  
  // Normal distribution PDF function
  const gaussian = (x, mean, stdDev) => {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  };

  const points = [];
  const mean = width / 2;
  let stdDev = 60;
  
  if (mode === 'wide') stdDev = 120;
  if (mode === 'narrow') stdDev = 30;

  // Scale factor to make the curve fit nicely
  const scaleY = mode === 'narrow' ? 18000 : mode === 'wide' ? 18000 : 18000;
  
  for (let x = 0; x <= width; x += 2) {
    const y = height - 30 - gaussian(x, mean, stdDev) * scaleY;
    points.push(`${x},${y}`);
  }

  const pathD = `M 0,${height - 30} L ${points.join(` L `)} L ${width},${height - 30} Z`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Base axis */}
        <line x1="-50" y1={height - 30} x2={width + 50} y2={height - 30} stroke="#94a3b8" strokeWidth="2" />
        
        {/* Fill Area */}
        <motion.path 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          d={pathD} 
          fill="#3b82f6" 
          stroke="none" 
        />
        
        {/* Curve Stroke */}
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathD} 
          fill="none" 
          stroke="#2563eb" 
          strokeWidth="4" 
        />

        {/* Center Mean Line */}
        <motion.line 
          initial={{ opacity: 0, y2: height - 30 }}
          animate={{ opacity: 1, y2: height - 30 - gaussian(mean, mean, stdDev) * scaleY }}
          transition={{ delay: 1, duration: 0.5 }}
          x1={mean} y1={height - 30} x2={mean} y2={height - 30 - gaussian(mean, mean, stdDev) * scaleY} 
          stroke="#ef4444" strokeWidth="3" strokeDasharray="5,5" 
        />
        <motion.text 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          x={mean} y={height} textAnchor="middle" fill="#ef4444" fontSize="22" fontWeight="bold"
        >
          m (평균)
        </motion.text>

        {mode === 'empirical' && (
          <>
            {/* 1 Sigma */}
            <line x1={mean - stdDev} y1={height - 30} x2={mean - stdDev} y2={height - 30 - gaussian(mean - stdDev, mean, stdDev) * scaleY} stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
            <line x1={mean + stdDev} y1={height - 30} x2={mean + stdDev} y2={height - 30 - gaussian(mean + stdDev, mean, stdDev) * scaleY} stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" />
            <text x={mean - stdDev} y={height} textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">m-1σ</text>
            <text x={mean + stdDev} y={height} textAnchor="middle" fill="#10b981" fontSize="16" fontWeight="bold">m+1σ</text>
            
            {/* 2 Sigma */}
            <line x1={mean - 2*stdDev} y1={height - 30} x2={mean - 2*stdDev} y2={height - 30 - gaussian(mean - 2*stdDev, mean, stdDev) * scaleY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
            <line x1={mean + 2*stdDev} y1={height - 30} x2={mean + 2*stdDev} y2={height - 30 - gaussian(mean + 2*stdDev, mean, stdDev) * scaleY} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" />
            <text x={mean - 2*stdDev} y={height} textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="bold">m-2σ</text>
            <text x={mean + 2*stdDev} y={height} textAnchor="middle" fill="#f59e0b" fontSize="16" fontWeight="bold">m+2σ</text>

            <text x={mean} y={height - 80} textAnchor="middle" fill="#10b981" fontSize="20" fontWeight="900">약 68%</text>
            <text x={mean} y={height - 50} textAnchor="middle" fill="#f59e0b" fontSize="20" fontWeight="900">약 95.4%</text>
          </>
        )}
      </svg>
      <div style={{ marginTop: '2rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#334155' }}>
        {mode === 'wide' && "분산(σ²)이 커질 때: 넓고 낮게 퍼짐"}
        {mode === 'narrow' && "분산(σ²)이 작아질 때: 좁고 뾰족하게 솟아오름"}
        {mode === 'default' && "완벽한 좌우 대칭의 종 모양 곡선"}
        {mode === 'empirical' && "평균을 중심으로 한 확률 면적 (68-95 법칙)"}
      </div>
    </div>
  );
}
