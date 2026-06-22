// 🔥 학습 습관 위젯 — 연속 학습 스트릭 + 오늘의 학습시간 링 + 최근 7일.
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getStreak, getTodayMinutes, getDailyGoal, getLast7Days } from '@/lib/dailyStudy';

function read() {
  const { current, longest } = getStreak();
  const today = getTodayMinutes();
  const goal = getDailyGoal();
  return { current, longest, today, goal, week: getLast7Days() };
}

export default function StudyHabitWidget() {
  const [s, setS] = useState(read);

  // 하트비트로 시간이 쌓이므로 주기적으로 새로고침 + 탭 복귀/스토리지 변경 시 갱신
  useEffect(() => {
    const refresh = () => setS(read());
    const id = setInterval(refresh, 20000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const pct = Math.min(100, Math.round((s.today / s.goal) * 100));
  const R = 34;
  const C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;
  const done = s.today >= s.goal;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(37,99,235,0.10))',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
        padding: '1rem 1.2rem', margin: '0.75rem 0',
      }}
    >
      {/* 스트릭 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 150 }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: s.current > 0 ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(148,163,184,0.2)',
            boxShadow: s.current > 0 ? '0 6px 18px rgba(239,68,68,0.35)' : 'none',
          }}
        >
          <Flame size={28} color="#fff" fill={s.current > 0 ? '#fde68a' : 'none'} />
        </div>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1 }}>
            {s.current}<span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1' }}>일 연속</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>최고 {s.longest}일 🔥</div>
        </div>
      </div>

      {/* 오늘의 학습시간 링 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 170 }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={R} fill="none"
            stroke={done ? '#10b981' : '#8b5cf6'} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`} transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          <text x="40" y="37" textAnchor="middle" fontSize="16" fontWeight="800" fill="#f8fafc">{s.today}</text>
          <text x="40" y="52" textAnchor="middle" fontSize="9" fill="#94a3b8">/ {s.goal}분</text>
        </svg>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: done ? '#10b981' : '#c4b5fd' }}>
            {done ? '오늘 목표 달성! ✅' : '오늘의 학습'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>
            {done ? '내일도 이어가요' : `${Math.max(0, s.goal - s.today)}분 더 채우면 완료`}
          </div>
        </div>
      </div>

      {/* 최근 7일 점 */}
      <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
        {s.week.map((d) => (
          <div key={d.date} style={{ textAlign: 'center' }}>
            <div
              title={`${d.date} · ${d.minutes}분`}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: d.active ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(148,163,184,0.18)',
                border: d.isToday ? '2px solid #c4b5fd' : 'none',
                margin: '0 auto',
              }}
            />
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 3 }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
