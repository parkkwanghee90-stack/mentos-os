import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, User, ShieldAlert, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * LoginGate: 로그인 필수 기능을 감싸는 게이트웨이 컴포넌트
 * - 비로그인 상태에서도 특정 기능(체험 수업 등)은 허용
 * - 기록 저장, 대시보드 등 개인화 기능 진입 시 로그인 유도
 */
export default function LoginGate({ children, required = false, requiredRole = null, fallback = null }) {
  const { user: authUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔑 슈퍼패스: localStorage에 mentos_super_pass가 있으면 가짜 유저로 모든 게이트 통과
  const isSuperPass = localStorage.getItem('mentos_super_pass') === 'true';

  const user = isSuperPass ? {
    id: 'super_admin_pass',
    name: '통합관리자',
    email: 'super@mentos.ai',
    role: 'admin'
  } : authUser ? {
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
    email: authUser.email,
    role: authUser.user_metadata?.role || 'student'
  } : null;

  const [showModal, setShowModal] = useState(false);

  const handleMockLogin = async (role = 'student') => {
    // Quick developer mock login using Supabase demo account if registered,
    // otherwise fallback to beautiful standard signin page
    setShowModal(false);
    navigate('/login', { state: { from: location } });
  };

  // 로그인이 필요한 기능인데 로그인이 안 된 경우
  if (required && !user && !authLoading) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', color: 'white', maxWidth: '500px', margin: '2rem auto', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldAlert size={32} color="#f59e0b" />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>로그인이 필요한 기능입니다</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          학습 기록 저장 및 맞춤 분석을 위해<br />로그인이 필요합니다.
        </p>
        <button 
          onClick={() => navigate('/login', { state: { from: location } })}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', padding: '1rem 2.5rem', borderRadius: '14px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)', width: '100%' }}
        >
          로그인 하기
        </button>
      </div>
    );
  }

  // 마스터 관리자 인증 우회 체크
  const isMasterAdmin = localStorage.getItem('mentos_admin_verified') === 'true';

  if (requiredRole === 'admin' && isMasterAdmin) {
    return <>{children}</>;
  }

  // 관리자 권한 체크
  if (requiredRole === 'admin' && user && user.role !== 'admin') {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#0f172a', borderRadius: '24px', border: '1px solid rgba(239,68,68,0.2)', color: 'white', maxWidth: '500px', margin: '2rem auto', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7)' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldAlert size={32} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '0.8rem' }}>접근 권한이 없습니다</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          관리자 전용 페이지입니다.<br />관리자 계정으로 로그인해 주세요.
        </p>
        <button 
          onClick={() => navigate('/login', { state: { from: location, tab: 'admin' } })}
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: 'white', padding: '1rem 2.5rem', borderRadius: '14px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', width: '100%' }}
        >
          관리자 로그인
        </button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#94a3b8', background: '#09090b', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', margin: '2rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <div>인증 상태 동기화 중...</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {children}
      {showModal && <LoginModal onLogin={handleMockLogin} onClose={() => setShowModal(false)} />}
    </>
  );
}

function LoginModal({ onLogin, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#ffffff', width: '90%', maxWidth: '400px', borderRadius: '24px', padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LogIn size={30} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>Mentos AI 로그인</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>맞춤형 AI 수업을 시작하세요</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => onLogin('student')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ padding: '0.5rem', background: '#dbeafe', borderRadius: '10px' }}>
              <User size={20} color="#3b82f6" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: '#1e293b' }}>학생으로 로그인</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>수업 참여 및 숙제 관리</div>
            </div>
          </button>

          <button 
            onClick={() => onLogin('parent')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div style={{ padding: '0.5rem', background: '#f3e8ff', borderRadius: '10px' }}>
              <User size={20} color="#8b5cf6" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', color: '#1e293b' }}>학부모로 로그인</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>학습 리포트 및 결제 관리</div>
            </div>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          가입한 이메일 또는 아이디로 로그인해 주세요.
        </p>
      </div>
    </div>
  );
}
