// 📩 주간 부모 리포트 카드 — 자동 주간발송(진입 시 1회) + 수동 발송 버튼.
import { useEffect, useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { sendWeeklyParentReport, shouldAutoSend, getLastSentAt, buildWeeklyReport } from '@/lib/weeklyParentReport';

function studentName() {
  try {
    const u = JSON.parse(localStorage.getItem('mentos_mock_user') || 'null');
    return u?.name || '학생';
  } catch {
    return '학생';
  }
}

function daysAgo(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
}

export default function WeeklyReportCard() {
  const [sentAt, setSentAt] = useState(getLastSentAt());
  const [justSent, setJustSent] = useState(false);
  const rep = buildWeeklyReport(studentName());

  // 진입 시 주1회 자동 발송
  useEffect(() => {
    if (shouldAutoSend()) {
      sendWeeklyParentReport(studentName());
      setSentAt(getLastSentAt());
      setJustSent(true);
    }
  }, []);

  const send = () => {
    sendWeeklyParentReport(studentName());
    setSentAt(getLastSentAt());
    setJustSent(true);
  };

  const ago = daysAgo(sentAt);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: 16, padding: '0.9rem 1.1rem', margin: '0.6rem 0',
      }}
    >
      <div style={{ fontSize: '1.6rem' }}>📩</div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontWeight: 800, color: '#ecfdf5', fontSize: '0.95rem' }}>주간 학습 리포트 (부모님)</div>
        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 3 }}>
          🔥{rep.streak}일 연속 · {rep.weekMin}분 · 정답률 {rep.accuracy}점 · 취약 {rep.weak}
        </div>
        {justSent ? (
          <div style={{ fontSize: '0.74rem', color: '#34d399', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle size={13} /> 부모님께 발송했어요
          </div>
        ) : ago != null ? (
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>마지막 발송: {ago === 0 ? '오늘' : `${ago}일 전`}</div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={send}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff',
          border: 'none', borderRadius: 12, padding: '0.6rem 1rem',
          fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer',
        }}
      >
        <Send size={15} /> 지금 보내기
      </button>
    </div>
  );
}
