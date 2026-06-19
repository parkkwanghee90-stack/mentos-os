/**
 * ProblemFigure.jsx — 문제/AVS의 도형을 MathCanvas로 렌더.
 * figure = { objects: [...], viewBox?: {x:[..],y:[..]} }  (MathCanvas 선언형 도형 객체)
 * 데이터가 없으면 아무것도 렌더하지 않는다(텍스트로만 풀 수 있는 문제는 영향 없음).
 * 자동 생성 도형 데이터가 깨져도 페이지가 죽지 않도록 에러 바운더리로 감싼다.
 */
import React from 'react';
import MathCanvas from '@/components/hints/MathCanvas';

class FigureBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch() { /* 도형 렌더 실패는 조용히 무시(문제 텍스트는 그대로) */ }
  render() { return this.state.err ? null : this.props.children; }
}

export default function ProblemFigure({ figure, height = 300 }) {
  const objects = figure?.objects;
  if (!Array.isArray(objects) || objects.length === 0) return null;
  return (
    <FigureBoundary>
      <div style={{
        display: 'flex', justifyContent: 'center',
        background: '#ffffff', borderRadius: 12, padding: '0.6rem',
        margin: '0 0 1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
      }}>
        <MathCanvas objects={objects} viewBox={figure.viewBox} height={height} />
      </div>
    </FigureBoundary>
  );
}
