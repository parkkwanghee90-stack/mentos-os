import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Target, AlertTriangle, CheckCircle, 
  TrendingUp, BookOpen, MessageSquare, ArrowLeft, 
  Zap, Bell, Smartphone
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, BarChart, Bar 
} from 'recharts';

// Mock data helpers
const parseSubject = (subj) => {
  const map = { 'math': '수학', 'eng': '영어', 'sci': '과학' };
  return map[subj] || subj;
};

export default function ParentDashboard() {
  const navigate = useNavigate();

  // Load real data from localStorage
  const trialState = useMemo(() => JSON.parse(localStorage.getItem('mentos_free_trial') || '{}'), []);
  const lessonHistory = useMemo(() => JSON.parse(localStorage.getItem('mentos_lesson_results') || '[]'), []);
  const weaknessHistory = useMemo(() => JSON.parse(localStorage.getItem('mentos_weakness_history') || '[]'), []);
  const localGradingHistory = useMemo(() => JSON.parse(localStorage.getItem('localGradingHistory') || '[]'), []);

  const lastLesson = lessonHistory[lessonHistory.length - 1];
  const lastWeakness = weaknessHistory[weaknessHistory.length - 1];

  // Calculate 7-day stats
  const weeklyStats = useMemo(() => {
    // In a real app, we'd filter by date. Here we use mock data mixed with real volume.
    const base = [
      { day: '월', count: 12, accuracy: 65 },
      { day: '화', count: 18, accuracy: 72 },
      { day: '수', count: 15, accuracy: 68 },
      { day: '목', count: 22, accuracy: 75 },
      { day: '금', count: 25, accuracy: 82 },
      { day: '토', count: 30, accuracy: 88 },
      { day: '일', count: trialState.problemsSolvedToday || 10, accuracy: 92 }
    ];
    return base;
  }, [trialState.problemsSolvedToday]);

  const accuracy = useMemo(() => {
    if (lessonHistory.length === 0) return 0;
    const totalCorrect = lessonHistory.reduce((acc, l) => acc + (l.core?.correctCount || 0), 0);
    const totalQs = lessonHistory.reduce((acc, l) => acc + (l.core?.totalQuestions || 0), 0);
    return totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 85;
  }, [lessonHistory]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '2rem' }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' }}
          >
            <ArrowLeft size={18} /> 학생 대시보드로 전환
          </button>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px' }}>
            학부모 안심 리포트 <span style={{ color: '#3b82f6', fontSize: '1rem', verticalAlign: 'middle', marginLeft: '10px', background: '#dbeafe', padding: '4px 12px', borderRadius: '20px' }}>PREMIUM</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>자녀의 학습 성장 과정을 실시간으로 확인하세요.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '0.8rem 1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Bell size={20} color="#64748b" /> 알림 설정
          </button>
          <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)' }}>
            <MessageSquare size={20} /> AI 튜터와 상담하기
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Summary & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Today Summary Card */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={24} color="#f59e0b" fill="#f59e0b" /> 오늘 학습 요약
              </h3>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' }}>{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f8fafc', borderRadius: '20px' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>학습 문제</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a' }}>{trialState.problemsSolvedToday || 0}개</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f0fdf4', borderRadius: '20px' }}>
                <div style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>평균 정답률</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#15803d' }}>{accuracy}%</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f5f3ff', borderRadius: '20px' }}>
                <div style={{ color: '#5b21b6', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>집중 시간</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#6d28d9' }}>120분</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem', background: '#fff7ed', borderRadius: '20px' }}>
                <div style={{ color: '#9a3412', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>숙제 완료</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#c2410c' }}>완료</div>
              </div>
            </div>
          </div>

          {/* Weekly Growth Chart */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={24} color="#3b82f6" /> 최근 7일 학습 추이
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyStats}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#3b82f6' }}></div> 학습량(문제 수)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></div> 정답률(%)
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Analysis & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* AI Parent Comment */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '24px', padding: '2rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#60a5fa' }}>
              <MessageSquare size={22} /> AI 튜터 한 줄 코멘트
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#e2e8f0', margin: 0, fontStyle: 'italic' }}>
              "오늘 자녀분은 '삼각함수 활용' 단원에서 다소 어려움을 겪었으나, AVS를 활용해 끝까지 문제를 해결하려는 의지가 돋보였습니다. 특히 오답 분석 후 진행된 보강 문제에서 정답률이 80%까지 올라가며 약점을 잘 극복해내고 있습니다. 가정에서도 칭찬 한마디 부탁드립니다!"
            </p>
          </div>

          {/* Weakness Analysis */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={22} color="#ef4444" /> 집중 관리가 필요한 단원
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lastWeakness ? lastWeakness.top3.map((unit, idx) => (
                <div key={idx} style={{ padding: '1rem', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                  <div style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '0.3rem' }}>{unit}</div>
                  <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>오답 패턴: 공식 적용 오류 ({Math.round(Math.random()*40 + 60)}%)</div>
                </div>
              )) : (
                <>
                  <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '0.3rem' }}>삼각함수의 그래프</div>
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>오답 패턴: 주기/대칭성 활용 부족</div>
                  </div>
                  <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '0.3rem' }}>수열의 합</div>
                    <div style={{ fontSize: '0.85rem', color: '#b91c1c' }}>오답 패턴: 시그마 공식 혼동</div>
                  </div>
                </>
              )}
            </div>
            <button style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>
              전체 분석 리포트 보기
            </button>
          </div>

          {/* Push Message Status */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={24} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>카카오톡 리포트 발송 완료</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>오늘 오후 9:30에 전송되었습니다.</div>
            </div>
          </div>

        </div>

      </div>

      {/* Recent History Table */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto 0', background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.5rem' }}>최근 학습 상세 내역</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>학습 일시</th>
              <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>과목/단원</th>
              <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>문제 수</th>
              <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>성취도</th>
              <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {lessonHistory.length > 0 ? lessonHistory.slice(-5).reverse().map((h, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '1.2rem', fontWeight: '500' }}>{new Date(h.date || Date.now()).toLocaleDateString()}</td>
                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>{h.grade} {h.subject} / {h.unit}</td>
                <td style={{ padding: '1.2rem' }}>{h.core?.totalQuestions || 0}문항</td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ color: (h.core?.correctCount / h.core?.totalQuestions) >= 0.8 ? '#16a34a' : '#f59e0b', fontWeight: 'bold' }}>
                    {Math.round((h.core?.correctCount / h.core?.totalQuestions) * 100) || 0}%
                  </span>
                </td>
                <td style={{ padding: '1.2rem' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a', fontSize: '0.8rem', fontWeight: 'bold' }}>학습완료</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>아직 학습 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
