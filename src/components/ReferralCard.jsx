// 🎟️ 친구초청 카드 — 내 쿠폰코드 + 공유링크 + 맘카페 문구 + 추천 진행도(3명=다음학기 예상문제).
import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { ensureMyCode, syncMyStats, getMyCodeCached, buildShareUrl, getProgress, isRefereeBonus, REFERRALS_PER_SET } from '@/lib/referral';

function studentName() {
  try {
    const u = JSON.parse(localStorage.getItem('mentos_mock_user') || 'null');
    return u?.name || null;
  } catch { return null; }
}

export default function ReferralCard() {
  const [code, setCode] = useState(getMyCodeCached());
  const [prog, setProg] = useState(getProgress());
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await ensureMyCode(studentName());
      if (alive && c) setCode(c);
      await syncMyStats();
      if (alive) { setProg(getProgress()); setCode(getMyCodeCached()); }
    })();
    return () => { alive = false; };
  }, []);

  const shareUrl = buildShareUrl(code);
  const promo = `[멘토스] 우리 아이 학교 내신 예상문제 지금 무료예요! 친구 초대코드 [${code || '...'}] 넣고 가입하면 둘 다 예상문제 보너스 받아요 👇\n${shareUrl}`;

  const copy = (text, tag) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(''), 1800);
    } catch { /* noop */ }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(236,72,153,0.12), rgba(124,58,237,0.12))',
        border: '1px solid rgba(236,72,153,0.28)', borderRadius: 20,
        padding: '1.05rem 1.15rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.7rem' }}>
        <Gift size={18} color="#f472b6" />
        <b style={{ color: '#f8fafc', fontSize: '1rem' }}>친구 초대하고 다음 학기 예상문제 받기</b>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 0.8rem', lineHeight: 1.5 }}>
        친구가 내 코드로 가입하면 <b style={{ color: '#f9a8d4' }}>둘 다 보상</b> — 나는 <b>무료기간 +1주</b>,
        친구는 <b>예상문제 보너스</b>. <b style={{ color: '#f9a8d4' }}>친구 {REFERRALS_PER_SET}명</b>이면 <b>다음 학기 예상문제 1세트</b>를 받아요!
      </p>

      {/* 내 코드 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '0.7rem' }}>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '1.25rem', fontWeight: 900, letterSpacing: 2,
            color: '#fff', background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '0.4rem 0.9rem',
          }}
        >
          {code || '· · · · · ·'}
        </div>
        <button type="button" onClick={() => copy(code, 'code')} style={btn}>
          {copied === 'code' ? <Check size={14} /> : <Copy size={14} />} 코드 복사
        </button>
        <button type="button" onClick={() => copy(shareUrl, 'link')} style={btn}>
          {copied === 'link' ? <Check size={14} /> : <Copy size={14} />} 링크 복사
        </button>
        <button type="button" onClick={() => copy(promo, 'promo')} style={{ ...btn, background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>
          {copied === 'promo' ? <Check size={14} /> : <Gift size={14} />} 맘카페 문구 복사
        </button>
      </div>

      {/* 진행도 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Users size={15} color="#94a3b8" />
        <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 700 }}>
          초대한 친구 {prog.count}명 · 쿠폰 {prog.coupons}장 · 무료 +{prog.bonusWeeks}주
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: '#94a3b8' }}>
          {prog.sets > 0 && `예상문제 ${prog.sets}세트 획득 · `}다음 세트까지 {prog.toNextSet}명
        </span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
        <div style={{ width: `${(prog.inSet / REFERRALS_PER_SET) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#ec4899,#a855f7)', transition: 'width .5s' }} />
      </div>

      {isRefereeBonus() && (
        <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: 8 }}>🎁 초대 보상 적용됨 — 무료기간 +2주!</div>
      )}
    </div>
  );
}

const btn = {
  display: 'flex', alignItems: 'center', gap: 4,
  background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 9, padding: '0.4rem 0.7rem', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
};
