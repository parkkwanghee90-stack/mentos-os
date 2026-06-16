import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search, Lock, Sparkles, CheckCircle, X, Share2, Gift } from 'lucide-react';
import { MathText } from '@/components/MathProblemRenderer';
import ClassroomBoard from '@/components/hints/ClassroomBoard';
import PaymentCheckoutModal from '@/components/PaymentCheckoutModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/services/supabaseClient';
import { isTrulyPaid } from '@/lib/freeEvent';
import BUNDLE from '@/data/exam_predict/exam_predict_bundle.json';
import GO2_BUNDLE from '@/data/exam_predict_go2/exam_predict_bundle.json';

// 학년별 번들·과목 라벨
const GRADE_META = {
  go1: { bundle: BUNDLE, label: '고1', subject: '공통수학1', title: '전국 고1 1학기 기말' },
  go2: { bundle: GO2_BUNDLE, label: '고2', subject: '수학Ⅰ', title: '전국 고2 1학기 기말' },
};

// 마스터/QA/관리자/슈퍼패스 계정은 결제 없이 전 학교 열람(검수용).
function isMasterViewer(user) {
  try {
    if (localStorage.getItem('mentos_super_pass') === 'true') return true;
    if (localStorage.getItem('mentos_admin_verified') === 'true') return true;
    if (isTrulyPaid()) return true;
  } catch { /* localStorage 차단 */ }
  return user?.role === 'admin';
}

// 학생 모집 정책(2026-06): 로그인 학생은 학교별 1회차(20문항)를 무료로 푼다. 2·3회차는 유료.
//  - '학생' = 로그인 + 역할이 학부모/관리자가 아님(가입 기본값 학생, 역할 미설정도 학생 취급).
//  - 관리자/마스터는 isMasterViewer 로 이미 전체 열람.
function isStudent(user) {
  return !!user?.id && user.role !== 'parent' && user.role !== 'admin';
}
const FREE_ROUNDS_FOR_STUDENT = 1;

/**
 * 전국 고1 1학기 기말 예상문제 코스.
 * - 학교별 출제경향 "분석"은 무료 공개(미리보기) → 구매 욕구 유발.
 * - "예상문제 3회(회당 20문항)"는 유료(학교당 5,000원). 탭 → 결제 모달.
 *
 * 권한(구매 여부): 현재는 localStorage(mentos_school_pass) 기반 임시 처리.
 *   실제 과금/권한은 백엔드(payapp plan 'exam_school' + feedback 웹훅 + school_pass 테이블)에서
 *   확정해야 함 — 결제 성공 시 이 slug 를 저장하도록 연동 예정.
 */
const PASS_KEY = 'mentos_school_pass';
// owned: Map<school_slug, 열람가능 회차수>. localStorage(구버전 slug 배열)는 전체(3회)로 간주.
function ownedSchools() {
  try { return new Map((JSON.parse(localStorage.getItem(PASS_KEY) || '[]')).map(s => [s, 3])); } catch { return new Map(); }
}

// 결제 모드별 권한(엔타이틀먼트). 구매당 슬롯: { primary, mode:'A'|'B', secondary? }
//  - A(내 학교 집중): primary 3회차 전부
//  - B(다양화): primary 2회차 + secondary 2회차
const ENT_KEY = 'mentos_exam_entitlements';
function loadEntitlements() {
  try { return JSON.parse(localStorage.getItem(ENT_KEY) || '[]'); } catch { return []; }
}
// slug 의 열람 가능 회차 수 (master=전체, owned=구버전 전체권한)
function unlockedRoundsFor(slug, { master, entitlements, owned }) {
  if (master) return 99;
  for (const e of (entitlements || [])) {
    if (e.primary === slug) return e.mode === 'A' ? 3 : 2;
    if (e.mode === 'B' && e.secondary === slug) return 2;
  }
  if (owned && owned.has(slug)) return owned.get(slug) ?? 3;
  return 0;
}

