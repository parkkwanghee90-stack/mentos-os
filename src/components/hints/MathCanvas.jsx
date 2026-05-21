/**
 * MathCanvas.jsx  (Mafs 0.21 호환)
 *
 * 선언형 수학 객체 JSON → Mafs 자동 렌더링
 * SVG 좌표 계산 불필요. 각도/수식만 입력.
 *
 * 지원 객체 타입:
 *   triangle_angles  - 각도 + 한 변으로 삼각형 자동 계산
 *   function_plot    - 수식 문자열로 함수 그래프
 *   point            - 점
 *   segment          - 선분
 *   perpendicular    - 수선의 발
 *   circle           - 원
 *   label_text       - 텍스트 레이블 (LaTeX via Mafs.LaTeX)
 */
import React, { useMemo } from 'react';
import {
  Mafs, Coordinates,
  Plot, Point, Line, Polygon,
  LaTeX, Circle,
} from 'mafs';
import 'mafs/core.css';

const D = Math.PI / 180;


function parseExpr(expr) {
  if (!expr) return () => NaN;
  try {
    const body = String(expr)
      .replace(/\^/g, '**')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/pi/g, 'Math.PI');
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `try { return (${body}); } catch(e) { return NaN; }`);
    return fn;
  } catch { return () => NaN; }
}

function safeNum(val, fallback) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

// ─── 각도 + 변 → 꼭짓점 계산 ─────────────────────────────────
export function calcTriangle(angles, side = { name: 'BC', value: 4 }) {
  const A = safeNum(angles.A, 60);
  const B = safeNum(angles.B, 60);
  const C = safeNum(angles.C, 180 - A - B > 0 ? 180 - A - B : 60);

  const sinA = Math.sin(A * D), sinB = Math.sin(B * D), sinC = Math.sin(C * D);
  
  let bc = safeNum(side?.value, 4);
  // 만약 value가 문자열이고 파싱에 실패했다면 기본값 4
  
  if (side?.name === 'AB' || side?.name === 'c') bc = bc * sinA / Math.max(0.01, sinC);
  else if (side?.name === 'AC' || side?.name === 'b') bc = bc * sinA / Math.max(0.01, sinB);

  const AB = (bc / Math.max(0.01, sinC)) * sinB;
  return {
    A: [AB * Math.cos(B * D), AB * Math.sin(B * D)],
    B: [0, 0],
    C: [bc, 0],
    sides: { a: bc, b: (bc / Math.max(0.01, sinA)) * sinB, c: AB },
  };
}

