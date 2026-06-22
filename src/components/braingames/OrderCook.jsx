// 🍳 요리 순서 맞추기 — 좋아하는 음식 고르기 → 만드는 순서 보여주기 → 섞은 뒤 순서 복원.
// 기억력 + 과정 이해력. (장면은 이모지+라벨 카드 MVP, 추후 일러스트로 업그레이드 가능)
import { useState, useEffect } from 'react';
import { RotateCcw, Check, Undo2 } from 'lucide-react';
import { award } from '@/lib/rewards';
import { celebrate } from '@/lib/celebrate';

const FOODS = [
  { name: '김밥', emoji: '🍙', steps: [
    { e: '🥕🍚', t: '재료 준비 (당근·밥·참기름)' }, { e: '🍙', t: '김 위에 밥 펴기' }, { e: '🌯', t: '재료 넣고 돌돌 말기' }, { e: '🔪', t: '한 입 크기로 썰기' }, { e: '🍽️', t: '접시에 담기' },
  ] },
  { name: '라면', emoji: '🍜', steps: [
    { e: '💧', t: '물 끓이기' }, { e: '🍜', t: '면 넣기' }, { e: '🧂', t: '스프 넣기' }, { e: '🥚', t: '계란 풀기' }, { e: '🥣', t: '그릇에 담기' },
  ] },
  { name: '샌드위치', emoji: '🥪', steps: [
    { e: '🍞', t: '빵 깔기' }, { e: '🧈', t: '소스 바르기' }, { e: '🥬🧀', t: '야채·치즈 올리기' }, { e: '🍞', t: '빵 덮기' }, { e: '🔪', t: '반으로 자르기' },
  ] },
  { name: '피자', emoji: '🍕', steps: [
    { e: '🫓', t: '도우 펴기' }, { e: '🍅', t: '소스 바르기' }, { e: '🧀', t: '치즈 뿌리기' }, { e: '🥓🫑', t: '토핑 올리기' }, { e: '🔥', t: '오븐에 굽기' },
  ] },
];
const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export default function OrderCook({ onWin }) {
  const [food, setFood] = useState(null);
  const [phase, setPhase] = useState('pick'); // pick | show | solve | done
  const [order, setOrder] = useState([]);      // 섞인 표시 순서(정답 인덱스 배열)
  const [mySeq, setMySeq] = useState([]);       // 내가 누른 정답 인덱스 순서
  const [countdown, setCountdown] = useState(0);

  const pickFood = (f) => { setFood(f); setPhase('show'); setCountdown(Math.ceil(4)); };

  // 보여주기 단계: 카운트다운 후 섞어서 풀이로
  useEffect(() => {
    if (phase !== 'show') return;
    if (countdown <= 0) { setOrder(shuffle(food.steps.map((_, i) => i))); setMySeq([]); setPhase('solve'); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, countdown, food]);

  const N = food ? food.steps.length : 0;

  const tapCard = (idx) => {
    if (phase !== 'solve' || mySeq.includes(idx)) return;
    const next = [...mySeq, idx];
    setMySeq(next);
    if (next.length === N) {
      const ok = next.every((v, k) => v === k);
      if (ok) {
        setPhase('done');
        try { award({ xp: 25, coins: 12 }); } catch { /* noop */ }
        celebrate({ type: 'game', emoji: food.emoji, title: `${food.name} 완성!`, subtitle: '+12 코인 · 순서 기억 최고!' });
        onWin?.();
      } else {
        setTimeout(() => setMySeq([]), 700); // 틀리면 초기화
      }
    }
  };
  const undo = () => setMySeq((s) => s.slice(0, -1));
  const restart = () => { setFood(null); setPhase('pick'); setMySeq([]); };

  // ── 음식 고르기 ──
  if (phase === 'pick') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem', padding: '1.4rem 1rem' }}>
        <div className="bg-title" style={{ fontSize: '1.45rem' }}>🍳 요리 순서 맞추기</div>
        <div className="glass-card" style={{ padding: '0.6rem 1rem', color: '#f1f5f9', fontSize: '0.84rem' }}>좋아하는 음식을 고르면, 만드는 순서를 보여줄게요!</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {FOODS.map((f) => (
            <button key={f.name} className="candy" onClick={() => pickFood(f)} style={{ width: 130, padding: '1rem', color: '#7c2d12', background: 'linear-gradient(135deg,#fff7ed,#fed7aa)', fontSize: '1rem', fontWeight: 800 }}>
              <div style={{ fontSize: '2.4rem' }}>{f.emoji}</div>{f.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 순서 보여주기 ──
  if (phase === 'show') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', padding: '1.2rem 1rem' }}>
        <div className="bg-title" style={{ fontSize: '1.3rem' }}>{food.emoji} {food.name} 만드는 순서 — 기억하세요! ({countdown})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
          {food.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '0.6rem 0.9rem', color: '#fff', animation: `bounceIn .35s ${i * 0.1}s both` }}>
              <span style={{ fontWeight: 900, color: '#fcd34d', fontFamily: 'var(--num)', fontSize: '1.2rem' }}>{i + 1}</span>
              <span style={{ fontSize: '1.8rem' }}>{s.e}</span>
              <span style={{ fontSize: '0.9rem' }}>{s.t}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 순서 복원 / 완료 ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <div className="bg-title" style={{ fontSize: '1.3rem' }}>{food.emoji} {food.name} — 순서대로 눌러요!</div>

      {/* 내가 누른 순서 */}
      <div style={{ display: 'flex', gap: 6, minHeight: 30 }}>
        {Array.from({ length: N }).map((_, k) => (
          <div key={k} style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--num)', fontWeight: 800, color: '#0f172a', background: mySeq[k] != null ? '#fcd34d' : 'rgba(255,255,255,0.15)' }}>
            {mySeq[k] != null ? k + 1 : ''}
          </div>
        ))}
      </div>

      {/* 섞인 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, 96px)', gap: 10, justifyContent: 'center' }}>
        {order.map((idx) => {
          const picked = mySeq.includes(idx);
          const s = food.steps[idx];
          return (
            <button key={idx} onClick={() => tapCard(idx)} disabled={picked || phase === 'done'}
              style={{ width: 96, padding: '0.7rem 0.4rem', borderRadius: 14, border: 'none', cursor: picked ? 'default' : 'pointer', background: picked ? 'rgba(52,211,153,0.25)' : '#fff', color: '#7c2d12', boxShadow: '0 4px 0 rgba(0,0,0,0.2)', opacity: picked ? 0.5 : 1 }}>
              <div style={{ fontSize: '1.7rem' }}>{s.e}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: 2 }}>{s.t}</div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.7rem' }}>
        {phase === 'solve' && <button className="candy" onClick={undo} disabled={!mySeq.length} style={ctrl}><Undo2 size={15} /> 되돌리기</button>}
        <button className="candy" onClick={restart} style={ctrl}><RotateCcw size={15} /> 다른 음식</button>
      </div>

      {phase === 'done' && (
        <div className="glass-card" style={{ padding: '0.8rem 1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .3s both' }}>
          <Check size={18} color="#fcd34d" /> <b>{food.name} 순서 완성! +12 코인</b>
        </div>
      )}
    </div>
  );
}

const ctrl = { display: 'flex', alignItems: 'center', gap: 5, padding: '0.55rem 0.95rem', fontSize: '0.85rem', color: '#fff', background: 'rgba(255,255,255,0.16)', borderRadius: 13, boxShadow: '0 4px 0 rgba(0,0,0,0.2)' };
