import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, AlertTriangle, Users, ArrowLeft, TrendingDown, Clock } from 'lucide-react';
import { processUnsubmittedHomework } from '@/engine/homeworkEngine';
import { useAuth } from '@/context/AuthContext';
import './Dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  // 관리자 마스터 인증 상태
  const [isAdminVerified, setIsAdminVerified] = useState(
    localStorage.getItem('mentos_admin_verified') === 'true'
  );
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Mock Data for MVP
  const [students, setStudents] = useState([
    { id: 'std01', name: '김멘토', grade: '고2', weakPoint: '삼각함수 활용 (사인법칙 응용)', recentScore: 75, lastClass: '2026-04-27' },
    { id: 'std02', name: '이수학', grade: '고3', weakPoint: '수열의 귀납적 정의 (점화식)', recentScore: 60, lastClass: '2026-04-26' },
    { id: 'std03', name: '박영어', grade: '고1', weakPoint: '이차부등식 (판별식 적용)', recentScore: 85, lastClass: '2026-04-27' }
  ]);

  const [pushLogs, setPushLogs] = useState([]);
  const [submittedHws, setSubmittedHws] = useState([]);

  useEffect(() => {
    // Load push logs from localStorage
    const logs = JSON.parse(localStorage.getItem('admin_push_logs') || '[]');
    setPushLogs(logs);

    // Load homeworks pending teacher/assistant review
    const db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    const localHws = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
    
    // Pick homeworks marked as submitted
    const submitted = db.filter(h => h.status === 'submitted' || localHws.some(lh => lh.homeworkId === h.homeworkId && lh.status === 'submitted'));
    setSubmittedHws(submitted);
  }, []);

  const approveHomework = (hwId) => {
    // 1. Update DB to reviewed
    const db = JSON.parse(localStorage.getItem('mentos_math_homework_db') || '[]');
    const updatedDb = db.map(h => h.homeworkId === hwId ? { ...h, status: 'reviewed', reviewedAt: Date.now() } : h);
    localStorage.setItem('mentos_math_homework_db', JSON.stringify(updatedDb));

    // 2. Update metadata list
    const localHwList = JSON.parse(localStorage.getItem('mentosHomework') || '[]');
    const updatedList = localHwList.map(h => h.homeworkId === hwId ? { ...h, status: 'reviewed' } : h);
    localStorage.setItem('mentosHomework', JSON.stringify(updatedList));

    alert("🎉 조교 검수 및 채점 최종 승인 완료되었습니다! 학생 대시보드에 반영됩니다.");
    setSubmittedHws(prev => prev.filter(h => h.homeworkId !== hwId));
  };

  const triggerMidnightAudit = () => {
    if(window.confirm("자정(00:00) 기준 과제 미제출자 자동 결산을 시뮬레이션 하시겠습니까?")) {
      // 이수학 학생을 타겟으로 경고 누적 시뮬레이션
      processUnsubmittedHomework('std02', '이수학');
      
      // Update logs UI
      const logs = JSON.parse(localStorage.getItem('admin_push_logs') || '[]');
      setPushLogs(logs);
      
      // Update warning status locally for demo
      const strikes = parseInt(localStorage.getItem('strikes_std02') || '0');
      if (strikes >= 4) {
        alert("이수학 학생이 4회 누적으로 자동 퇴소(계정 잠금) 처리되었습니다.");
        setStudents(prev => prev.map(s => s.id === 'std02' ? {...s, weakPoint: '퇴소 처리됨', recentScore: 0} : s));
      } else {
        alert(`이수학 학생에게 ${strikes}차 미제출 경고 푸시가 자동 발송되었습니다.`);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('mentos_manual_seen');
    localStorage.removeItem('mentos_admin_verified');
    try {
      await signOut();
    } catch (e) {
      console.warn('Supabase signout failed, clearing local mock session anyway', e);
      localStorage.removeItem('mentos_mock_user');
      localStorage.removeItem('mentos_is_paid');
    }
    navigate('/grade-select');
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const cleanCode = adminCodeInput.trim().toUpperCase();
    if (cleanCode === '1234' || cleanCode === 'MENTOS_ADMIN_777') {
      localStorage.setItem('mentos_admin_verified', 'true');
      setIsAdminVerified(true);
      setAuthError('');
      // Trigger storage event to sync other gateways
      window.dispatchEvent(new Event('storage'));
    } else {
      setAuthError('❌ 올바르지 않은 인증 코드입니다. 다시 입력해 주세요.');
    }
  };

  if (!isAdminVerified) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        color: 'white',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'rgba(239, 68, 68, 0.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />
        
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          borderRadius: '24px',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          background: 'rgba(15, 23, 42, 0.95)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Shield size={32} color="#ef4444" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
            관리자 보안 인증
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            멘토스 OS 관리자(원장) 대시보드 진입을 위해<br />보안 인증 코드를 입력해 주세요.
          </p>

          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                인증 코드 입력
              </label>
              <input
                type="password"
                placeholder="인증코드를 입력하세요 (예: 1234)"
                value={adminCodeInput}
                onChange={(e) => setAdminCodeInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              대시보드 잠금 해제
            </button>

            <button
              type="button"
              onClick={() => navigate('/grade-select')}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: '#a1a1aa',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              홈으로 돌아가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <button className="back-btn" onClick={handleLogout}><ArrowLeft size={20}/> 로그아웃</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
          <div>
            <h1 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={28} color="#ef4444" />
              관리자 (원장) 통합 대시보드
            </h1>
            <p className="dash-subtitle">원생들의 학습 현황과 취약점 분석, 학부모 푸시 알림을 종합 관리합니다.</p>
          </div>
          <button 
            onClick={triggerMidnightAudit}
            className="btn-primary" 
            style={{ background: '#ef4444', borderRadius: '12px', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' , width: '100%'}}>
            <Clock size={18} /> 자정 미제출 결산 시뮬레이터
          </button>
        </div>
      </div>

      <div className="stats-cards animate-fade-in">
        <div className="glass-panel stat-card" style={{borderColor: 'rgba(239, 68, 68, 0.3)'}}>
          <Users className="stat-icon red" />
          <div className="stat-info">
            <h4>오늘 출석 원생</h4>
            <div className="stat-value">12명 <span className="trend up">실시간</span></div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <Bell className="stat-icon purple" />
          <div className="stat-info">
            <h4>학부모 리포트 발송</h4>
            <div className="stat-value">8건 <span className="trend up">자동 발송 완료</span></div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <AlertTriangle className="stat-icon teal" />
          <div className="stat-info">
            <h4>AI 취약점 경고</h4>
            <div className="stat-value">3건 <span className="trend down">주의 요망</span></div>
          </div>
        </div>
      </div>

      {/* Enterprise-Scale Student Management Panel */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(0,0,0,0))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <TrendingDown size={20} /> AI 취약 단원 집중 관리 (총 12,450명 중 요주의 학생)
          </h3>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="학생명 또는 학교 검색..." 
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #3f3f46', background: 'rgba(0,0,0,0.3)', color: 'white' }} 
            />
            <select style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
              <option>모든 학년</option>
              <option>고3 / N수</option>
              <option>고2</option>
              <option>고1</option>
            </select>
            <select style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #3f3f46', background: 'rgba(0,0,0,0.3)', color: 'white' }}>
              <option>정답률 60% 미만 위험군</option>
              <option>최근 결석생</option>
              <option>숙제 미제출자</option>
            </select>
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' , width: '100%'}}>검색</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {students.map(std => (
            <div key={std.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{std.name}</span>
                  <span style={{ fontSize: '0.8rem', background: '#3f3f46', padding: '2px 8px', borderRadius: '12px' }}>{std.grade}</span>
                  {std.recentScore < 70 && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>긴급 케어</span>}
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={14}/> <strong>[AI 진단]</strong> {std.weakPoint}
                </div>
              </div>
              
              <div style={{ flex: 1, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                최근 로그인: 1시간 전<br/>
                제출한 숙제: 2/3건
              </div>

              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: std.recentScore >= 80 ? '#10b981' : '#ef4444' }}>최근 점수: {std.recentScore}점</div>
                <button style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid #6366f1', color: '#818cf8', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
                  상세 리포트 보기
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Dummy */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>&lt;</button>
          <button style={{ padding: '0.5rem 1rem', background: '#6366f1', border: 'none', color: 'white', borderRadius: '4px' }}>1</button>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>2</button>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>3</button>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>...</button>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>1,245</button>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', border: 'none', color: 'white', borderRadius: '4px' }}>&gt;</button>
        </div>
      </div>

      {/* [NEW] Assistant Homework Audit Panel */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1.5rem', marginBottom: '2rem', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(0,0,0,0))' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
          <Shield size={20} /> 실시간 원생 숙제 검수 및 채점 연동 센터
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.5rem' }}>원생들이 제출한 3,4단계 통합 숙제 및 2단계 변형 숙제의 오답 문항과 성취도를 검사하고 채점을 최종 승인합니다.</p>
        
        {submittedHws.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>💬 현재 검수 대기 중인 원생 숙제가 없습니다.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submittedHws.map(hw => (
              <div key={hw.homeworkId} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#e2e8f0' }}>{hw.title}</span>
                    <span style={{ fontSize: '0.75rem', background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>제출완료</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    과제 고유 ID: {hw.homeworkId} | 문항 수: {hw.problems?.length || 0}문제
                  </div>
                </div>
                
                <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    자동 채점 완료
                  </div>
                  <button 
                    onClick={() => approveHomework(hw.homeworkId)}
                    className="btn-primary" 
                    style={{ background: '#10b981', color: 'white', padding: '0.5rem 1.2rem', fontSize: '0.88rem', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    조교 검사 및 채점 최종 승인
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parent Push Log Panel */}
      <div className="glass-panel animate-fade-in" style={{ margin: '0 0.5rem', padding: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7' }}>
          <Bell size={20} /> 학부모 자동 푸시 알림 내역
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pushLogs.map((log, idx) => (
            <div key={idx} style={{ padding: '1rem', background: 'rgba(168,85,247,0.05)', borderRadius: '12px', border: '1px solid rgba(168,85,247,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{color: '#c084fc'}}>{log.target}</strong>
                <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{log.time}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.5' }}>
                {log.content}
              </p>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
