// 고1·고2 모의고사 — 고3 모의고사(MentosMockExam)와 동일 구조:
//  ① 좌: 시험지 / 우: 고정 OMR 판독기 — 문항별 보기(①~⑤)·단답을 누르면 채점지에 자동 반영(상태 공유)
//  ② 제출 → 채점 + 취약분석(틀린문항·취약유형)
//  ③ 취약분석에서 '단계별 해설 풀기' → 따로 문제가 풀스크린으로 나와 풀이(좌:시험지 / 우:HintPlayerRouter PCBS)
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Sparkles, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import HintPlayerRouter from '@/components/hints/HintPlayerRouter';
import { getMockHint } from '@/data/mockHints';
import { HG1_2025_10 } from '@/data/mockExams/HG1_2025_10';
import { HG1_2025_09 } from '@/data/mockExams/HG1_2025_09';
import { HG1_2025_06 } from '@/data/mockExams/HG1_2025_06';
import { HG1_2025_03 } from '@/data/mockExams/HG1_2025_03';
import { HG1_2024_10 } from '@/data/mockExams/HG1_2024_10';
import { HG1_2024_09 } from '@/data/mockExams/HG1_2024_09';
import { HG1_2024_06 } from '@/data/mockExams/HG1_2024_06';
import { HG1_2024_03 } from '@/data/mockExams/HG1_2024_03';
import { HG1_2023_12 } from '@/data/mockExams/HG1_2023_12';
import { HG1_2023_09 } from '@/data/mockExams/HG1_2023_09';
import { HG1_2023_06 } from '@/data/mockExams/HG1_2023_06';
import { HG1_2023_03 } from '@/data/mockExams/HG1_2023_03';
import { HG2_2025_10 } from '@/data/mockExams/HG2_2025_10';
import { HG2_2025_09 } from '@/data/mockExams/HG2_2025_09';
import { HG2_2025_06 } from '@/data/mockExams/HG2_2025_06';
import { HG2_2025_03 } from '@/data/mockExams/HG2_2025_03';
import { HG2_2024_10 } from '@/data/mockExams/HG2_2024_10';
import { HG2_2024_09 } from '@/data/mockExams/HG2_2024_09';
import { HG2_2024_06 } from '@/data/mockExams/HG2_2024_06';
import { HG2_2024_03 } from '@/data/mockExams/HG2_2024_03';
import { HG2_2023_09 } from '@/data/mockExams/HG2_2023_09';
import { HG2_2023_06 } from '@/data/mockExams/HG2_2023_06';
import { HG2_2023_03 } from '@/data/mockExams/HG2_2023_03';

const EXAMS = {
  'hg1-2025-10': HG1_2025_10, 'hg1-2025-09': HG1_2025_09, 'hg1-2025-06': HG1_2025_06, 'hg1-2025-03': HG1_2025_03,
  'hg1-2024-10': HG1_2024_10, 'hg1-2024-09': HG1_2024_09, 'hg1-2024-06': HG1_2024_06, 'hg1-2024-03': HG1_2024_03,
  'hg1-2023-12': HG1_2023_12, 'hg1-2023-09': HG1_2023_09, 'hg1-2023-06': HG1_2023_06, 'hg1-2023-03': HG1_2023_03,
  'hg2-2025-10': HG2_2025_10, 'hg2-2025-09': HG2_2025_09, 'hg2-2025-06': HG2_2025_06, 'hg2-2025-03': HG2_2025_03,
  'hg2-2024-10': HG2_2024_10, 'hg2-2024-09': HG2_2024_09, 'hg2-2024-06': HG2_2024_06, 'hg2-2024-03': HG2_2024_03,
  'hg2-2023-09': HG2_2023_09, 'hg2-2023-06': HG2_2023_06, 'hg2-2023-03': HG2_2023_03,
};
const CIRC = ['①', '②', '③', '④', '⑤'];
const C = { bg: '#0b1020', card: 'rgba(255,255,255,0.04)', line: '1px solid rgba(255,255,255,0.08)', text: '#e5e7eb', sub: '#94a3b8', accent: '#3b82f6', good: '#34d399', bad: '#f87171', gold: '#fbbf24' };
function gradeOf(score) { return score >= 90 ? 1 : score >= 80 ? 2 : score >= 70 ? 3 : score >= 60 ? 4 : score >= 50 ? 5 : 6; }

