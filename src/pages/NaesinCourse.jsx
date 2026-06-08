import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, BookOpen, Sparkles, Lock } from 'lucide-react';
import { MathText } from '@/components/MathProblemRenderer';
import COURSE from '@/data/naesin_full.json';
import { useAuth } from '@/context/AuthContext';

const LEVELS = [
  { key: '필수', label: '기본 필수유형', sub: '3~5등급 → 무조건 3등급', color: '#10b981', icon: '🟢' },
  { key: '심화', label: '심화 실력', sub: '1~2등급 도전', color: '#ef4444', icon: '🔴' },
];
const circled = ['①', '②', '③', '④', '⑤'];

function normAns(s) { return String(s ?? '').replace(/\s/g, '').replace(/[①②③④⑤]/g, m => '12345'['①②③④⑤'.indexOf(m)]); }

export default function NaesinCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPaid = !!user || localStorage.getItem('mentos_is_paid') === 'true' || localStorage.getItem('mentos_premium') === 'true' || localStorage.getItem('mentos_super_pass') === 'true';

  const [level, setLevel] = useState('필수');
  const [unit, setUnit] = useState(null);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [graded, setGraded] = useState(null); // 'correct'|'wrong'|null
  const [showAVS, setShowAVS] = useState(false);

  const units = COURSE.levels[level] || {};
  const unitNames = Object.keys(units).sort((a, b) => units[b].length - units[a].length);
  const problems = unit ? (units[unit] || []) : [];
  const prob = problems[idx];

  const [solved, setSolved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('naesin_solved') || '[]')); } catch { return new Set(); }
  });
  const markSolved = (id) => {
    const ns = new Set(solved); ns.add(id); setSolved(ns);
    localStorage.setItem('naesin_solved', JSON.stringify([...ns]));
  };

  const reset = () => { setInput(''); setGraded(null); setShowAVS(false); };
  const openUnit = (u) => { setUnit(u); setIdx(0); reset(); };
  const go = (d) => { const n = idx + d; if (n >= 0 && n < problems.length) { setIdx(n); reset(); } };

  const grade = () => {
    if (!prob || !input.trim()) return;
    const ok = normAns(input) === normAns(prob.answer);
    setGraded(ok ? 'correct' : 'wrong');
    if (ok) markSolved(prob.id);
    setShowAVS(true); // 채점 후 AVS 공개
  };

  // 결제 게이트
  if (!isPaid) {
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: 'center', maxWidth: 480 }}>
          <Lock size={40} color="#a78bfa" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontWeight: 900, fontSize: '1.4rem' }}>기말 내신 완벽대비 풀코스</h2>
          <p style={{ color: '#94a3b8', margin: '0.8rem 0 1.5rem', lineHeight: 1.6 }}>
            기본 필수유형 + 심화 실력 · 단원별 문제 + 자동채점 + AVS 해설 + 복습<br />
            <b style={{ color: '#fff' }}>오픈 이벤트 19,900원</b>으로 완벽 대비하세요.
          </p>
          <button style={btnPrimary} onClick={() => navigate('/login')}>지금 시작하기</button>
          <button style={{ ...btnGhost, marginTop: 10 }} onClick={() => navigate('/dashboard')}>대시보드로</button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '1rem' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button style={iconBtn} onClick={() => unit ? (setUnit(null), reset()) : navigate('/dashboard')}><ArrowLeft size={20} /></button>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>{COURSE.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{COURSE.grade} · {COURSE.term}</div>
          </div>
        </div>

        {/* 레벨 탭 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {LEVELS.map(l => (
            <button key={l.key} onClick={() => { setLevel(l.key); setUnit(null); reset(); }}
              style={{ flex: 1, padding: '0.9rem', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${level === l.key ? l.color : 'rgba(255,255,255,0.12)'}`,
                background: level === l.key ? `${l.color}1a` : 'rgba(255,255,255,0.03)', color: '#fff' }}>
              <div style={{ fontWeight: 800 }}>{l.icon} {l.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l.sub}</div>
            </button>
          ))}
        </div>

        {/* 단원 그리드 */}
        {!unit && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {unitNames.map(u => {
              const list = units[u]; const done = list.filter(p => solved.has(p.id)).length;
              return (
                <button key={u} onClick={() => openUnit(u)} style={unitCard}>
                  <BookOpen size={18} color="#a78bfa" />
                  <div style={{ fontWeight: 800, margin: '6px 0 2px' }}>{u}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{list.length}문제 · 푼 {done}</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 8 }}>
                    <div style={{ width: `${list.length ? done / list.length * 100 : 0}%`, height: '100%', background: '#10b981', borderRadius: 4 }} />
                  </div>
                </button>
              );
            })}
            {unitNames.length === 0 && <p style={{ color: '#94a3b8' }}>준비 중인 단원입니다.</p>}
          </div>
        )}

        {/* 문제 풀이 */}
        {unit && prob && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 700 }}>{unit} · {idx + 1}/{problems.length} · {prob.level}</span>
              {solved.has(prob.id) && <span style={{ color: '#10b981', fontSize: '0.8rem' }}><CheckCircle size={14} /> 완료</span>}
            </div>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: 18, color: '#f1f5f9' }}>
              <MathText text={prob.latex} />
            </div>

            {/* 정답 입력 */}
            {prob.type === '객관식' ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {circled.map((c, i) => (
                  <button key={i} onClick={() => setInput(String(i + 1))}
                    style={{ ...choiceBtn, ...(input === String(i + 1) ? { background: '#7c3aed', borderColor: '#7c3aed' } : {}) }}>{c}</button>
                ))}
              </div>
            ) : (
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="정답 입력"
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.25)', color: '#fff', marginBottom: 14 }} />
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={btnPrimary} onClick={grade} disabled={!input.trim()}>채점하기</button>
              <button style={btnGhost} onClick={() => setShowAVS(s => !s)}>AVS 해설</button>
            </div>

            {graded && (
              <div style={{ marginTop: 14, padding: '0.8rem 1rem', borderRadius: 12, background: graded === 'correct' ? '#10b98122' : '#ef444422', color: graded === 'correct' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {graded === 'correct' ? <><CheckCircle size={16} /> 정답입니다!</> : <><XCircle size={16} /> 오답 · 정답: {prob.answer}</>}
              </div>
            )}

            {/* AVS 해설 */}
            {showAVS && (
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
                <div style={{ fontWeight: 800, color: '#a78bfa', marginBottom: 10 }}><Sparkles size={16} /> 사고력 AVS 해설</div>
                {prob.avs && prob.avs.length ? prob.avs.map((s, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: '0.8rem 1rem', borderRadius: 12, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' }}>
                    <div style={{ fontWeight: 700, color: '#c4b5fd', marginBottom: 6, fontSize: '0.9rem' }}>[{s.phase}] {s.title}</div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.8, fontSize: '0.95rem' }}><MathText text={s.content} /></div>
                  </div>
                )) : <p style={{ color: '#94a3b8' }}>이 문제의 AVS 해설은 준비 중입니다. (정답: {prob.answer})</p>}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button style={btnGhost} onClick={() => go(-1)} disabled={idx === 0}>← 이전</button>
              <button style={btnGhost} onClick={() => go(1)} disabled={idx === problems.length - 1}>다음 →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const wrap = { minHeight: '100vh', background: '#0b1020', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '1rem 0' };
const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '1.4rem' };
const unitCard = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '1rem', color: '#fff', cursor: 'pointer', textAlign: 'left' };
const btnPrimary = { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: '#fff', border: 'none', padding: '0.8rem 1.4rem', borderRadius: 12, fontWeight: 800, cursor: 'pointer' };
const btnGhost = { background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', padding: '0.8rem 1.2rem', borderRadius: 12, fontWeight: 700, cursor: 'pointer' };
const iconBtn = { background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, cursor: 'pointer' };
const choiceBtn = { width: 52, height: 52, borderRadius: 12, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' };
