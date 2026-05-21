import React from 'react';
import { motion } from 'framer-motion';

export default function GeometryVisuals({ type, props = {} }) {
  const Axes = () => (
    <>
      <line x1="20" y1="130" x2="280" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="150" y1="20" x2="150" y2="240" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="275" y="145" className="fill-slate-400 text-[10px]">x</text>
      <text x="135" y="30" className="fill-slate-400 text-[10px]">y</text>
    </>
  );

  // 1. x축에 접하는 원
  if (type === 'circle_x_axis') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <Axes />
          {/* 원 중심 (2, 3) -> 스케일 조정하여 표시 (150+20, 130-30) */}
          <circle cx="190" cy="90" r="40" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="3" />
          <line x1="190" y1="90" x2="190" y2="130" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="190" cy="90" r="4" fill="#1e293b" />
          <text x="195" y="80" className="fill-slate-800 font-black text-xs">C(2, 3)</text>
          <text x="198" y="115" className="fill-red-600 font-bold text-xs">r = |b| = 3</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
          <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">x축에 접하면 반지름은 y좌표의 절댓값</text>
        </svg>
      </div>
    );
  }

  // 2. y축에 접하는 원
  if (type === 'circle_y_axis') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <Axes />
          {/* 중심 (-4, 2) -> (150-50, 130-30) */}
          <circle cx="100" cy="100" r="50" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="3" />
          <line x1="100" y1="100" x2="150" y2="100" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="4" fill="#1e293b" />
          <text x="45" y="95" className="fill-slate-800 font-black text-xs">C(-4, 2)</text>
          <text x="110" y="115" className="fill-red-600 font-bold text-xs">r = |a| = 4</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
          <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">y축에 접하면 반지름은 x좌표의 절댓값</text>
        </svg>
      </div>
    );
  }

  // 3. x, y축 동시 접함
  if (type === 'circle_both_axes') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <Axes />
          <circle cx="190" cy="90" r="40" fill="rgba(139, 92, 246, 0.05)" stroke="#8b5cf6" strokeWidth="3" />
          <line x1="190" y1="90" x2="190" y2="130" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="190" y1="90" x2="150" y2="90" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="190" cy="90" r="4" fill="#1e293b" />
          <text x="195" y="80" className="fill-slate-800 font-black text-xs">C(r, r)</text>
          <circle cx="170" cy="110" r="3" fill="#ef4444" />
          <text x="160" y="125" className="fill-red-600 font-bold text-[10px]">(1, 2) 통과</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
          <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">|a| = |b| = r (사분면에 따라 부호 결정)</text>
        </svg>
      </div>
    );
  }

  // 4. 원과 직선의 관계 (d와 r 비교)
  if (type === 'circle_line_relation') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <circle cx="120" cy="130" r="60" fill="none" stroke="#3b82f6" strokeWidth="3" />
          <line x1="200" y1="50" x2="200" y2="210" stroke="#64748b" strokeWidth="2" />
          <line x1="120" y1="130" x2="200" y2="130" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="120" cy="130" r="4" fill="#1e293b" />
          <text x="100" y="120" className="fill-slate-800 font-black text-xs">C(1, 2)</text>
          <text x="150" y="125" className="fill-red-600 font-bold text-xs">d = 3</text>
          <text x="125" y="185" className="fill-blue-600 font-bold text-xs">r = 2</text>
          <text x="210" y="130" className="fill-slate-500 font-bold text-[10px]">3x+4y+4=0</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#fef2f2" />
          <text x="150" y="240" textAnchor="middle" className="fill-red-600 font-bold text-xs">d &gt; r : 만나지 않음</text>
        </svg>
      </div>
    );
  }

  // 5. 공통현의 길이
  if (type === 'circle_chord') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <circle cx="120" cy="130" r="80" fill="none" stroke="#3b82f6" strokeWidth="3" />
          <line x1="180" y1="40" x2="180" y2="220" stroke="#10b981" strokeWidth="3" />
          <line x1="120" y1="130" x2="180" y2="130" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="120" y1="130" x2="180" y2="80" stroke="#3b82f6" strokeWidth="1.5" />
          <circle cx="120" cy="130" r="4" fill="#1e293b" />
          <text x="140" y="145" className="fill-slate-600 font-bold text-xs">d</text>
          <text x="140" y="100" className="fill-blue-600 font-bold text-xs">r</text>
          <text x="185" y="105" className="fill-emerald-600 font-bold text-xs">L/2</text>
          <rect x="175" y="125" width="5" height="5" fill="none" stroke="#64748b" />
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#ecfdf5" />
          <text x="150" y="240" textAnchor="middle" className="fill-emerald-700 font-bold text-xs">현의 길이 = 2 * sqrt(r^2 - d^2)</text>
        </svg>
      </div>
    );
  }

  // 6. 두 원의 관계
  if (type === 'two_circles_calc') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <circle cx="80" cy="130" r="50" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="230" cy="130" r="30" fill="rgba(16, 185, 129, 0.05)" stroke="#10b981" strokeWidth="2" />
          <line x1="80" y1="130" x2="230" y2="130" stroke="#ef4444" strokeDasharray="4 4" strokeWidth="2" />
          <circle cx="80" cy="130" r="4" fill="#1e293b" />
          <circle cx="230" cy="130" r="4" fill="#1e293b" />
          <text x="65" y="120" className="fill-blue-600 font-bold text-xs">r1=5</text>
          <text x="215" y="120" className="fill-emerald-600 font-bold text-xs">r2=3</text>
          <text x="145" y="145" className="fill-red-600 font-black text-xs">d=12</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
          <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">d &gt; r1 + r2 : 외부 (만나지 않음)</text>
        </svg>
      </div>
    );
  }

  // 7. 극선의 방정식
  if (type === 'polar_line') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
          <circle cx="110" cy="130" r="60" fill="none" stroke="#3b82f6" strokeWidth="3" />
          <circle cx="250" cy="130" r="5" fill="#ef4444" />
          <text x="235" y="150" className="fill-red-600 font-black text-xs">P(4, 2)</text>
          <line x1="250" y1="130" x2="146" y2="82" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="250" y1="130" x2="146" y2="178" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <motion.line 
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            x1="146" y1="82" x2="146" y2="178" stroke="#f59e0b" strokeWidth="4" 
          />
          <text x="110" y="105" className="fill-amber-600 font-black text-xs">극선: 4x + 2y = 10</text>
          <rect x="20" y="220" width="260" height="30" rx="6" fill="#fffbeb" />
          <text x="150" y="240" textAnchor="middle" className="fill-amber-700 font-bold text-xs">접점 공식을 밖의 점에 적용한 결과</text>
        </svg>
      </div>
    );
  }

  // 8. 부채꼴 (Sector)
  if (type === 'sector') {
    const r = 80;
    const theta = 60;
    const x1 = 150 + r;
    const y1 = 130;
    const x2 = 150 + r * Math.cos(-theta * Math.PI / 180);
    const y2 = 130 + r * Math.sin(-theta * Math.PI / 180);
    const pathData = `M 150 130 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <path d={pathData} fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="3" />
           <circle cx="150" cy="130" r="4" fill="#1e293b" />
           <text x="180" y="145" className="fill-slate-600 font-bold text-sm">r</text>
           <text x="200" y="110" className="fill-blue-600 font-black text-sm">l = rθ</text>
           <text x="165" y="125" className="fill-red-600 font-bold text-xs">θ</text>
           <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
           <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">S = 1/2 r²θ = 1/2 rl</text>
        </svg>
      </div>
    );
  }

  // 9. 단위원 (Unit Circle)
  if (type === 'unit_circle') {
    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <Axes />
           <circle cx="150" cy="130" r="80" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
           <line x1="150" y1="130" x2="206" y2="74" stroke="#ef4444" strokeWidth="3" />
           <circle cx="206" cy="74" r="5" fill="#ef4444" />
           <text x="210" y="70" className="fill-red-600 font-black text-sm">P(x, y)</text>
           <path d="M 180 130 A 30 30 0 0 0 171 109" fill="none" stroke="#ef4444" strokeWidth="2" />
           <text x="185" y="120" className="fill-red-600 font-bold text-xs">θ</text>
           
           <text x="220" y="80" className="fill-blue-600 font-black text-xs">All (+)</text>
           <text x="60" y="80" className="fill-blue-600 font-black text-xs">Sin (+)</text>
           <text x="60" y="180" className="fill-blue-600 font-black text-xs">Tan (+)</text>
           <text x="220" y="180" className="fill-blue-600 font-black text-xs">Cos (+)</text>
        </svg>
      </div>
    );
  }

  // 10. 동경의 위치 관계 (Symmetry Relations)
  if (type === 'terminal_sides') {
     const { rel = "y축 대칭", theta = 30 } = props;
     let beta = 0;
     let relText = rel;
     
     if (rel === "x축 대칭") beta = 360 - theta;
     else if (rel === "y축 대칭") beta = 180 - theta;
     else if (rel === "원점 대칭") beta = 180 + theta;
     else if (rel === "y=x 대칭") beta = 90 - theta;
     else if (rel === "y=-x 대칭") beta = 270 - theta;

     return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <Axes />
           <line x1="150" y1="130" x2={150 + 80 * Math.cos(-theta * Math.PI / 180)} y2={130 + 80 * Math.sin(-theta * Math.PI / 180)} stroke="#3b82f6" strokeWidth="3" />
           <line x1="150" y1="130" x2={150 + 80 * Math.cos(-beta * Math.PI / 180)} y2={130 + 80 * Math.sin(-beta * Math.PI / 180)} stroke="#ef4444" strokeWidth="3" />
           
           {/* y=x or y=-x lines if applicable */}
           {rel === "y=x 대칭" && <line x1="50" y1="230" x2="250" y2="30" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />}
           {rel === "y=-x 대칭" && <line x1="50" y1="30" x2="250" y2="230" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />}

           <text x="210" y="110" className="fill-blue-600 font-bold text-xs">θ</text>
           <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">{relText}</text>
        </svg>
      </div>
     );
  }

  // 12. 특정 점을 지나는 동경 (Point-based Terminal Side)
  if (type === 'point_terminal') {
    const { x = -4, y = 3 } = props;
    const r = Math.sqrt(x*x + y*y);
    const scale = 20; // 스케일링
    const targetX = 150 + x * scale;
    const targetY = 130 - y * scale;

    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <Axes />
           <line x1="150" y1="130" x2={targetX} y2={targetY} stroke="#3b82f6" strokeWidth="3" />
           <circle cx={targetX} cy={targetY} r="5" fill="#ef4444" />
           <line x1={targetX} y1={targetY} x2={targetX} y2="130" stroke="#94a3b8" strokeDasharray="4 4" />
           <text x={targetX - 20} y={targetY - 10} className="fill-red-600 font-black text-sm">P({x}, {y})</text>
           
           <text x="160" y="125" className="fill-slate-400 font-bold text-xs">θ</text>
           <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
           <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">sinθ = {y}/{r}, cosθ = {x}/{r}, tanθ = {y}/{x}</text>
        </svg>
      </div>
    );
  }

  // 11. 동경의 n등분 (Division of Quadrants)
  if (type === 'quadrant_division') {
    const { n = 3, target_quad = 4 } = props; // α가 target_quad 사분면의 각일 때 α/n
    const r = 90;
    const start_angle = (target_quad - 1) * 90;
    const end_angle = target_quad * 90;
    
    const sectors = [];
    for (let i = 0; i < n; i++) {
      const s = (start_angle + 360 * i) / n;
      const e = (end_angle + 360 * i) / n;
      
      // Calculate SVG path for each sector
      const radStart = -s * Math.PI / 180;
      const radEnd = -e * Math.PI / 180;
      const x1 = 150 + r * Math.cos(radStart);
      const y1 = 130 + r * Math.sin(radStart);
      const x2 = 150 + r * Math.cos(radEnd);
      const y2 = 130 + r * Math.sin(radEnd);
      
      sectors.push({
        path: `M 150 130 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`,
        label: `n=${i}`
      });
    }

    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <Axes />
           <circle cx="150" cy="130" r="90" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
           {sectors.map((sec, idx) => (
             <g key={idx}>
               <motion.path 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: idx * 0.3 }}
                 d={sec.path} 
                 fill={idx === 0 ? "rgba(59, 130, 246, 0.2)" : idx === 1 ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"} 
                 stroke={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"} 
                 strokeWidth="2" 
               />
               {/* Label in the middle of the arc */}
             </g>
           ))}
           <text x="210" y="180" className="fill-slate-400 font-bold text-[10px]">α ∈ Q{target_quad}</text>
           <text x="20" y="40" className="fill-blue-600 font-bold text-xs">θ = α/{n}</text>
           
           <rect x="20" y="220" width="260" height="30" rx="6" fill="#f8fafc" />
           <text x="150" y="240" textAnchor="middle" className="fill-slate-600 font-bold text-xs">α가 {target_quad}사분면일 때 α/3는 2, 3, 4사분면 가능</text>
        </svg>
      </div>
    );
  }
  
  // 13. 삼각방정식/부등식 단위원 풀이 (Unit Circle Trig Equation)
  if (type === 'unit_circle_trig') {
    const { lineVal = 0.5, lineType = 'y' } = props;
    const r = 80;
    const cx = 150;
    const cy = 130;
    
    const intersections = [];
    if (lineType === 'y') {
      const x = Math.sqrt(Math.max(0, 1 - lineVal*lineVal));
      intersections.push({ x: x, y: lineVal });
      intersections.push({ x: -x, y: lineVal });
    } else {
      const y = Math.sqrt(Math.max(0, 1 - lineVal*lineVal));
      intersections.push({ x: lineVal, y: y });
      intersections.push({ x: lineVal, y: -y });
    }

    return (
      <div className="flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
        <svg width="300" height="260" viewBox="0 0 300 260">
           <Axes />
           <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
           
           {/* Target Line */}
           {lineType === 'y' ? (
             <line x1={cx - 100} y1={cy - lineVal * r} x2={cx + 100} y2={cy - lineVal * r} stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
           ) : (
             <line x1={cx + lineVal * r} y1={cy - 100} x2={cx + lineVal * r} y2={cy + 100} stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
           )}

           {/* Intersections and Rays */}
           {intersections.map((p, i) => {
             const angle = Math.round(Math.atan2(p.y, p.x) * 180 / Math.PI);
             const displayAngle = angle < 0 ? angle + 360 : angle;
             return (
               <g key={i}>
                 <motion.line 
                    x1={cx} y1={cy} x2={cx + p.x * r} y2={cy - p.y * r} 
                    stroke="#3b82f6" strokeWidth="3" 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 * i }}
                 />
                 <circle cx={cx + p.x * r} cy={cy - p.y * r} r="5" fill="#3b82f6" />
                 <text x={cx + p.x * r + (p.x > 0 ? 5 : -40)} y={cy - p.y * r - 10} className="fill-blue-600 font-bold text-[10px]">
                   {displayAngle}°
                 </text>
               </g>
             );
           })}
           
           <text x={cx + 10} y={cy - lineVal * r - 10} className="fill-red-600 font-black text-xs">
             {lineType} = {lineVal}
           </text>
        </svg>
      </div>
    );
  }

  return <div className="p-8 bg-slate-50 rounded-2xl text-slate-400 italic">시각 자료 준비 중</div>;
}

