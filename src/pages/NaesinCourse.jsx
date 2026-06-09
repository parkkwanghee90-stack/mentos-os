import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, BookOpen, Sparkles, Lock, Volume2, VolumeX } from 'lucide-react';
import { MathText } from '@/components/MathProblemRenderer';
import ClassroomBoard from '@/components/hints/ClassroomBoard';
import COURSE from '@/data/naesin_full.json';
import { useAuth } from '@/context/AuthContext';
import { speakText, stopSpeaking } from '@/services/ttsService';
import { isTrulyPaid } from '@/lib/freeEvent';
import NaesinPaywall from '@/components/NaesinPaywall';

// LaTeX → 한국어 음성용 정리 (ttsConfig.cleanNarration 이식)
function cleanForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/\$\$([^$]*)\$\$/g, ' $1 ').replace(/\$([^$]*)\$/g, ' $1 ')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, '$2 분의 $1')
    .replace(/\\sqrt\{([^}]*)\}/g, '루트 $1')
    .replace(/\\pm/g, '플러스 마이너스').replace(/\\times/g, ' 곱하기 ').replace(/\\div/g, ' 나누기 ')
    .replace(/\\leq|\\le/g, ' 이하 ').replace(/\\geq|\\ge/g, ' 이상 ').replace(/\\neq/g, ' 같지 않음 ')
    .replace(/\\cdot/g, ' 곱하기 ').replace(/\\alpha/g, '알파').replace(/\\beta/g, '베타').replace(/\\gamma/g, '감마')
    .replace(/\\omega/g, '오메가').replace(/\\implies|\\Rightarrow/g, ' 따라서 ')
    .replace(/\^\{?2\}?/g, ' 제곱 ').replace(/\^\{?3\}?/g, ' 세제곱 ').replace(/\^/g, ' 의 ')
    .replace(/[{}\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

const LEVELS = [
  { key: '필수', label: '기본 필수유형', sub: '3~5등급 → 무조건 3등급', color: '#10b981', icon: '🟢' },
  { key: '심화', label: '심화 실력', sub: '1~2등급 도전', color: '#ef4444', icon: '🔴' },
];
const circled = ['①', '②', '③', '④', '⑤'];

function normAns(s) { return String(s ?? '').replace(/\s/g, '').replace(/[①②③④⑤]/g, m => '12345'['①②③④⑤'.indexOf(m)]); }

// 문제 latex에서 본문과 보기(①~⑤)를 분리
function parseProblem(latex) {
  const norm = String(latex ?? '');
  const start = norm.search(/[①②③④⑤]/);
  const body = (start === -1 ? norm : norm.slice(0, start)).trim();
  const options = [];
  if (start !== -1) {
    const reg = /([①②③④⑤])\s*([^\n①②③④⑤]*)/g;
    let m;
    while ((m = reg.exec(norm.slice(start))) !== null) {
      options.push({ circle: m[1], value: (m[2] || '').trim() });
    }
  }
  return { body, options };
}

export default function NaesinCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // 내신은 유료 전용: 로그인(!!user)이나 무료이벤트(free_event)로는 열리지 않고, 실제 결제만 통과
  const isPaid = isTrulyPaid();

  const [level, setLevel] = useState('필수');
  const [unit, setUnit] = useState(null);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [graded, setGraded] = useState(null); // 'correct'|'wrong'|null
  const [showAVS, setShowAVS] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const speakAVS = () => {
    if (speaking) { try { stopSpeaking(); } catch {} try { audioRef.current?.pause(); } catch {} audioRef.current = null; setSpeaking(false); return; }
    const narration = (prob?.avs || []).map(s => typeof s === 'string' ? s : `${s.title || ''}. ${s.content || ''}`).join('. ');
    if (!narration) return;
    setSpeaking(true);
    const liveFallback = () => speakText(cleanForSpeech(narration), { isReplay: true, onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
    // 사전생성 Gemini 2.5 음성(mp3) 우선 재생, 없으면 라이브 Gemini로 폴백
    const base = import.meta.env.VITE_SUPABASE_URL;
    if (base && prob?.id) {
      const url = `${base}/storage/v1/object/public/mentos-assets/avs_tts/naesin/${prob.id}.mp3`;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { audioRef.current = null; setSpeaking(false); };
      audio.onerror = () => { audioRef.current = null; liveFallback(); };
      audio.play().catch(() => { audioRef.current = null; liveFallback(); });
    } else { liveFallback(); }
  };

  const units = COURSE.levels[level] || {};
  const unitNames = Object.keys(units).sort((a, b) => units[b].length - units[a].length);
  const problems = unit ? (units[unit] || []) : [];
  const prob = problems[idx];
  const parsed = useMemo(() => parseProblem(prob?.latex), [prob?.id, prob?.latex]);

  const [solved, setSolved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('naesin_solved') || '[]')); } catch { return new Set(); }
  });
  const markSolved = (id) => {
    const ns = new Set(solved); ns.add(id); setSolved(ns);
    localStorage.setItem('naesin_solved', JSON.stringify([...ns]));
  };

  const reset = () => { setInput(''); setGraded(null); setShowAVS(false); try { stopSpeaking(); } catch {} setSpeaking(false); };
  const openUnit = (u) => { setUnit(u); setIdx(0); reset(); };
  const go = (d) => { const n = idx + d; if (n >= 0 && n < problems.length) { setIdx(n); reset(); } };

  const grade = () => {
    if (!prob || !input.trim()) return;
    const ok = normAns(input) === normAns(prob.answer);
    setGraded(ok ? 'correct' : 'wrong');
    if (ok) markSolved(prob.id);
    setShowAVS(true); // 채점 후 AVS 공개
  };

  // 결제 게이트 — 선착순 100명 특가 19,900원 / 이후 50,000원 (NaesinPaywall)
  if (!isPaid) {
    return <NaesinPaywall title="고1 기말 내신 완벽대비 풀코스" subtitle="기본 필수유형 + 심화 실력 · 단원별 문제 + 자동채점 + AVS 칠판해설 + 복습" />;
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
            {/* 문제 본문 (보기 제외) */}
            <div style={{ fontSize: '1.05rem', lineHeight: 1.9, marginBottom: 18, color: '#f1f5f9', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word', maxWidth: '100%', overflowX: 'auto' }}>
              <MathText text={parsed.body} />
            </div>

            {/* 정답 입력 */}
            {prob.type === '객관식' ? (
              parsed.options.length >= 2 ? (
                /* 보기를 클릭 가능한 선택지로 — 보기번호 + 내용 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {parsed.options.map((opt, i) => {
                    const n = String(i + 1);
                    const sel = input === n;
                    return (
                      <button key={i} onClick={() => setInput(n)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer',
                        padding: '0.7rem 0.9rem', borderRadius: 12, color: '#f1f5f9',
                        border: `1px solid ${sel ? '#7c3aed' : 'rgba(255,255,255,0.15)'}`,
                        background: sel ? 'rgba(124,58,237,0.22)' : 'rgba(0,0,0,0.22)',
                      }}>
                        <span style={{ fontSize: '1.15rem', color: sel ? '#c4b5fd' : '#94a3b8', flexShrink: 0 }}>{opt.circle}</span>
                        <span style={{ fontSize: '1rem' }}>{opt.value ? <MathText text={opt.value} /> : null}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* 보기 파싱 실패(추출 손상) 시 ①~⑤ 번호 버튼 폴백 */
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {circled.map((c, i) => (
                    <button key={i} onClick={() => setInput(String(i + 1))}
                      style={{ ...choiceBtn, ...(input === String(i + 1) ? { background: '#7c3aed', borderColor: '#7c3aed' } : {}) }}>{c}</button>
                  ))}
                </div>
              )
            ) : (
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="정답 입력"
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.25)', color: '#fff', marginBottom: 14 }} />
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button style={btnPrimary} onClick={grade} disabled={!input.trim()}>채점하기</button>
              <button style={btnGhost} onClick={() => setShowAVS(s => !s)}>AVS 해설</button>
              <button style={{ ...btnGhost, marginLeft: 'auto' }} onClick={() => go(-1)} disabled={idx === 0}>← 이전</button>
              <button style={btnPrimary} onClick={() => go(1)} disabled={idx === problems.length - 1}>다음 문제 →</button>
            </div>

            {graded && (
              <div style={{ marginTop: 14, padding: '0.8rem 1rem', borderRadius: 12, background: graded === 'correct' ? '#10b98122' : '#ef444422', color: graded === 'correct' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                {graded === 'correct' ? <><CheckCircle size={16} /> 정답입니다!</> : <><XCircle size={16} /> 오답 · 정답: {prob.answer}</>}
              </div>
            )}

            {/* AVS 해설 — 교실 칠판 */}
            {showAVS && (
              <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, color: '#a78bfa' }}><Sparkles size={16} /> 사고력 AVS 해설</span>
                </div>
                {prob.avs && prob.avs.length ? (
                  <ClassroomBoard key={prob.id} steps={prob.avs} answer={prob.answer}
                    onSpeak={speakAVS} speaking={speaking} />
                ) : <p style={{ color: '#94a3b8' }}>이 문제의 AVS 해설은 준비 중입니다. (정답: {prob.answer})</p>}
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
