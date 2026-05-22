import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Shield, Lock, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsDemo } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await signInAsDemo(isAdmin ? 'admin' : 'student');
      setSuccessMsg(`데모 ${isAdmin ? '관리자' : '학생'} 계정으로 1초 로그인 성공! 대시보드로 이동합니다.`);
      setTimeout(() => {
        const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
        navigate(from, { replace: true });
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMsg('데모 로그인 도중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const roleHint = isAdmin ? 'admin' : 'student';
    const email = username.includes('@') ? username : `${username}@mentos.com`;

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setErrorMsg('비밀번호는 6자리 이상이어야 합니다.');
          setIsLoading(false);
          return;
        }
        
        const nickname = username.split('@')[0] || '가입학생';
        await signUpWithEmail(email, password, nickname, roleHint);
        setSuccessMsg('회원가입이 완료되었습니다! 대시보드로 이동합니다.');
        
        setTimeout(() => {
          const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
          navigate(from, { replace: true });
          window.location.reload();
        }, 1500);
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('로그인 성공! 대시보드로 이동하는 중...');
        
        setTimeout(() => {
          const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
          navigate(from, { replace: true });
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      let localizedError = err.message || '인증에 실패했습니다. 비밀번호를 다시 확인해주세요.';
      if (localizedError.includes('Invalid login credentials')) {
        localizedError = '아이디(이메일) 또는 비밀번호가 일치하지 않습니다.';
      } else if (localizedError.includes('User already exists')) {
        localizedError = '이미 가입된 아이디(이메일)입니다.';
      } else if (localizedError.includes('Password should be')) {
        localizedError = '비밀번호는 최소 6자리 이상이어야 합니다.';
      }
      setErrorMsg(localizedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      await signInWithGoogle();
      setSuccessMsg('Google 계정 로그인 페이지로 이동합니다...');
    } catch (err) {
      console.error(err);
      let localizedError = err.message || 'Google 로그인 연동 중 오류가 발생했습니다.';
      if (localizedError.includes('provider is not enabled')) {
        localizedError = '현재 Google 소셜 로그인이 비활성화되어 있습니다. 이메일 로그인을 이용해 주세요!';
      }
      setErrorMsg(localizedError);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Orbs */}
      <div className="login-bg-orb orb-1"></div>
      <div className="login-bg-orb orb-2"></div>

      <div className="login-content animate-fade-in">
        <div className="login-header">
          <div className="login-logo-box">
            <Zap size={32} color={isAdmin ? "#ef4444" : "#10b981"} />
          </div>
          <h1 className="login-title">Mentos</h1>
          <p className="login-subtitle">초개인화 AI 학습 OS</p>
        </div>

        <form className="login-form glass-panel" onSubmit={handleLogin}>
          <div className="login-tabs">
            <button 
              type="button" 
              className={`login-tab ${!isAdmin ? 'active' : ''}`}
              onClick={() => {
                setIsAdmin(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              학생
            </button>
            <button 
              type="button" 
              className={`login-tab ${isAdmin ? 'active-admin' : ''}`}
              onClick={() => {
                setIsAdmin(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              관리자/원장
            </button>
          </div>

          <h2 className="form-title">
            {isAdmin 
              ? (isSignUp ? '관리자 회원가입' : '관리자 로그인') 
              : (isSignUp ? '학생 회원가입' : '학생 로그인')}
          </h2>
          
          {errorMsg && (
            <div className="error-message" style={{
              color: '#ef4444', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              padding: '0.8rem', 
              borderRadius: '12px', 
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="success-message" style={{
              color: '#10b981', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid rgba(16, 185, 129, 0.2)', 
              padding: '0.8rem', 
              borderRadius: '12px', 
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {successMsg}
            </div>
          )}

          <div className="input-group">
            <div className="input-icon">
              {isAdmin ? <Shield size={20} color="#94a3b8" /> : <User size={20} color="#94a3b8" />}
            </div>
            <input 
              type="text" 
              placeholder={isAdmin ? "관리자 아이디(이메일)" : "학생 아이디 또는 이메일"} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <Lock size={20} color="#94a3b8" />
            </div>
            <input 
              type="password" 
              placeholder="비밀번호 (4자리 이상)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn-primary login-btn ${isAdmin ? 'admin-btn' : ''} ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (isSignUp ? '가입 중...' : '로그인 중...') : (
              <>{isSignUp ? '회원가입 완료' : (isAdmin ? '관리자 모드 접속' : '이메일 로그인')} <ArrowRight size={20} /></>
            )}
          </button>

          <button 
            type="button" 
            className="btn-demo-glow"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            <Sparkles size={20} color="#fff" />
            체험용 데모 계정으로 1초만에 시작하기
          </button>

          {!isAdmin && !isSignUp && (
            <button 
              type="button" 
              className="btn-secondary login-btn"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{ 
                marginTop: '0.5rem', 
                background: 'rgba(255, 255, 255, 0.03)', 
                color: '#f8fafc', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                boxShadow: 'none'
              }}
            >
              <Sparkles size={18} color="#60a5fa" style={{ marginRight: '8px' }} />
              Google 계정으로 계속하기
            </button>
          )}

          <div className="login-footer-links">
            <button type="button" className="text-link">비밀번호 찾기</button>
            <span className="divider">|</span>
            <button type="button" className="text-link highlight" onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}>
              {isSignUp ? '로그인하러 가기' : '회원가입'}
            </button>
          </div>
        </form>

        {/* 하단 운영 정보 및 정책 푸터 */}
        <div className="login-bottom-footer" style={{
          marginTop: '2rem',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '0.8rem',
          lineHeight: '1.6',
          zIndex: 10
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>© {new Date().getFullYear()} KS BrainTech. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>Terms</Link>
            <span style={{ color: '#475569' }}>·</span>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>Privacy</Link>
            <span style={{ color: '#475569' }}>·</span>
            <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>Refund</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