// 수선의 발 계산
function footOfPerpendicular(P, L1, L2) {
  const dx = L2[0] - L1[0], dy = L2[1] - L1[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return L1;
  const t = ((P[0] - L1[0]) * dx + (P[1] - L1[1]) * dy) / len2;
  return [L1[0] + t * dx, L1[1] + t * dy];
}

// ─── 개별 객체 렌더러 ────────────────────────────────────────
function MathObject({ obj, triVerts }) {
  const color = obj.color || '#60a5fa';

  switch (obj.type) {

    case 'triangle_angles': {
      const verts = triVerts || calcTriangle(obj.angles, obj.side);
      const pts = [verts.A, verts.B, verts.C];
      
      const lblConfig = obj.labels || { vertices: true, sides: true, angles: true };

      return (
        <>
          <Polygon
            points={pts}
            color={color}
            fillOpacity={obj.fillOpacity ?? 0.08}
            strokeStyle={obj.strokeStyle ?? 'solid'}
          />
          {lblConfig.vertices !== false && (
            <>
              <LaTeX at={[verts.A[0], verts.A[1] + 0.4]} tex="A" color="#4ade80" />
              <LaTeX at={[verts.B[0] - 0.4, verts.B[1] - 0.3]} tex="B" color="#4ade80" />
              <LaTeX at={[verts.C[0] + 0.3, verts.C[1] - 0.3]} tex="C" color="#4ade80" />
            </>
          )}
          {lblConfig.angles !== false && obj.angles && (
            <>
              {obj.angles.A && <LaTeX at={[verts.A[0], verts.A[1] - 0.6]} tex={`${obj.angles.A}^{\\circ}`} color="#f59e0b" size={0.9} />}
              {obj.angles.B && <LaTeX at={[verts.B[0] + 0.8, verts.B[1] + 0.3]} tex={`${obj.angles.B}^{\\circ}`} color="#f59e0b" size={0.9} />}
              {obj.angles.C && <LaTeX at={[verts.C[0] - 0.8, verts.C[1] + 0.3]} tex={`${obj.angles.C}^{\\circ}`} color="#f59e0b" size={0.9} />}
            </>
          )}
          {lblConfig.sides !== false && (
            <>
              <LaTeX at={[(verts.B[0]+verts.C[0])/2, (verts.B[1]+verts.C[1])/2 - 0.5]} tex={obj.side?.name === 'a' || obj.side?.name === 'BC' ? 'a='+obj.side.value : 'a=' + verts.sides.a.toFixed(1).replace('.0','')} color="#3b82f6" size={0.9} />
              <LaTeX at={[(verts.A[0]+verts.C[0])/2 + 0.5, (verts.A[1]+verts.C[1])/2 + 0.5]} tex={obj.side?.name === 'b' || obj.side?.name === 'AC' ? 'b='+obj.side.value : 'b=' + verts.sides.b.toFixed(1).replace('.0','')} color="#3b82f6" size={0.9} />
              <LaTeX at={[(verts.A[0]+verts.B[0])/2 - 0.6, (verts.A[1]+verts.B[1])/2 + 0.3]} tex={obj.side?.name === 'c' || obj.side?.name === 'AB' ? 'c='+obj.side.value : 'c=' + verts.sides.c.toFixed(1).replace('.0','')} color="#3b82f6" size={0.9} />
            </>
          )}
        </>
      );
    }

    case 'function':
    case 'function_plot': {
      const fn = parseExpr(obj.expr);
      return (
        <Plot.OfX
          y={fn}
          color={color}
          style={obj.style === 'dashed' ? 'dashed' : 'solid'}
          minSamplingDepth={6}
        />
      );
    }

    case 'point': {
      const cArr = obj.coordinates || obj.coords || obj.coord; // Added obj.coord support
      let x = cArr ? cArr[0] : (obj.x || 0);
      let y = cArr ? cArr[1] : (obj.y || 0);
      x = typeof x === 'string' ? (parseFloat(x) || 0) : x;
      y = typeof y === 'string' ? (parseFloat(y) || 0) : y;
      if (isNaN(x) || isNaN(y)) return null;
      return (
        <>
          <Point x={x} y={y} color={obj.color || '#4ade80'} size={15} />
          {obj.label && <LaTeX at={[x + 0.35, y + 0.3]} tex={obj.label} color={obj.color || '#4ade80'} />}
        </>
      );
    }

    case 'line':
    case 'segment': {
      let pt1 = obj.from || obj.start || (obj.points && obj.points[0]); // Added obj.start
      let pt2 = obj.to || obj.end || (obj.points && obj.points[1]); // Added obj.end
      if (obj.x1 !== undefined && obj.y1 !== undefined) {
        pt1 = [obj.x1, obj.y1];
        pt2 = [obj.x2, obj.y2];
      }
      if (!Array.isArray(pt1) || !Array.isArray(pt2)) return null;
      return (
        <>
          <Line.Segment
            point1={pt1} point2={pt2}
            color={obj.color || '#f59e0b'}
            style={obj.style === 'dashed' ? 'dashed' : 'solid'}
            weight={obj.weight || 2}
          />
          {obj.label && (
            <LaTeX 
              at={[(pt1[0] + pt2[0])/2 + (obj.label_offset ? obj.label_offset[0] : 0), (pt1[1] + pt2[1])/2 + (obj.label_offset ? obj.label_offset[1] : 0.2)]} 
              tex={obj.label} 
              color={obj.color}
            />
          )}
        </>
      );
    }

    case 'perpendicular': {
      if (!obj.from || !obj.to_line) return null;
      const foot = footOfPerpendicular(obj.from, obj.to_line[0], obj.to_line[1]);
      return (
        <>
          <Line.Segment
            point1={obj.from} point2={foot}
            color={obj.color || '#f59e0b'}
            style="dashed" weight={2}
          />
          <Point x={foot[0]} y={foot[1]} color={obj.color || '#f59e0b'} />
          {obj.foot_label && <LaTeX at={[foot[0] + 0.2, foot[1] - 0.2]} tex={obj.foot_label} />}
        </>
      );
    }

    case 'circle': {
      if (obj.center && !Array.isArray(obj.center)) return null;
      const [cx, cy] = obj.center || [0,0];
      return (
        <Circle
          center={[cx, cy]}
          radius={obj.radius || 1}
          color={obj.color || '#ec4899'}
          fillOpacity={obj.fillOpacity ?? 0}
          strokeStyle={obj.strokeStyle ?? 'solid'}
        />
      );
    }

    case 'triangle': {
      if (!obj.points || !obj.points.A || !obj.points.B || !obj.points.C) return null;
      const pts = [obj.points.A, obj.points.B, obj.points.C];
      const lA = obj.labels?.A || [obj.points.A[0], obj.points.A[1] + 0.5];
      const lB = obj.labels?.B || [obj.points.B[0] - 0.5, obj.points.B[1] - 0.5];
      const lC = obj.labels?.C || [obj.points.C[0] + 0.5, obj.points.C[1] - 0.5];
      
      const midAB = [(obj.points.A[0] + obj.points.B[0]) / 2, (obj.points.A[1] + obj.points.B[1]) / 2];
      const midBC = [(obj.points.B[0] + obj.points.C[0]) / 2, (obj.points.B[1] + obj.points.C[1]) / 2];
      const midCA = [(obj.points.C[0] + obj.points.A[0]) / 2, (obj.points.C[1] + obj.points.A[1]) / 2];

      return (
        <>
          <Polygon points={pts} color={color} fillOpacity={obj.fillOpacity ?? 0.08} strokeStyle={obj.strokeStyle ?? 'solid'} />
          <LaTeX at={lA} tex="A" color="#4ade80" />
          <LaTeX at={lB} tex="B" color="#4ade80" />
          <LaTeX at={lC} tex="C" color="#4ade80" />
          
          {obj.angles?.A && <LaTeX at={[obj.points.A[0], obj.points.A[1] - 0.8]} tex={`${obj.angles.A}^{\\circ}`} color="#f59e0b" />}
          {obj.angles?.B && <LaTeX at={[obj.points.B[0] + 0.8, obj.points.B[1] + 0.3]} tex={`${obj.angles.B}^{\\circ}`} color="#f59e0b" />}
          {obj.angles?.C && <LaTeX at={[obj.points.C[0] - 0.8, obj.points.C[1] + 0.3]} tex={`${obj.angles.C}^{\\circ}`} color="#f59e0b" />}

          {obj.sides?.c && <LaTeX at={[midAB[0] - 0.5, midAB[1] + 0.5]} tex={`${obj.sides.c}`} color="#3b82f6" />}
          {obj.sides?.a && <LaTeX at={[midBC[0], midBC[1] - 0.6]} tex={`${obj.sides.a}`} color="#3b82f6" />}
          {obj.sides?.b && <LaTeX at={[midCA[0] + 0.5, midCA[1] + 0.5]} tex={`${obj.sides.b}`} color="#3b82f6" />}
        </>
      );
    }

    case 'polygon': {
      if (!Array.isArray(obj.points) || obj.points.length < 3) return null;
      // 추가 방어: 내부 point가 배열 형식이 아닌 경우(예: 문자열 "A") 필터링
      const validPts = obj.points.filter(p => Array.isArray(p) && p.length >= 2);
      if (validPts.length < 3) return null;
      
      return (
        <Polygon
          points={validPts}
          color={obj.color || '#94a3b8'}
          fillOpacity={obj.fillOpacity ?? 0.05}
          strokeStyle={obj.strokeStyle ?? 'solid'}
        />
      );
    }

    case 'text':
    case 'label_text':
    case 'latex_label': {
      const rawText = obj.tex || obj.text || obj.content || '';
      const cleanText = rawText.replace(/^\\\(|^\\\[/, '').replace(/\\\)$|\\\]$/, '').trim();
      const isAlpha = /^[A-Za-z]$/.test(cleanText); 
      const defaultColor = isAlpha ? '#4ade80' : '#f8fafc'; 
      const defaultSize = isAlpha ? 1.5 : (obj.size || 1.1);
      const coord = obj.at || obj.position || [obj.x || 0, obj.y || 0];
      return <LaTeX at={coord} tex={cleanText} size={defaultSize} color={obj.color || defaultColor} />;
    }

    // --- New Declarative Hooks ---
    case 'drawCircle': {
      return (
        <>
          <Circle center={obj.center || [0,0]} radius={obj.radius || 1} color={color} fillOpacity={0} />
          {obj.center_label && <LaTeX at={[(obj.center?.[0]||0)+0.2, (obj.center?.[1]||0)-0.2]} tex={obj.center_label} color="#4ade80" />}
        </>
      );
    }
    case 'drawSegment': {
      return (
        <Line.Segment point1={obj.p1} point2={obj.p2} color={color} style={obj.style || "solid"} />
      );
    }
    case 'drawInscribedQuadrilateral': {
      // Input: angles defining points on a unit circle or specified circle
      const r = obj.radius || 1;
      const c = obj.center || [0,0];
      const pts = obj.angles.map(a => [c[0] + r*Math.cos(a*D), c[1] + r*Math.sin(a*D)]);
      return (
        <>
          <Polygon points={pts} color={color} fillOpacity={0.05} />
          {obj.labels && pts.map((p, i) => (
             <LaTeX key={i} at={[p[0]*1.15, p[1]*1.15]} tex={obj.labels[i]} color="#4ade80" />
          ))}
        </>
      );
    }
    case 'markLength': {
       const mid = [(obj.p1[0]+obj.p2[0])/2, (obj.p1[1]+obj.p2[1])/2];
       const offset = obj.offset || [0, 0.3];
       return <LaTeX at={[mid[0]+offset[0], mid[1]+offset[1]]} tex={obj.value} color="#3b82f6" />;
    }
    case 'markAngle': {
       // Since native mafs Angle requires a lot of math, we just place text near vertex
       const vx = obj.vertex[0], vy = obj.vertex[1];
       const offset = obj.offset || [0.4, 0.4];
       return <LaTeX at={[vx+offset[0], vy+offset[1]]} tex={obj.value} color="#f59e0b" />;
    }

    // Removed duplicate label_text cases

    default:
      return null;
  }
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────
export default function MathCanvas({ objects = [], viewBox, height = 280 }) {
  const triangleObj = objects.find(o => o.type === 'triangle_angles');

  const triVerts = useMemo(() => {
    if (!triangleObj) return null;
    return calcTriangle(triangleObj.angles, triangleObj.side || { name: 'BC', value: 4 });
  }, [triangleObj]);

  const autoBox = useMemo(() => {
    if (viewBox) {
      const dx = viewBox.x[1] - viewBox.x[0];
      const dy = viewBox.y[1] - viewBox.y[0];
      const padX = dx * 0.5; // 50% padding for much smaller shape
      const padY = dy * 0.5;
      return {
        x: [viewBox.x[0] - padX, viewBox.x[1] + padX],
        y: [viewBox.y[0] - padY, viewBox.y[1] + padY],
      };
    }
    if (triVerts) {
      const { A, B, C } = triVerts;
      const xs = [A[0], B[0], C[0]], ys = [A[1], B[1], C[1]];
      const pad = (Math.max(...xs) - Math.min(...xs)) * 0.5 + 2.0;
      return {
        x: [Math.min(...xs) - pad, Math.max(...xs) + pad],
        y: [Math.min(...ys) - pad, Math.max(...ys) + pad],
      };
    }
    return { x: [-8, 8], y: [-6, 10] };
  }, [triVerts, viewBox]);

  const showAxes = objects.some(o => o.type === 'axes' || o.type === 'function_plot' || o.type === 'function');
  const hasObjects = objects.length > 0;

  // [STRICT RULE] objects가 없으면 XY 축 렌더링 자체를 금지한다. (빈 그래프 방지)
  if (!hasObjects && !showAxes) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: '#0f172a', borderRadius: '8px' }}>
        해설 데이터 로드 중...
      </div>
    );
  }

  return (
    <Mafs viewBox={autoBox} height={height} preserveAspectRatio={true}>
      {showAxes ? (
        <Coordinates.Cartesian subdivisions={true} />
      ) : (
        /* 도형 문제에서는 축을 완전히 숨김 */
        <Coordinates.Cartesian
          xAxis={{ lines: false, labels: () => '' }}
          yAxis={{ lines: false, labels: () => '' }}
          subdivisions={false}
        />
      )}
      {objects.map((obj, i) => (
        <MathObject key={i} obj={obj} triVerts={obj.type === 'triangle_angles' ? triVerts : null} />
      ))}
    </Mafs>
  );
}