const stars = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

// SEO: 학교 상세 진입 시 문서 head(title·description·OG·canonical)를 동적으로 갱신.
const DEFAULT_TITLE = '수학의빛 — 학교별 기말 수학 예상문제 (고1·고2)';
function setMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

const C = {
  bg: '#0b1020', card: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  text: '#e5e7eb', sub: '#94a3b8', accent: '#3b82f6', gold: '#fbbf24',
};

// 예상문제 단톡방(카카오 오픈채팅) — 학생 모집·무료 배포 안내 채널
const KAKAO_OPENCHAT = 'https://open.kakao.com/o/gPzODQzi';
// 카톡 오픈채팅 입장 버튼(노란 카카오 브랜드). full=true면 가로 꽉 채움.
function KakaoJoin({ full = false, label = '예상문제 단톡방 입장 (무료 배포·질문)' }) {
  return (
    <a href={KAKAO_OPENCHAT} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : 'auto', boxSizing: 'border-box',
        background: '#FEE500', color: '#3C1E1E', fontWeight: 800, fontSize: 14.5,
        borderRadius: 14, padding: '13px 18px', textDecoration: 'none', cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(254,229,0,0.25)' }}>
      <span style={{ fontSize: 17 }}>💬</span> {label}
    </a>
  );
}

