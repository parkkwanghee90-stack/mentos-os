// 🧠 두뇌게임 허브 (레벨 0 입문) — 성별 첫 추천 + 게임 카드. 공부 싫은 아이의 입구.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins } from 'lucide-react';
import '@/styles/brainGames.css';
import { orderedGames, getBrainPref, setBrainPref, getGame } from '@/lib/brainGames';
import { getRewards } from '@/lib/rewards';
import Game24 from '@/components/braingames/Game24';
import SpeedMath from '@/components/braingames/SpeedMath';
import Nonogram from '@/components/braingames/Nonogram';

const COMPONENTS = { g24: Game24, speed: SpeedMath, nono: Nonogram };

export default function BrainGames() {
  const navigate = useNavigate();
  const [pref, setPref] = useState(getBrainPref());
  const [active, setActive] = useState(null); // 게임 id
  const [coins, setCoins] = useState(getRewards().coins);

  const choosePref = (p) => { setBrainPref(p); setPref(p); };
  const refreshCoins = () => setCoins(getRewards().coins);

  // ── 1) 성별 첫 추천 선택 ─────────────────────────────
  if (!pref) {
    return (
      <div className="bg-zone bg-pink" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.6rem', padding: '2rem' }}>
        <div className="bg-deco" style={{ width: 120, height: 120, background: '#f472b6', top: '12%', left: '12%' }} />
        <div className="bg-deco" style={{ width: 90, height: 90, background: '#22d3ee', bottom: '16%', right: '14%', animationDelay: '1.5s' }} />
        <div>
          <div style={{ fontSize: '3rem' }}>🧠✨</div>
          <h1 className="bg-title" style={{ fontSize: '1.8rem', margin: '0.6rem 0 0.2rem' }}>두뇌 게임 시작!</h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem' }}>먼저, 어떤 게임이 더 끌려?<br />(언제든 다른 게임도 할 수 있어)</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%', maxWidth: 300 }}>
          <button className="candy" onClick={() => choosePref('girl')} style={{ ...prefBtn, background: 'linear-gradient(135deg,#f9a8d4,#ec4899)' }}>🧩 그림·퍼즐이 좋아</button>
          <button className="candy" onClick={() => choosePref('boy')} style={{ ...prefBtn, background: 'linear-gradient(135deg,#67e8f9,#22d3ee)', color: '#06343f' }}>⚡ 빠르고 짜릿한 게 좋아</button>
          <button className="candy" onClick={() => choosePref('all')} style={{ ...prefBtn, background: 'rgba(255,255,255,0.2)' }}>🎲 다 보여줘!</button>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--jua)', cursor: 'pointer' }}>나중에 할래</button>
      </div>
    );
  }

  // ── 2) 게임 플레이 화면 ──────────────────────────────
  if (active) {
    const game = getGame(active);
    const Comp = COMPONENTS[active];
    return (
      <div className={`bg-zone ${game.bg}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem' }}>
          <button onClick={() => { setActive(null); refreshCoins(); }} className="candy" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.5rem 0.9rem', color: '#fff', background: 'rgba(255,255,255,0.16)', borderRadius: 12, fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> 게임 목록
          </button>
          <span className="glass-card" style={{ padding: '0.4rem 0.9rem', color: '#fde68a', fontFamily: 'var(--num)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Coins size={16} /> {coins}
          </span>
        </div>
        <Comp onWin={refreshCoins} />
      </div>
    );
  }

  // ── 3) 게임 목록 허브 ────────────────────────────────
  const games = orderedGames();
  return (
    <div className="bg-zone bg-amber" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.1rem' }}>
        <button onClick={() => navigate('/dashboard')} className="candy" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.5rem 0.9rem', color: '#fff', background: 'rgba(255,255,255,0.16)', borderRadius: 12, fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> 홈
        </button>
        <span className="glass-card" style={{ padding: '0.4rem 0.9rem', color: '#fde68a', fontFamily: 'var(--num)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Coins size={16} /> {coins}
        </span>
      </div>

      <div style={{ textAlign: 'center', padding: '0.4rem 1rem 1.4rem' }}>
        <h1 className="bg-title" style={{ fontSize: '2rem', margin: 0 }}>🧠 두뇌 게임</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: 4 }}>놀면서 생각하는 힘이 자라요 · 이기면 코인 획득!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.1rem', maxWidth: 480, margin: '0 auto' }}>
        {games.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className="candy"
            style={{
              display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left',
              padding: '1.1rem 1.2rem', borderRadius: 24, color: '#fff',
              background: `linear-gradient(135deg, ${g.accent}cc, ${g.accent}77)`,
              animation: `bounceIn .4s ${i * 0.08}s both`,
            }}
          >
            <span style={{ fontSize: '2.6rem' }}>{g.emoji}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700 }}>{g.name}</span>
              <span style={{ display: 'block', fontSize: '0.85rem', opacity: 0.92 }}>{g.tagline}</span>
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.72rem', background: 'rgba(0,0,0,0.22)', borderRadius: 999, padding: '0.12rem 0.6rem' }}>🧠 {g.trains}</span>
            </span>
            <span style={{ fontSize: '1.6rem', opacity: 0.8 }}>▶</span>
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.4rem' }}>
        <button onClick={() => { setBrainPref(''); setPref(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--jua)', cursor: 'pointer', fontSize: '0.82rem' }}>
          추천 다시 고르기
        </button>
      </div>
    </div>
  );
}

const prefBtn = { padding: '1.1rem', fontSize: '1.1rem', color: '#fff', borderRadius: 20 };
