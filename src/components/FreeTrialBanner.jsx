import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Lock, CreditCard, Sparkles, UserPlus, LogIn, ArrowRight, User } from 'lucide-react';
import PaymentCheckoutModal from './PaymentCheckoutModal';

export default function FreeTrialBanner({ gradeFlow }) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  // Registration / Login input state inside the paywall
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    // 1. Check paid state
    const paid = localStorage.getItem('mentos_is_paid') === 'true';
    setIsPaid(paid);

    if (paid) {
      return;
    }

    // 2. Load user profile
    const savedUser = localStorage.getItem('mentos_mock_user');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }

    // 3. Initialize or load the trial timer (20 minutes = 1200 seconds)
    let initialSecs = localStorage.getItem('mentos_trial_seconds_left');
    if (initialSecs === null) {
      localStorage.setItem('mentos_trial_seconds_left', '1200');
      initialSecs = '1200';
    }
    
    let currentSecs = parseInt(initialSecs, 10);
    setSecondsLeft(currentSecs);

    if (currentSecs <= 0) {
      return;
    }

    // 4. Start tick interval
    const interval = setInterval(() => {
      currentSecs = currentSecs - 1;
      localStorage.setItem('mentos_trial_seconds_left', String(currentSecs));
      setSecondsLeft(currentSecs);

      if (currentSecs <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen to paid changes from checkout redirects or clicks
  useEffect(() => {
    const handleStorageChange = () => {
      setIsPaid(localStorage.getItem('mentos_is_paid') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers for dynamic simulated auth inside the paywall
  const handleRegisterAndPay = (e) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) {
      alert('이름과 이메일을 모두 입력해 주세요.');
      return;
    }
    const mockUser = {
      id: 'user_' + Date.now(),
      name: nameInput.trim(),
      email: emailInput.trim(),
      role: 'student'
    };
    localStorage.setItem('mentos_mock_user', JSON.stringify(mockUser));
    setLoggedInUser(mockUser);
    setShowCheckout(true);
  };

  const handleQuickLogin = () => {
    const mockUser = {
      id: 'user_t_' + Date.now(),
      name: '체험학생',
      email: 'trial@mentos.ai',
      role: 'student'
    };
    localStorage.setItem('mentos_mock_user', JSON.stringify(mockUser));
    setLoggedInUser(mockUser);
  };

  if (isPaid) return null;
  if (secondsLeft === null) return null;

  const isExpired = secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 120; // Last 2 minutes

  // ─── 1. Expired Viewport Lock Modal ───
  if (isExpired) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(9, 9, 11, 0.92)',
        zIndex: 150000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(24px)', padding: '1rem'
      }}>
        {/* Glowing visual effect in background */}
        <div style={{ position: 'absolute', width: '350px', height: '350px', background: 'rgba(239, 68, 68, 0.15)', filter: 'blur(100px)', top: '15%', pointerEvents: 'none' }} />
        
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          width: '100%', maxWidth: '520px',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.12)'
        }}>
          {/* Lock Icon Badge */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', animation: 'bounce 2s infinite'
          }}>
            <Lock size={38} color="#f59e0b" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'white', marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>
            20분 무료 체험이 종료되었습니다
          </h2>
          
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            멘토스의 명품 주 2회, 2시간 입체 학습 솔루션을 
            <br />
            정식으로 이용하시려면 간편 회원가입/로그인 후 결제해 주세요.
          </p>

          {/* User state section */}
          {!loggedInUser ? (
            <form onSubmit={handleRegisterAndPay} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '24px',
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '1.8rem'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserPlus size={16} color="#3b82f6" />
                <span>체험 정보 등록 및 로그인</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="이름 입력 (예: 홍길동)"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '0.9rem' }}
                />
                <input 
                  type="email" 
                  placeholder="이메일 주소 입력"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '0.9rem' }}
                />
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white',
                  fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', marginTop: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                계정 생성 및 결제하기 <ArrowRight size={16} />
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                <button 
                  type="button"
                  onClick={handleQuickLogin}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}
                >
                  입력 없이 원클릭 바로 로그인
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 'bold' }}
                >
                  이미 계정이 있으신가요? 일반 로그인하기
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '24px',
              padding: '1.5rem',
              marginBottom: '1.8rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
                  <User size={18} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>접속 계정</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0' }}>{loggedInUser.name} ({loggedInUser.email})</div>
                </div>
              </div>

              {/* Promotional Price details inside block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '0.8rem 1.2rem', borderRadius: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#f472b6', fontWeight: 'bold', display: 'block' }}>선착순 1000명 초특가</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#c084fc' }}>월 45,000원</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right' }}>3개월간 54% 할인<br />이후 99,000원</span>
              </div>

              <button 
                onClick={() => setShowCheckout(true)}
                style={{
                  width: '100%', padding: '1.1rem', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '1rem', boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                }}
              >
                <CreditCard size={18} /> 프리미엄 이용권 구매하기
              </button>
            </div>
          )}

          {/* Utility Return links */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/grade-select')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              처음으로 돌아가기
            </button>
            <span style={{ color: '#334155' }}>|</span>
            <button 
              onClick={() => navigate('/')}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              대시보드 이동
            </button>
          </div>
        </div>

        {showCheckout && <PaymentCheckoutModal onClose={() => setShowCheckout(false)} />}
      </div>
    );
  }

  // ─── 2. Floating Timer Banner View ───
  return (
    <>
      <div style={{
        position: 'fixed', top: '70px', right: '20px',
        background: isUrgent ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.85)',
        border: isUrgent ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
        color: 'white', padding: '0.6rem 1.3rem', borderRadius: '30px',
        fontWeight: 'bold', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        fontSize: '0.88rem',
        animation: isUrgent ? 'pulseAlert 1s infinite' : 'none'
      }}>
        <Clock size={16} color={isUrgent ? 'white' : '#60a5fa'} />
        <span style={{ color: isUrgent ? 'white' : '#94a3b8' }}>무료 체험 중</span>
        <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', letterSpacing: '1px' }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>

        <button 
          onClick={() => setShowCheckout(true)}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #db2777)',
            border: 'none', padding: '0.3rem 0.8rem', borderRadius: '20px',
            color: 'white', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer',
            marginLeft: '4px', boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
          }}
        >
          구매
        </button>
      </div>

      {showCheckout && <PaymentCheckoutModal onClose={() => setShowCheckout(false)} />}

      <style>{`
        @keyframes pulseAlert {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(0.98); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
