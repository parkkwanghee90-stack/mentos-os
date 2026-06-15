import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { MathText } from '@/components/MathProblemRenderer';
import GeometryHintPlayer from '@/components/hints/GeometryHintPlayer';
import CIRCLE_EQ_STEP2 from '@/data/circleEqStep2';

/**
 * 원의 방정식 2단계 — 단계별 도형 작도 애니메이션 실습 페이지 (새 기능).
 * 문제를 고르면 GeometryHintPlayer 가 원→포물선→교점→계산 순서로 도형을 살아 움직이게 그린다.
 * route: /lab/circle-eq
 */
const C = {
  bg: '#0b1020', card: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  text: '#e5e7eb', sub: '#94a3b8', accent: '#3b82f6', gold: '#fbbf24',
};

export default function CircleEqLab() {
  const navigate = useNavigate();
  const problems = CIRCLE_EQ_STEP2;
  const [idx, setIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const p = problems[idx];

  const go = (d) => {
    setIdx(i => Math.max(0, Math.min(problems.length - 1, i + d)));
    setShowHint(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '20px 16px 80px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={18} /> 대시보드
      </button>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>원의 방정식 <span style={{ color: C.accent }}>2단계</span></h1>
        <span style={{ color: C.sub, fontSize: 13 }}>단계별 도형 작도 해설</span>
      </div>
      <p style={{ color: C.sub, fontSize: 13, margin: '0 0 16px' }}>해설을 열면 원 → 포물선 → 교점 → 계산 순서로 도형이 차근차근 그려집니다.</p>

      {/* 문제 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => go(-1)} disabled={idx === 0} style={navBtn(idx === 0)}><ChevronLeft size={16} /> 이전</button>
        <span style={{ color: C.sub, fontSize: 13 }}>{idx + 1} / {problems.length}</span>
        <button onClick={() => go(1)} disabled={idx === problems.length - 1} style={navBtn(idx === problems.length - 1)}>다음 <ChevronRight size={16} /></button>
      </div>

      {/* 문제 카드 */}
      <div style={{ background: C.card, border: C.border, borderRadius: 16, padding: 20 }}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 700, marginBottom: 8 }}>문제 {p.number}</div>
        <div style={{ fontSize: 16, lineHeight: 1.7 }}><MathText text={p.questionText} /></div>

        <button onClick={() => setShowHint(s => !s)}
          style={{ marginTop: 16, background: showHint ? C.card : 'linear-gradient(135deg,#3b82f6,#8b5cf6)', border: showHint ? C.border : 'none', color: '#fff', fontWeight: 800, fontSize: 14, padding: '12px 18px', borderRadius: 12, cursor: 'pointer' }}>
          {showHint ? '▲ 해설 닫기' : '▼ 단계별 작도 해설 보기'}
        </button>

        {showHint && (
          <div style={{ marginTop: 8 }}>
            <GeometryHintPlayer data={p.hint} />
            <div style={{ marginTop: 12, color: '#10b981', fontWeight: 800, fontSize: 15 }}>
              정답: <MathText text={`$${p.answer}$`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function navBtn(disabled) {
  return {
    display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 10,
    border: C.border, background: C.card, color: disabled ? '#475569' : C.text,
    cursor: disabled ? 'default' : 'pointer', fontSize: 13, fontWeight: 700,
  };
}