export default function MockExamOMR() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = EXAMS[examId] || HG1_2025_10;
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);   // { list: [num...], idx }
  const [showSheet, setShowSheet] = useState(false);

  const pages = useMemo(() => Array.from({ length: exam.pageCount }, (_, i) => `${exam.pageBase}p${i + 1}.jpg`), [exam]);
  const hintNums = useMemo(() => exam.questions.filter(q => getMockHint(examId, q.num)).map(q => q.num), [exam, examId]);

  const setAns = (num, val) => { if (!result) setAnswers(a => ({ ...a, [num]: val })); };
  const answered = exam.questions.filter(q => answers[q.num] !== '' && answers[q.num] != null).length;

  const grade = () => {
    let correct = 0; const wrong = [];
    exam.questions.forEach(q => {
      const ua = answers[q.num];
      const ok = q.obj ? (Number(ua) === q.answer) : (String(ua ?? '').trim() === String(q.answer));
      if (ok) correct++; else wrong.push(q);
    });
    const total = exam.questions.length;
    const byType = {};
    wrong.forEach(q => { (byType[q.type || '기타'] = byType[q.type || '기타'] || []).push(q.num); });
    const weakTypes = Object.entries(byType).sort((a, b) => b[1].length - a[1].length);
    setResult({ correct, total, score: Math.round(correct / total * 100), wrong, weakTypes });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startReview = (nums) => { if (nums.length) { setReview({ list: nums, idx: 0 }); setShowSheet(false); } };
  const reviewAllWeak = () => {
    const wrongWithHint = (result?.wrong || []).map(q => q.num).filter(n => hintNums.includes(n));
    const set = Array.from(new Set([...wrongWithHint, ...hintNums])).sort((a, b) => a - b);
    startReview(set);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '18px 14px 40px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 14 }}>
        <ArrowLeft size={18} /> 대시보드
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{exam.title}</h1>
      <p style={{ color: C.sub, fontSize: 13, margin: '0 0 18px' }}>왼쪽 시험지를 풀고 오른쪽 <b style={{ color: C.text }}>OMR 판독기</b>에서 보기를 누르면 자동 채점됩니다.</p>

      {/* 고3식 2단: 좌 시험지 / 우 sticky OMR 판독기 */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* 좌: 시험지 페이지 */}
        <div style={{ flex: '1 1 520px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pages.map((src, i) => (
            <a key={i} href={src} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
              <img src={src} alt={`${i + 1}페이지`} loading="lazy" style={{ width: '100%', display: 'block', borderRadius: 8, background: '#fff' }} />
            </a>
          ))}
        </div>

        {/* 우: OMR 판독기 (sticky) */}
        <aside style={{ flex: '0 1 360px', minWidth: 300, position: 'sticky', top: 12, alignSelf: 'flex-start', background: 'rgba(255,255,255,0.03)', border: C.line, borderRadius: 16, overflow: 'hidden', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1e293b', padding: '14px 16px' }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>MENTOS OMR 판독기</div>
            <div style={{ color: C.sub, fontSize: 12 }}>자동 채점 · 취약분석 연동 ({answered}/{exam.questions.length})</div>
          </div>
          <div style={{ overflow: 'auto', padding: '6px 12px', flex: 1 }}>
            {exam.questions.map(q => {
              const wrong = result && result.wrong.some(w => w.num === q.num);
              const showMark = !!result;
              return (
                <div key={q.num} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: C.line }}>
                  <span style={{ width: 34, fontSize: 12.5, fontWeight: 700, color: showMark ? (wrong ? C.bad : C.good) : C.sub, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {String(q.num).padStart(2, '0')}{hintNums.includes(q.num) && <Sparkles size={10} color={C.gold} />}
                  </span>
                  {q.obj ? (
                    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                      {CIRC.map((c, idx) => {
                        const sel = Number(answers[q.num]) === idx + 1;
                        const isAns = showMark && q.answer === idx + 1;
                        return (
                          <button key={idx} onClick={() => setAns(q.num, idx + 1)} disabled={showMark}
                            style={{ flex: 1, padding: '4px 0', borderRadius: 4, fontSize: 12, cursor: showMark ? 'default' : 'pointer', border: isAns ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.12)',
                              background: sel ? C.accent : 'transparent', color: sel ? '#fff' : (isAns ? C.good : C.sub), fontWeight: sel || isAns ? 800 : 500 }}>{c}</button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, flex: 1, alignItems: 'center' }}>
                      <input value={answers[q.num] ?? ''} onChange={e => setAns(q.num, e.target.value)} disabled={showMark} inputMode="numeric" placeholder="단답"
                        style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '5px 8px', borderRadius: 5, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 13 }} />
                      {showMark && <span style={{ fontSize: 11.5, color: C.good, whiteSpace: 'nowrap' }}>{q.answer}</span>}
                    </div>
                  )}
                  {showMark && (wrong ? <XCircle size={14} color={C.bad} /> : <CheckCircle size={14} color={C.good} />)}
                </div>
              );
            })}
          </div>
          <div style={{ padding: 12, borderTop: C.line, background: 'rgba(0,0,0,0.2)' }}>
            {!result ? (
              <button onClick={grade} style={{ width: '100%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                제출 · 채점 + 취약분석
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={reviewAllWeak} disabled={hintNums.length === 0} style={{ flex: 2, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>✨ 해설 풀기</button>
                <button onClick={() => { setResult(null); setAnswers({}); }} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: C.text, border: C.line, borderRadius: 10, padding: '11px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>다시</button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ② 취약분석 모달 */}
      {result && !review && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 900, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 12px', overflow: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 620, background: C.bg, border: C.line, borderRadius: 18, padding: 22 }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 13, color: C.sub }}>{exam.title}</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 6 }}>{result.score}점</div>
              <div style={{ color: C.sub, fontSize: 14 }}>{result.correct}/{result.total} 정답 · 추정 {gradeOf(result.score)}등급</div>
            </div>
            {result.wrong.length > 0 ? (
              <>
                <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: C.bad, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><XCircle size={15} /> 틀린 문항 {result.wrong.length}개</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {result.wrong.map(q => (
                      <span key={q.num} onClick={() => hintNums.includes(q.num) && startReview([q.num])}
                        style={{ fontSize: 13, fontWeight: 700, padding: '4px 9px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: hintNums.includes(q.num) ? C.gold : C.text, cursor: hintNums.includes(q.num) ? 'pointer' : 'default', border: hintNums.includes(q.num) ? '1px solid rgba(251,191,36,0.4)' : 'none' }}>
                        {q.num}번{hintNums.includes(q.num) ? ' ✨' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: C.gold, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={15} /> 취약 유형 (집중 보강 추천)</div>
                  {result.weakTypes.slice(0, 6).map(([type, nums]) => (
                    <div key={type} style={{ fontSize: 13.5, padding: '5px 0', borderBottom: C.line }}>
                      <b style={{ color: C.bad }}>{nums.join(', ')}번</b> · {type} <span style={{ color: C.sub }}>({nums.length}문제)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: C.good, fontWeight: 700, margin: '10px 0 18px' }}>🎉 전부 정답! 완벽합니다.</div>
            )}
            <button onClick={reviewAllWeak} disabled={hintNums.length === 0}
              style={{ width: '100%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Sparkles size={18} /> 취약·킬러 문항 단계별 해설 풀기
            </button>
            <p style={{ color: C.sub, fontSize: 12, textAlign: 'center', margin: '8px 0 0' }}>틀린 문항·킬러문항을 한 문제씩 PCBSA 단계별로 풀이합니다.</p>
            <button onClick={() => { setResult(null); setAnswers({}); window.scrollTo({ top: 0 }); }}
              style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.06)', color: C.text, border: C.line, borderRadius: 10, padding: '10px', fontWeight: 700, cursor: 'pointer' }}>다시 풀기</button>
          </div>
        </div>
      )}

      {/* ③ 해설 풀이 — 따로 문제가 나와서 풀이되는 풀스크린 구조 */}
      {review && (() => {
        const num = review.list[review.idx];
        const q = exam.questions.find(x => x.num === num);
        const hint = getMockHint(examId, num);
        return (
          <div style={{ position: 'fixed', inset: 0, background: C.bg, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: C.line }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 800, color: C.gold, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={16} /> {num}번 문항 해설</span>
                <span style={{ color: C.sub, fontSize: 12.5 }}>{q?.type}</span>
                <span style={{ color: C.sub, fontSize: 12 }}>· {review.idx + 1}/{review.list.length}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowSheet(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: C.line, color: C.text, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12.5 }}>
                  <FileText size={14} /> 시험지
                </button>
                <button onClick={() => { setReview(null); setShowSheet(false); }} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={22} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', minHeight: 0 }}>
              {showSheet && (
                <div style={{ width: '40%', maxWidth: 460, borderRight: C.line, overflow: 'auto', padding: 10, background: '#0f172a' }}>
                  <div style={{ color: C.sub, fontSize: 12, marginBottom: 8 }}>시험지 — {num}번 문항을 찾아보세요</div>
                  {pages.map((src, i) => (
                    <img key={i} src={src} alt={`${i + 1}p`} loading="lazy" style={{ width: '100%', borderRadius: 6, background: '#fff', marginBottom: 8 }} />
                  ))}
                </div>
              )}
              <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
                {hint ? (
                  <HintPlayerRouter data={hint} showQA={false} geminiTts={false} />
                ) : (
                  <div style={{ padding: 24, color: C.sub }}>이 문항의 해설은 준비 중입니다.</div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderTop: C.line }}>
              <button onClick={() => setReview(r => ({ ...r, idx: Math.max(0, r.idx - 1) }))} disabled={review.idx === 0}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: C.line, color: review.idx === 0 ? C.sub : C.text, borderRadius: 10, padding: '11px', fontWeight: 700, cursor: review.idx === 0 ? 'default' : 'pointer' }}>
                <ChevronLeft size={16} /> 이전
              </button>
              {review.idx < review.list.length - 1 ? (
                <button onClick={() => setReview(r => ({ ...r, idx: r.idx + 1 }))}
                  style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 800, cursor: 'pointer' }}>
                  다음 문제 <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={() => { setReview(null); setShowSheet(false); }}
                  style={{ flex: 2, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontWeight: 800, cursor: 'pointer' }}>
                  ✓ 해설 완료
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
