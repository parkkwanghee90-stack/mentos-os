// 🗺️ 약점 정복 맵 — 단원별 오답을 다시 맞히며 채워가는 정복 진행도.
// 데이터: wrongAnswerStore(단원·resolved). 오답을 정답 처리하면 진행바가 차고, 0개 남으면 정복!
import { useEffect, useState } from 'react';
import { Trophy, Target } from 'lucide-react';
import { getActiveWrongAnswers } from '@/services/wrongAnswerStore';
import { celebrateConquest } from '@/lib/celebrate';

const CELEBRATED_KEY = 'mentos_conquered_celebrated';
function celebrateNewConquests(units) {
  try {
    const done = new Set(JSON.parse(localStorage.getItem(CELEBRATED_KEY) || '[]'));
    let changed = false;
    units.filter((u) => u.conquered).forEach((u) => {
      if (!done.has(u.unit)) {
        done.add(u.unit);
        changed = true;
        celebrateConquest(u.unit);
      }
    });
    // 다시 오답이 생겨 정복이 풀리면 재축하 가능하도록 제거
    const conqueredNow = new Set(units.filter((u) => u.conquered).map((u) => u.unit));
    [...done].forEach((u) => { if (!conqueredNow.has(u)) { done.delete(u); changed = true; } });
    if (changed) localStorage.setItem(CELEBRATED_KEY, JSON.stringify([...done]));
  } catch { /* noop */ }
}

function buildUnits() {
  const wrongs = getActiveWrongAnswers();
  const byUnit = {};
  wrongs.forEach((w) => {
    const u = w.unit || '기타';
    if (!byUnit[u]) byUnit[u] = { unit: u, total: 0, resolved: 0 };
    byUnit[u].total++;
    if (w.resolved) byUnit[u].resolved++;
  });
  return Object.values(byUnit)
    .map((u) => ({
      ...u,
      remaining: u.total - u.resolved,
      pct: u.total ? Math.round((u.resolved / u.total) * 100) : 0,
      conquered: u.total > 0 && u.resolved === u.total,
    }))
    .sort((a, b) => (a.conquered - b.conquered) || (b.remaining - a.remaining));
}

export default function WeaknessConquestMap() {
  const [units, setUnits] = useState(buildUnits);

  useEffect(() => {
    celebrateNewConquests(units);
    const refresh = () => {
      const next = buildUnits();
      setUnits(next);
      celebrateNewConquests(next);
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const conquered = units.filter((u) => u.conquered).length;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18, padding: '1rem 1.1rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.8rem' }}>
        <Target size={18} color="#f87171" />
        <b style={{ color: '#f8fafc', fontSize: '0.98rem' }}>약점 정복 맵</b>
        {units.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '0.76rem', color: '#94a3b8' }}>
            {conquered} / {units.length} 단원 정복 🏆
          </span>
        )}
      </div>

      {units.length === 0 ? (
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '0.6rem 0' }}>
          아직 등록된 약점이 없어요. 문제를 풀면 틀린 단원이 자동으로 모여 정복 대상이 됩니다. 💪
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {units.map((u) => (
            <div key={u.unit}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: u.conquered ? '#34d399' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {u.conquered && <Trophy size={14} color="#fbbf24" />}{u.unit}
                </span>
                <span style={{ fontSize: '0.74rem', color: u.conquered ? '#34d399' : '#94a3b8' }}>
                  {u.conquered ? '정복 완료!' : `${u.resolved}/${u.total} · ${u.remaining}개 남음`}
                </span>
              </div>
              <div style={{ height: 9, borderRadius: 999, background: 'rgba(148,163,184,0.18)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${u.pct}%`, height: '100%',
                    background: u.conquered ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#f59e0b,#ef4444)',
                    transition: 'width .5s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
