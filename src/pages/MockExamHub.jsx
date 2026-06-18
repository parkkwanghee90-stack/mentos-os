// 모의고사 허브 — 고1·고2·고3 카드 → 연도·월 드롭다운 → 시험 선택.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

// 빌드된 시험만 id 부여(=바로 풀이/채점). id 없으면 '준비중'.
const REGISTRY = {
  고1: { external: false, years: { '2025': [{ m: '10월', id: 'hg1-2025-10' }, { m: '9월', id: 'hg1-2025-09' }, { m: '6월', id: 'hg1-2025-06' }, { m: '3월', id: 'hg1-2025-03' }] } },
  고2: { external: false, years: {} },
  고3: { external: true }, // 기존 고3 모의고사 플로우(수능·6·9·3월)
};
const GRADES = [
  { key: '고1', icon: '1️⃣', color: '#3b82f6', sub: '공통수학 · 전국연합학력평가' },
  { key: '고2', icon: '2️⃣', color: '#8b5cf6', sub: '수학Ⅰ·Ⅱ · 전국연합학력평가' },
  { key: '고3', icon: '3️⃣', color: '#ec4899', sub: '수능·6·9월 모의평가' },
];
const C = { bg: '#0b1020', card: 'rgba(255,255,255,0.04)', line: '1px solid rgba(255,255,255,0.08)', text: '#e5e7eb', sub: '#94a3b8', accent: '#3b82f6' };

export default function MockExamHub() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);      // 펼친 학년
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const pickGrade = (g) => {
    if (REGISTRY[g].external) { navigate('/grade-select', { state: { subjectOverride: '모의고사' } }); return; }
    setOpen(open === g ? null : g); setYear(''); setMonth('');
  };
  const start = () => {
    const months = REGISTRY[open]?.years?.[year] || [];
    const sel = months.find(x => x.m === month);
    if (sel?.id) navigate(`/class/mock/${sel.id}`);
    else alert('해당 회차는 준비 중입니다. 곧 추가됩니다!');
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '20px 16px 80px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={18} /> 대시보드
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>📝 모의고사</h1>
      <p style={{ color: C.sub, fontSize: 14, margin: '0 0 20px' }}>학년을 고르고 연도·월을 선택하세요. 풀이 후 자동 채점 + 취약유형 분석.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
        {GRADES.map(g => {
          const years = Object.keys(REGISTRY[g.key].years || {});
          const months = (REGISTRY[g.key].years?.[year] || []);
          const expanded = open === g.key;
          return (
            <div key={g.key} style={{ background: C.card, border: expanded ? `1px solid ${g.color}66` : C.line, borderRadius: 18, overflow: 'hidden' }}>
              <button onClick={() => pickGrade(g.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'none', border: 'none', color: C.text, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 30 }}>{g.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{g.key} 모의고사</div>
                  <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{g.sub}</div>
                </div>
                <ChevronRight size={20} color={C.sub} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: '.2s' }} />
              </button>

              {expanded && !REGISTRY[g.key].external && (
                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {years.length === 0 ? (
                    <div style={{ color: C.sub, fontSize: 13.5, padding: '6px 0' }}>곧 추가됩니다. (정답키 준비 중)</div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <select value={year} onChange={e => { setYear(e.target.value); setMonth(''); }}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 12px', fontSize: 15, cursor: 'pointer' }}>
                          <option value="" style={{ color: '#111' }}>연도 선택</option>
                          {years.map(y => <option key={y} value={y} style={{ color: '#111' }}>{y}년</option>)}
                        </select>
                        <select value={month} onChange={e => setMonth(e.target.value)} disabled={!year}
                          style={{ flex: 1, background: 'rgba(0,0,0,0.25)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 12px', fontSize: 15, cursor: 'pointer' }}>
                          <option value="" style={{ color: '#111' }}>월 선택</option>
                          {months.map(mo => <option key={mo.m} value={mo.m} style={{ color: '#111' }}>{mo.m}{mo.id ? '' : ' (준비중)'}</option>)}
                        </select>
                      </div>
                      <button onClick={start} disabled={!month}
                        style={{ background: month ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : 'rgba(255,255,255,0.08)', color: month ? '#fff' : C.sub, border: 'none', borderRadius: 12, padding: '12px', fontWeight: 800, fontSize: 15, cursor: month ? 'pointer' : 'default' }}>
                        시험 시작하기 →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
