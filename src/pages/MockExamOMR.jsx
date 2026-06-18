// 고1·고2 모의고사 OMR 채점 화면 — 문제지 페이지 이미지 + 30답 입력 → 정답키 채점 + 취약유형 분석.
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { HG1_2025_10 } from '@/data/mockExams/HG1_2025_10';
import { HG1_2025_09 } from '@/data/mockExams/HG1_2025_09';
import { HG1_2025_06 } from '@/data/mockExams/HG1_2025_06';
import { HG1_2025_03 } from '@/data/mockExams/HG1_2025_03';

const EXAMS = { 'hg1-2025-10': HG1_2025_10, 'hg1-2025-09': HG1_2025_09, 'hg1-2025-06': HG1_2025_06, 'hg1-2025-03': HG1_2025_03 };
const CIRC = ['①', '②', '③', '④', '⑤'];
const C = { bg: '#0b1020', card: 'rgba(255,255,255,0.04)', line: '1px solid rgba(255,255,255,0.08)', text: '#e5e7eb', sub: '#94a3b8', accent: '#3b82f6', good: '#34d399', bad: '#f87171', gold: '#fbbf24' };

function gradeOf(score) { const r = Math.round(score / 100 * 100); return r >= 90 ? 1 : r >= 80 ? 2 : r >= 70 ? 3 : r >= 60 ? 4 : r >= 50 ? 5 : 6; }

export default function MockExamOMR() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = EXAMS[examId] || HG1_2025_10;
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const setAns = (num, val) => setAnswers(a => ({ ...a, [num]: val }));

  const grade = () => {
    let correct = 0; const wrong = [];
    exam.questions.forEach(q => {
      const ua = answers[q.num];
      const ok = q.obj ? (Number(ua) === q.answer) : (String(ua ?? '').trim() === String(q.answer));
      if (ok) correct++; else wrong.push(q);
    });
    const total = exam.questions.length;
    const byType = {};
    wrong.forEach(q => { (byType[q.type] = byType[q.type] || []).push(q.num); });
    const weakTypes = Object.entries(byType).sort((a, b) => b[1].length - a[1].length);
    setResult({ correct, total, score: Math.round(correct / total * 100), wrong, weakTypes });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = Array.from({ length: exam.pageCount }, (_, i) => `${exam.pageBase}p${i + 1}.jpg`);
  const answered = Object.keys(answers).filter(k => answers[k] !== '' && answers[k] != null).length;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '18px 14px 90px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={18} /> 대시보드
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{exam.title}</h1>
      <p style={{ color: C.sub, fontSize: 13, margin: '0 0 18px' }}>문제를 풀고 아래 답안에 입력하세요. (객관식 1~21 · 단답 22~30)</p>

      {/* 채점 결과 */}
      {result && (
        <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 16, padding: 20, marginBottom: 22 }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>{result.score}점 <span style={{ fontSize: 15, color: C.sub, fontWeight: 600 }}>({result.correct}/{result.total}) · 추정 {gradeOf(result.score)}등급</span></div>
          {result.weakTypes.length > 0 ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={15} /> 취약 유형 (틀린 문제)</div>
              {result.weakTypes.slice(0, 6).map(([type, nums]) => (
                <div key={type} style={{ fontSize: 13.5, color: C.text, padding: '4px 0' }}>
                  <b style={{ color: C.bad }}>{nums.join(', ')}번</b> · {type} <span style={{ color: C.sub }}>({nums.length}문제)</span>
                </div>
              ))}
              <p style={{ color: C.sub, fontSize: 12.5, marginTop: 8 }}>위 유형을 집중 보강하면 가장 효과가 큽니다. (AVS 해설 연결 예정)</p>
            </div>
          ) : <div style={{ marginTop: 10, color: C.good, fontWeight: 700 }}>🎉 전부 정답! 완벽합니다.</div>}
          <button onClick={() => { setResult(null); setAnswers({}); window.scrollTo({ top: 0 }); }} style={{ marginTop: 14, background: C.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, cursor: 'pointer' }}>다시 풀기</button>
        </div>
      )}

      {/* 문제지 페이지 이미지 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {pages.map((src, i) => (
          <a key={i} href={src} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
            <img src={src} alt={`${i + 1}페이지`} loading="lazy" style={{ width: '100%', maxWidth: 820, margin: '0 auto', display: 'block', borderRadius: 8, background: '#fff' }} />
          </a>
        ))}
      </div>

      {/* OMR 답안 입력 */}
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>✍️ 답안 입력 <span style={{ color: C.sub, fontWeight: 500, fontSize: 13 }}>({answered}/{exam.questions.length})</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, maxWidth: 820 }}>
        {exam.questions.map(q => {
          const wrong = result && result.wrong.some(w => w.num === q.num);
          const showMark = !!result;
          return (
            <div key={q.num} style={{ background: C.card, border: showMark ? `1px solid ${wrong ? 'rgba(248,113,113,0.5)' : 'rgba(52,211,153,0.5)'}` : C.line, borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                {q.num}번 {showMark && (wrong ? <XCircle size={14} color={C.bad} /> : <CheckCircle size={14} color={C.good} />)}
                {showMark && <span style={{ color: C.sub, fontWeight: 500, fontSize: 11 }}>정답 {q.obj ? CIRC[q.answer - 1] : q.answer}</span>}
              </div>
              {q.obj ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  {CIRC.map((c, idx) => (
                    <button key={idx} onClick={() => setAns(q.num, idx + 1)} disabled={showMark}
                      style={{ flex: 1, padding: '5px 0', borderRadius: 7, cursor: showMark ? 'default' : 'pointer', fontSize: 14,
                        border: 'none', background: Number(answers[q.num]) === idx + 1 ? C.accent : 'rgba(255,255,255,0.07)', color: Number(answers[q.num]) === idx + 1 ? '#fff' : C.sub }}>{c}</button>
                  ))}
                </div>
              ) : (
                <input value={answers[q.num] ?? ''} onChange={e => setAns(q.num, e.target.value)} disabled={showMark} inputMode="numeric" placeholder="정답 입력"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 14 }} />
              )}
            </div>
          );
        })}
      </div>

      {!result && (
        <button onClick={grade} style={{ marginTop: 22, width: '100%', maxWidth: 820, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
          제출하고 채점하기 ({answered}/{exam.questions.length})
        </button>
      )}
    </div>
  );
}