function UnitBars({ unitShare }) {
  const top = (unitShare || []).slice(0, 5);
  const palette = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {top.map((u, i) => (
        <div key={u.unit} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span style={{ width: 92, color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.unit}</span>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${u.percent}%`, height: '100%', background: palette[i % palette.length], borderRadius: 4 }} />
          </div>
          <span style={{ width: 36, textAlign: 'right', color: C.text }}>{u.percent}%</span>
        </div>
      ))}
    </div>
  );
}

function ProblemCard({ p, locked }) {
  const [show, setShow] = useState(false);
  const ansLabel = (typeof p.answer === 'number' && p.answer >= 1 && p.answer <= 5) ? ['①', '②', '③', '④', '⑤'][p.answer - 1] : null;
  return (
    <div style={{ background: C.card, border: C.border, borderRadius: 14, padding: 16, position: 'relative', filter: locked ? 'blur(5px)' : 'none', userSelect: locked ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>{p.num}.</span>
        <span style={{ fontSize: 11, color: C.sub, background: 'rgba(255,255,255,0.06)', padding: '1px 8px', borderRadius: 999 }}>{p.unit}</span>
        <span style={{ fontSize: 11, color: p.type === '서술형' ? C.gold : C.sub }}>{p.type}</span>
      </div>
      <div style={{ color: C.text, fontSize: 15, lineHeight: 1.6 }}><MathText text={p.latex} /></div>
      {Array.isArray(p.choices) && p.choices.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 10 }}>
          {p.choices.map((c, i) => (
            <span key={i} style={{ color: C.sub, fontSize: 14 }}>{['①', '②', '③', '④', '⑤'][i]} <MathText text={c} /></span>
          ))}
        </div>
      )}
      {!locked && (
        <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
          <button onClick={() => setShow(s => !s)} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            {show ? '▲ 해설 닫기' : '▼ 정답 · AVS 해설 보기'}
          </button>
          {show && (
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.7 }}>
              <div style={{ color: '#10b981', fontWeight: 700, marginBottom: 10 }}>
                정답: {ansLabel ? `${ansLabel} ` : ''}<MathText text={String(p.answer ?? '')} />
              </div>
              {Array.isArray(p.avs) && p.avs.length > 0 ? (
                // 내신 코스와 동일한 녹색 칠판(백묵 손글씨) AVS 플레이어
                <ClassroomBoard steps={p.avs} answer={ansLabel ? `${ansLabel} (${p.answer})` : String(p.answer ?? '')} />
              ) : (p.solution && (
                <div style={{ color: C.text, opacity: 0.9, whiteSpace: 'pre-wrap' }}>
                  <MathText text={p.solution} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 결제 모드(A/B) 선택 + (B) 추가 학교 고르기 → 결제로 진행
function PurchaseOptions({ school, schools, price, onConfirm, onClose }) {
  const others = schools.filter(s => s.slug !== school.slug);
  const sameRegion = others.filter(s => s.region && s.region === school.region);
  const recommended = [...sameRegion, ...others.filter(s => !sameRegion.includes(s))];
  const [mode, setMode] = useState('B');
  const [secondary, setSecondary] = useState(recommended[0]?.slug || '');
  const canPay = mode === 'A' || (mode === 'B' && secondary);
  const card = (active) => ({
    width: '100%', textAlign: 'left', marginTop: 10, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
    border: active ? '2px solid #3b82f6' : C.border, background: active ? 'rgba(59,130,246,0.12)' : C.card, color: C.text,
  });
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#0f1530', border: C.border, borderRadius: '20px 20px 0 0', padding: 20, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>구매 옵션 선택</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <p style={{ color: C.sub, fontSize: 13, margin: '0 0 8px' }}>같은 5,000원, 원하는 구성을 고르세요.</p>
        <button onClick={() => setMode('A')} style={card(mode === 'A')}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>📘 내 학교 집중</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{school.school} 예상문제 <b style={{ color: C.text }}>3회 · 60문항</b></div>
        </button>
        <button onClick={() => setMode('B')} style={card(mode === 'B')}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>🎯 다양화 <span style={{ color: C.gold, fontSize: 12 }}>추천</span></div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>내 학교 <b style={{ color: C.text }}>2회</b> + 다른 학교 <b style={{ color: C.text }}>2회</b> · 총 80문항</div>
        </button>
        {mode === 'B' && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: C.sub, fontSize: 12, marginBottom: 6 }}>추가로 풀 학교 <span style={{ opacity: 0.7 }}>(해당 학교 출제경향 기반)</span></div>
            <select value={secondary} onChange={e => setSecondary(e.target.value)} style={{ width: '100%', background: C.card, border: C.border, borderRadius: 12, padding: '12px 14px', color: C.text, fontSize: 15, appearance: 'none' }}>
              {recommended.map(s => <option key={s.slug} value={s.slug} style={{ color: '#111' }}>{s.school}{s.region ? ` (${s.region})` : ''}</option>)}
            </select>
          </div>
        )}
        <button disabled={!canPay} onClick={() => onConfirm(mode, mode === 'B' ? secondary : null)}
          style={{ width: '100%', marginTop: 18, padding: 16, borderRadius: 14, border: 'none', cursor: canPay ? 'pointer' : 'default', opacity: canPay ? 1 : 0.5, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 800 }}>
          이 구성으로 결제 — {price.toLocaleString()}원
        </button>
      </div>
    </div>
  );
}

export default function ExamPredictCourse() {
  const navigate = useNavigate();
  const params = useParams(); // /class/exam-predict/:grade/:slug (SEO 경로)
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [showPay, setShowPay] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [payMeta, setPayMeta] = useState(null); // { mode, primary, secondary }
  const [owned, setOwned] = useState(() => ownedSchools());
  const [entitlements] = useState(loadEntitlements);
  const [roundIdx, setRoundIdx] = useState(0);
  const [grade, setGrade] = useState('go1'); // 고1/고2 토글
  const gm = GRADE_META[grade];
  const master = isMasterViewer(user);

  // 학교가 바뀌면 1회차로 초기화
  useEffect(() => { setRoundIdx(0); }, [selected?.slug]);

  // 구매 권한: 로그인 사용자의 school_pass 조회
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('school_pass').select('school_slug, rounds').eq('user_id', user.id)
      .then(({ data }) => { if (data) setOwned(new Map(data.map(r => [r.school_slug, r.rounds ?? 3]))); })
      .catch(() => { /* 비로그인/오프라인 시 localStorage 폴백 유지 */ });
  }, [user?.id]);

  // 공유 딥링크 처리: ?grade=&school=<slug> 로 들어오면 해당 학교 자동 선택, ?ref=<uid> 는 추천 저장.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const ref = sp.get('ref');
      if (ref) localStorage.setItem('mentos_exam_ref', ref);
      const g = sp.get('grade');
      if (g && GRADE_META[g]) setGrade(g);
      const slug = sp.get('school');
      if (slug) {
        const b = GRADE_META[g && GRADE_META[g] ? g : 'go1'].bundle;
        const s = (b.schools || []).find(x => x.slug === slug)
          || (GO2_BUNDLE.schools || []).find(x => x.slug === slug)
          || (BUNDLE.schools || []).find(x => x.slug === slug);
        if (s) {
          if ((GO2_BUNDLE.schools || []).some(x => x.slug === slug)) setGrade('go2');
          else if ((BUNDLE.schools || []).some(x => x.slug === slug)) setGrade('go1');
          setSelected(s);
        }
      }
    } catch { /* URL/스토리지 차단 무시 */ }
  }, []);

  // SEO 경로 /class/exam-predict/:grade/:slug 진입 시 해당 학교 자동 선택.
  useEffect(() => {
    const ps = params.slug;
    if (!ps) return;
    const decoded = (() => { try { return decodeURIComponent(ps); } catch { return ps; } })();
    const inGo2 = (GO2_BUNDLE.schools || []).some(x => x.slug === decoded);
    const inGo1 = (BUNDLE.schools || []).some(x => x.slug === decoded);
    const g = inGo2 ? 'go2' : inGo1 ? 'go1' : (GRADE_META[params.grade] ? params.grade : 'go1');
    const s = (GRADE_META[g].bundle.schools || []).find(x => x.slug === decoded);
    if (s) {
      setGrade(g); setSelected(s);
      // 추천 링크(?ref=)로 들어왔으면 추천인·대상학교 저장 → 가입 후 보상 RPC 호출.
      try {
        const ref = new URLSearchParams(window.location.search).get('ref');
        if (ref) { localStorage.setItem('mentos_exam_ref', ref); localStorage.setItem('mentos_exam_ref_school', s.slug); }
      } catch { /* 스토리지 차단 */ }
    }
  }, [params.grade, params.slug]);

  // 추천 보상: 추천 링크로 가입/로그인한 신규 유저면 추천인에게 해당 학교 2·3회차 해금.
  //   백엔드(grant_exam_referral RPC + exam_referral 테이블 + school_pass)가 배포돼야 실제 보상.
  //   미배포 시 RPC 에러는 조용히 무시하고 ref 를 남겨 다음 기회에 재시도.
  useEffect(() => {
    if (!user?.id) return;
    let ref, school;
    try { ref = localStorage.getItem('mentos_exam_ref'); school = localStorage.getItem('mentos_exam_ref_school'); } catch { return; }
    if (!ref || ref === user.id) return;
    supabase.rpc('grant_exam_referral', { p_referrer: ref, p_school: school || null })
      .then(({ error }) => { if (!error) { try { localStorage.removeItem('mentos_exam_ref'); localStorage.removeItem('mentos_exam_ref_school'); } catch { /* */ } } })
      .catch(() => { /* 백엔드 미배포 — 다음 기회에 재시도 */ });
  }, [user?.id]);

  // SEO: 학교 상세 진입 시 문서 head 동적 갱신, 목록 복귀/언마운트 시 기본값 복원.
  useEffect(() => {
    if (selected) {
      const m = GRADE_META[grade];
      const title = `${selected.school} 2025 1학기 기말 ${m.subject} 예상문제 | 수학의빛`;
      const desc = (selected.analysis?.summary || `${selected.school} 기출 분석과 AI 예상문제 3회.`).slice(0, 155);
      const url = `${window.location.origin}/class/exam-predict/${grade}/${encodeURIComponent(selected.slug)}`;
      document.title = title;
      setMetaTag('name', 'description', desc);
      setMetaTag('property', 'og:title', title);
      setMetaTag('property', 'og:description', desc);
      setMetaTag('property', 'og:url', url);
      setCanonical(url);
    } else {
      document.title = DEFAULT_TITLE;
    }
    return () => { document.title = DEFAULT_TITLE; };
  }, [selected, grade]);

  // 학교별 공유: 네이티브 공유시트(카카오톡·인스타 등) → 폴백 클립보드 복사.
  const shareSchool = (s) => {
    const ref = user?.id ? `?ref=${user.id}` : '';
    const url = `${window.location.origin}/class/exam-predict/${grade}/${encodeURIComponent(s.slug)}${ref}`;
    const title = `${s.school} 기말 수학 예상문제`;
    const text = `${s.school} 2025 1학기 기말 ${gm.subject} 예상문제 — 1회차 무료로 풀어보기! 🎯`;
    if (navigator.share) { navigator.share({ title, text, url }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(url).then(() => alert('공유 링크를 복사했어요. 친구에게 붙여넣어 보내세요!')); }
    else { window.prompt('아래 링크를 복사해 공유하세요', url); }
  };

  const schools = gm.bundle.schools || [];
  const filtered = useMemo(() => {
    const k = q.trim();
    if (!k) return schools;
    return schools.filter(s => s.school.includes(k) || (s.region || '').includes(k));
  }, [q, schools]);

  // 학교 상세
  if (selected) {
    const paidUnlocked = unlockedRoundsFor(selected.slug, { master, entitlements, owned }); // 결제/마스터로 열린 회차 수
    const studentFree = isStudent(user) ? FREE_ROUNDS_FOR_STUDENT : 0; // 로그인 학생 무료 회차(1회차)
    const unlocked = Math.max(paidUnlocked, studentFree);             // 실제 열람 가능 회차 수
    const hasAccess = paidUnlocked > 0;                               // 결제(또는 마스터) 보유 여부 → 결제 CTA 노출 판단
    const rounds = selected.rounds || [];
    const curIdx = Math.min(roundIdx, Math.max(0, rounds.length - 1));
    const problems = rounds[curIdx]?.problems || [];
    const FREE = 1; // 비로그인/비학생 맛보기 무료 문항 수 (그 외는 잠금)
    const payPreset = payMeta?.mode === 'A'
      ? { badge: '내 학교 집중', title: `${selected.school} 예상문제 3회`, subtitle: '예상문제 3회 · 총 60문항 + 정답·AVS 해설', priceText: `${selected.price.toLocaleString()}원`, noteText: '구매 즉시 3회분 전체 열람' }
      : { badge: '예상문제 다양화', title: `${selected.school} + 다른 학교`, subtitle: '내 학교 2회 + 다른 학교 2회 · 총 80문항', priceText: `${selected.price.toLocaleString()}원`, noteText: '구매 즉시 두 학교 열람' };
    const onConfirmOptions = (mode, secondary) => {
      setPayMeta({ mode, primary: selected.slug, secondary });
      setShowOptions(false);
      setShowPay(true);
    };
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '20px 16px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={18} /> 학교 목록
          </button>
          <button onClick={() => shareSchool(selected)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', background: 'rgba(250,204,21,0.16)', border: '1px solid rgba(250,204,21,0.4)', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
            <Share2 size={15} color={C.gold} /> 친구에게 공유
          </button>
        </div>

        {/* 무료 분석 블록 */}
        <div style={{ background: C.card, border: C.border, borderRadius: 20, padding: 22, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.accent, marginBottom: 4 }}>2025 1학기 기말 · {gm.subject}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px' }}>{selected.school}</h1>
          <div style={{ color: C.sub, fontSize: 13, marginBottom: 16 }}>{selected.region || ''}</div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
            <div><span style={{ color: C.sub, fontSize: 13 }}>난이도 </span><span style={{ color: C.gold }}>{stars(selected.analysis.difficulty_stars)}</span></div>
            <div><span style={{ color: C.sub, fontSize: 13 }}>변별력 </span><span style={{ color: C.gold }}>{stars(selected.analysis.discrimination_stars)}</span></div>
          </div>
          <UnitBars unitShare={selected.analysis.unit_share} />
          <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>{selected.analysis.summary}</p>
        </div>

        {/* 단톡방 입장 CTA */}
        <div style={{ marginBottom: 20 }}>
          <KakaoJoin full label={`${selected.school} 예상문제 단톡방 입장 💬`} />
          <div style={{ color: C.sub, fontSize: 12, textAlign: 'center', marginTop: 7 }}>시험 2주 전 예상문제 무료 배포 · 질문 받아요</div>
        </div>

        {/* 예상문제 헤더 + 회차 탭 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={18} color={C.accent} />
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>예상문제 <span style={{ color: C.sub, fontWeight: 400, fontSize: 14 }}>({problems.length}문항)</span></h2>
        </div>
        {rounds.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {rounds.map((r, i) => {
              const active = i === curIdx;
              const roundLocked = i >= unlocked; // 권한 회차 수 밖이면 잠금
              return (
                <button key={i} onClick={() => setRoundIdx(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
                    border: active ? 'none' : C.border, fontWeight: 700, fontSize: 14,
                    background: active ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : C.card,
                    color: active ? '#fff' : C.sub }}>
                  {roundLocked && <Lock size={12} />}{i + 1}회차
                </button>
              );
            })}
          </div>
        )}
        {/* 무료 1회 안내 배너 */}
        {!hasAccess && !master && (
          isStudent(user) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13.5, color: '#a7f3d0' }}>
              <Gift size={16} color="#10b981" /> <span><b style={{ color: '#fff' }}>1회차 20문항 무료</b> 체험 중! <button onClick={() => shareSchool(selected)} style={{ background: 'none', border: 'none', color: '#fbbf24', fontWeight: 800, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>친구에게 공유</button>하면 2·3회차도 무료로 열려요 🎁</span>
            </div>
          ) : (
            <div onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 13.5, color: '#bfdbfe', cursor: 'pointer' }}>
              <Gift size={16} color={C.accent} /> <span><b style={{ color: '#fff' }}>로그인하면 1회차 20문항 무료!</b> 지금 로그인하고 풀어보세요 →</span>
            </div>
          )
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {problems.map((p, i) => (
            <ProblemCard key={`${curIdx}-${p.id || i}`} p={p} locked={!(curIdx < unlocked) && !(curIdx === 0 && i < FREE)} />
          ))}
        </div>

        {/* 결제 CTA */}
        {!hasAccess && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(to top, #0b1020 60%, transparent)', display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setShowOptions(true)} style={{ width: '100%', maxWidth: 480, padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Lock size={18} /> {isStudent(user) ? '2·3회차' : '예상문제'} 잠금 해제 — {selected.price.toLocaleString()}원
            </button>
          </div>
        )}
        {showOptions && (
          <PurchaseOptions school={selected} schools={schools} price={selected.price}
            onConfirm={onConfirmOptions} onClose={() => setShowOptions(false)} />
        )}
        {showPay && payMeta && (
          <PaymentCheckoutModal plan="exam_school" preset={payPreset}
            meta={{ school: payMeta.primary, mode: payMeta.mode, secondary: payMeta.secondary || undefined }}
            onClose={() => setShowPay(false)} />
        )}
      </div>
    );
  }

  // 학교 목록 + 검색
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '20px 16px 60px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 12 }}>
        <ArrowLeft size={18} /> 대시보드
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px' }}>{gm.title} <span style={{ color: C.accent }}>예상문제</span></h1>
      <p style={{ color: C.sub, fontSize: 14, margin: '0 0 14px' }}>
        우리 학교 기출 분석 + AI 예상문제 3회. {isStudent(user)
          ? <b style={{ color: '#10b981' }}>학생은 1회차 무료!</b>
          : <b style={{ color: C.gold }}>로그인하면 1회차 무료!</b>} 내 학교를 검색하세요.
      </p>

      {/* 예상문제 단톡방 입장 */}
      <div style={{ marginBottom: 16 }}>
        <KakaoJoin full label="우리 학교 예상문제 단톡방 입장하기" />
      </div>

      {/* 고1 / 고2 토글 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {Object.entries(GRADE_META).map(([g, m]) => {
          const active = g === grade;
          return (
            <button key={g} onClick={() => { setGrade(g); setSelected(null); setShowPay(false); }}
              style={{ padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontWeight: 800, fontSize: 14,
                border: active ? 'none' : C.border, background: active ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)' : C.card,
                color: active ? '#fff' : C.sub }}>
              {m.label} <span style={{ fontWeight: 500, opacity: 0.85, fontSize: 12 }}>{m.subject}</span>
            </button>
          );
        })}
      </div>

      {/* 학교 드롭다운 (내 학교 빠른 선택) */}
      <select
        value={selected?.slug || ''}
        onChange={e => { const s = schools.find(x => x.slug === e.target.value); if (s) { setSelected(s); setShowPay(false); } }}
        style={{ width: '100%', background: C.card, border: C.border, borderRadius: 14, padding: '14px 16px', color: C.text, fontSize: 16, marginBottom: 12, appearance: 'none', cursor: 'pointer' }}
      >
        <option value="" style={{ color: '#111' }}>🔻 내 학교 선택…</option>
        {schools.map(s => (
          <option key={s.slug} value={s.slug} style={{ color: '#111' }}>{s.school}{s.region ? ` (${s.region})` : ''}</option>
        ))}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: C.border, borderRadius: 14, padding: '12px 16px', marginBottom: 18 }}>
        <Search size={18} color={C.sub} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="학교명 또는 지역 검색 (예: 풍산, 강남)"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: 15 }} />
      </div>

      <div style={{ color: C.sub, fontSize: 13, marginBottom: 10 }}>{filtered.length}개 학교</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {filtered.map(s => {
          const isOwned = unlockedRoundsFor(s.slug, { master, entitlements, owned }) > 0;
          return (
            <button key={s.slug} onClick={() => { setSelected(s); setShowPay(false); }}
              style={{ textAlign: 'left', background: C.card, border: C.border, borderRadius: 16, padding: 18, cursor: 'pointer', color: C.text }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.school}</div>
                  <div style={{ fontSize: 12, color: C.sub }}>{s.region || ' '}</div>
                </div>
                {isOwned
                  ? <CheckCircle size={20} color="#10b981" />
                  : isStudent(user)
                    ? <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800, background: 'rgba(16,185,129,0.14)', padding: '2px 8px', borderRadius: 999 }}>1회 무료</span>
                    : <span style={{ fontSize: 12, color: C.gold, fontWeight: 700 }}>{s.price.toLocaleString()}원</span>}
              </div>
              <div style={{ display: 'flex', gap: 12, margin: '10px 0', fontSize: 12 }}>
                <span style={{ color: C.sub }}>난이도 <span style={{ color: C.gold }}>{stars(s.analysis.difficulty_stars)}</span></span>
              </div>
              <div style={{ fontSize: 12, color: C.sub, display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
                {(s.analysis.top_units || []).slice(0, 3).map(u => <span key={u}>#{u}</span>)}
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: (isOwned || isStudent(user)) ? '#10b981' : C.accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                {isOwned ? '예상문제 풀기 →' : isStudent(user) ? '1회차 무료로 풀기 →' : <><Lock size={13} /> 예상문제 3회 잠금</>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
