import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Shield, Lock, ArrowRight, Zap, Sparkles, Mail, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isSuperPassMatch } from '@/services/superPass';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, verifyAdminCode, updateStudentInfo } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(location.state?.tab === 'admin' || false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 온보딩 필드
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('고등학교 1학년');
  const [mathGrade, setMathGrade] = useState('3등급');
  const [parentPhone, setParentPhone] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);

  // 🔑 슈퍼패스 모드
  const [showSuperPass, setShowSuperPass] = useState(false);
  const [superPassInput, setSuperPassInput] = useState('');
  const [superPassError, setSuperPassError] = useState('');

  // 슈퍼패스 인증번호는 환경변수(VITE_SUPER_PASS)에서만 주입한다. 코드에 하드코딩 금지.
  const SUPER_PASS = import.meta.env.VITE_SUPER_PASS;

  const handleSuperPass = (e) => {
    e.preventDefault();
    if (isSuperPassMatch(SUPER_PASS, superPassInput)) {
      localStorage.setItem('mentos_super_pass', 'true');
      localStorage.setItem('mentos_mock_user', JSON.stringify({
        id: 'super_admin_pass',
        name: '통합관리자',
        email: 'super@mentos.ai',
        role: 'admin'
      }));
      localStorage.setItem('mentos_is_paid', 'true');
      localStorage.setItem('mentos_manual_seen', 'true');
      window.dispatchEvent(new Event('storage'));
      navigate('/grade-select', { replace: true });
    } else {
      setSuperPassError('인증번호가 올바르지 않습니다.');
    }
  };

  // 비밀번호 재설정
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const email = username.includes('@') ? username : `${username}@mentos.com`;
    try {
      await resetPassword(email);
      setSuccessMsg(`📧 ${email}로 비밀번호 재설정 링크를 전송했습니다. 메일함을 확인해 주세요.`);
    } catch (err) {
      setErrorMsg(err.message || '비밀번호 재설정 이메일 전송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const email = username.includes('@') ? username : `${username}@mentos.com`;

    try {
      if (isSignUp) {
        // 회원가입
        if (password.length < 8) {
          setErrorMsg('비밀번호는 8자리 이상이어야 합니다.');
          setIsLoading(false);
          return;
        }
        if (password !== passwordConfirm) {
          setErrorMsg('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }
        if (!isAdmin && !school.trim()) {
          setErrorMsg('학교명을 입력해 주세요.');
          setIsLoading(false);
          return;
        }
        if (!isAdmin && !parentPhone.trim()) {
          setErrorMsg('학부모 전화번호를 입력해 주세요. (수업 결과 알림 발송용)');
          setIsLoading(false);
          return;
        }
        if (!isAdmin && parentPhone.trim() && !/^01[016789]-?\d{3,4}-?\d{4}$/.test(parentPhone.trim())) {
          setErrorMsg('전화번호 형식이 올바르지 않습니다. (예: 010-0000-0000)');
          setIsLoading(false);
          return;
        }

        const nickname = username.split('@')[0] || '학생';
        const role = isAdmin ? 'admin' : 'student';
        
        // 관리자 가입 시 관리자 코드 검증
        if (isAdmin && !adminCode.trim()) {
          setErrorMsg('관리자 인증코드를 입력해 주세요.');
          setIsLoading(false);
          return;
        }

        await signUpWithEmail(email, password, nickname, role, school, grade, mathGrade, parentPhone);
        
        // 관리자 코드 검증 (가입 후)
        if (isAdmin) {
          const verified = await verifyAdminCode(adminCode);
          if (!verified) {
            setErrorMsg('관리자 인증코드가 올바르지 않습니다. 일반 학생 계정으로 가입되었습니다.');
            setIsLoading(false);
            return;
          }
        }

        setEmailSent(true);
        setSuccessMsg('📧 가입 확인 이메일을 전송했습니다. 메일함을 확인해 주세요!');
      } else {
        // 로그인
        const loginData = await signInWithEmail(email, password);
        const signedUser = loginData?.user;
        
        // 관리자 로그인 시 role 체크
        if (isAdmin) {
          const userRole = signedUser?.user_metadata?.role;
          if (userRole !== 'admin') {
            // 관리자 코드로 승격 시도
            if (adminCode.trim()) {
              const verified = await verifyAdminCode(adminCode);
              if (!verified) {
                setErrorMsg('관리자 인증코드가 올바르지 않습니다.');
                setIsLoading(false);
                return;
              }
            } else {
              setErrorMsg('관리자 권한이 없는 계정입니다. 관리자 인증코드를 입력해 주세요.');
              setIsLoading(false);
              return;
            }
          }
        }

        // 학생 정보 온보딩 체크
        const meta = signedUser?.user_metadata || {};
        if (!isAdmin && (!meta.school || !meta.grade || !meta.math_grade)) {
          setSuccessMsg('학습 정보 설정이 필요합니다...');
          setTimeout(() => {
            setIsOnboarding(true);
            setSuccessMsg('');
          }, 800);
        } else {
          setSuccessMsg('로그인 성공! 이동 중...');
          setTimeout(() => {
            const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
            navigate(from, { replace: true });
          }, 800);
        }
      }
    } catch (err) {
      console.error(err);
      let msg = err.message || '인증에 실패했습니다.';
      if (msg.includes('Invalid login credentials')) msg = '이메일 또는 비밀번호가 일치하지 않습니다.';
      else if (msg.includes('User already exists') || msg.includes('already been registered')) msg = '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
      else if (msg.includes('Email not confirmed')) msg = '이메일 인증이 완료되지 않았습니다. 메일함을 확인해 주세요.';
      else if (msg.includes('Password should be')) msg = '비밀번호는 최소 8자리 이상이어야 합니다.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
    } catch (err) {
      let msg = err.message || 'Google 로그인 오류';
      if (msg.includes('provider is not enabled')) msg = '현재 Google 로그인이 비활성화되어 있습니다. 이메일로 가입해 주세요.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    if (!school.trim()) {
      setErrorMsg('학교명을 입력해 주세요.');
      setIsLoading(false);
      return;
    }
    try {
      await updateStudentInfo(school, grade, mathGrade);
      setSuccessMsg('등록 완료! 대시보드로 이동합니다.');
      setTimeout(() => {
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || '정보 등록 오류');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 이메일 전송 완료 화면 ───
  if (emailSent) {
    return (
      <div className="login-container">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        <div className="login-content animate-fade-in" style={{ maxWidth: '440px' }}>
          <div className="login-header" style={{ marginBottom: '1.5rem' }}>
            <div className="login-logo-box" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Mail size={32} color="#10b981" />
            </div>
            <h1 className="login-title">이메일 확인</h1>
            <p className="login-subtitle">메일함을 확인해 주세요</p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📩</div>
            <p style={{ color: '#f1f5f9', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              <strong>{username}</strong>으로<br />
              확인 이메일을 전송했습니다.<br />
              <span style={{ color: '#94a3b8' }}>메일의 링크를 클릭하면 가입이 완료됩니다.</span>
            </p>
            <button 
              className="btn-primary login-btn"
              onClick={() => { setEmailSent(false); setIsSignUp(false); setSuccessMsg(''); }}
              style={{ width: '100%' }}
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── 온보딩 화면 (학교/학년/등급) ───
  if (isOnboarding) {
    return (
      <div className="login-container">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        <div className="login-content animate-fade-in" style={{ maxWidth: '440px' }}>
          <div className="login-header" style={{ marginBottom: '1.2rem' }}>
            <div className="login-logo-box">
              <Sparkles size={32} color="#8b5cf6" />
            </div>
            <h1 className="login-title">학습 정보 입력</h1>
            <p className="login-subtitle">맞춤형 AI 학습을 위한 필수 정보</p>
          </div>

          <form className="login-form glass-panel" onSubmit={handleOnboardingSubmit} style={{ gap: '0.85rem' }}>
            {errorMsg && <div className="error-message" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', padding: '0.7rem', borderRadius: '12px', fontSize: '0.8rem', textAlign: 'center' }}>{errorMsg}</div>}
            {successMsg && <div className="success-message" style={{ color: '#10b981', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', padding: '0.7rem', borderRadius: '12px', fontSize: '0.8rem', textAlign: 'center' }}>{successMsg}</div>}

            <div className="input-group">
              <div className="input-icon"><User size={20} color="#94a3b8" /></div>
              <input type="text" placeholder="학교명 (예: 서울고등학교)" value={school} onChange={(e) => setSchool(e.target.value)} required />
            </div>

            <div className="select-group" style={{ width: '100%' }}>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '0.8rem 1rem', color: '#1e293b', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                <option value="중학교 1학년">중학교 1학년</option>
                <option value="중학교 2학년">중학교 2학년</option>
                <option value="중학교 3학년">중학교 3학년</option>
                <option value="고등학교 1학년">고등학교 1학년</option>
                <option value="고등학교 2학년">고등학교 2학년</option>
                <option value="고등학교 3학년">고등학교 3학년</option>
              </select>
            </div>

            <div className="select-group" style={{ width: '100%' }}>
              <select value={mathGrade} onChange={(e) => setMathGrade(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '0.8rem 1rem', color: '#1e293b', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                <option value="1등급">1등급 (최상위권)</option>
                <option value="2등급">2등급 (상위권)</option>
                <option value="3등급">3등급 (중상위권)</option>
                <option value="4등급">4등급 (중위권)</option>
                <option value="5등급">5등급 (중하위권)</option>
                <option value="6등급">6등급</option>
                <option value="7등급">7등급</option>
                <option value="8등급">8등급</option>
                <option value="9등급">9등급</option>
              </select>
            </div>

            <button type="submit" className={`btn-primary login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? '저장 중...' : '학습 시작하기'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── 비밀번호 재설정 화면 ───
  if (isResetMode) {
    return (
      <div className="login-container">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        <div className="login-content animate-fade-in">
          <div className="login-header">
            <div className="login-logo-box"><Lock size={32} color="#f59e0b" /></div>
            <h1 className="login-title">비밀번호 재설정</h1>
            <p className="login-subtitle">가입한 이메일로 재설정 링크를 전송합니다</p>
          </div>
          <form className="login-form glass-panel" onSubmit={handleResetPassword}>
            {errorMsg && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center' }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center' }}>{successMsg}</div>}
            <div className="input-group">
              <div className="input-icon"><Mail size={20} color="#94a3b8" /></div>
              <input type="text" placeholder="가입한 이메일 주소" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <button type="submit" className={`btn-primary login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? '전송 중...' : '재설정 링크 전송'}
            </button>
            <button type="button" className="text-link" onClick={() => { setIsResetMode(false); setErrorMsg(''); setSuccessMsg(''); }} style={{ marginTop: '0.5rem', textAlign: 'center', display: 'block', width: '100%', color: '#94a3b8' }}>
              ← 로그인으로 돌아가기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── 메인 로그인/가입 화면 ───
  return (
    <div className="login-container">
      <div className="login-bg-orb orb-1"></div>
      <div className="login-bg-orb orb-2"></div>

      <div className="login-content animate-fade-in">
        <div className="login-header">
          <div className="login-logo-box">
            <Zap size={32} color={isAdmin ? "#8b5cf6" : "#10b981"} />
          </div>
          <h1 className="login-title">Mentos</h1>
          <p className="login-subtitle">초개인화 AI 학습 OS</p>
        </div>

        <form className="login-form glass-panel" onSubmit={handleLogin}>
          <div className="login-tabs">
            <button type="button" className={`login-tab ${!isAdmin ? 'active' : ''}`}
              onClick={() => { setIsAdmin(false); setErrorMsg(''); setSuccessMsg(''); }}>
              학생
            </button>
            <button type="button" className={`login-tab ${isAdmin ? 'active-admin' : ''}`}
              onClick={() => { setIsAdmin(true); setErrorMsg(''); setSuccessMsg(''); }}>
              관리자/원장
            </button>
          </div>

          <h2 className="form-title">
            {isAdmin 
              ? (isSignUp ? '관리자 회원가입' : '관리자 로그인') 
              : (isSignUp ? '학생 회원가입' : '학생 로그인')}
          </h2>
          
          {errorMsg && (
            <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '0.8rem', borderRadius: '12px', fontSize: '0.875rem', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {/* 이메일 */}
          <div className="input-group">
            <div className="input-icon">
              <Mail size={20} color="#94a3b8" />
            </div>
            <input type="email" placeholder="이메일 주소" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          {/* 비밀번호 */}
          <div className="input-group">
            <div className="input-icon"><Lock size={20} color="#94a3b8" /></div>
            <input type="password" placeholder={isSignUp ? "비밀번호 (8자리 이상)" : "비밀번호"} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* 비밀번호 확인 (가입 시) */}
          {isSignUp && (
            <div className="input-group animate-fade-in">
              <div className="input-icon"><Lock size={20} color="#94a3b8" /></div>
              <input type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
            </div>
          )}

          {/* 관리자 인증코드 */}
          {isAdmin && (
            <div className="input-group animate-fade-in">
              <div className="input-icon"><Key size={20} color="#8b5cf6" /></div>
              <input type="password" placeholder="관리자 인증코드" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
            </div>
          )}

          {/* 학생 회원가입 추가 필드 */}
          {isSignUp && !isAdmin && (
            <>
              <div className="input-group animate-fade-in">
                <div className="input-icon"><User size={20} color="#94a3b8" /></div>
                <input type="text" placeholder="학교명 (예: 서울고등학교)" value={school} onChange={(e) => setSchool(e.target.value)} required />
              </div>
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>학부모 전화번호 <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>필수</span></label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', color: '#1e293b', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>수업 결과 알림이 자동 발송됩니다</span>
              </div>
              <div className="select-group animate-fade-in" style={{ width: '100%' }}>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '0.8rem 1rem', color: '#1e293b', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                  <option value="중학교 1학년">중학교 1학년</option>
                  <option value="중학교 2학년">중학교 2학년</option>
                  <option value="중학교 3학년">중학교 3학년</option>
                  <option value="고등학교 1학년">고등학교 1학년</option>
                  <option value="고등학교 2학년">고등학교 2학년</option>
                  <option value="고등학교 3학년">고등학교 3학년</option>
                </select>
              </div>
              <div className="select-group animate-fade-in" style={{ width: '100%' }}>
                <select value={mathGrade} onChange={(e) => setMathGrade(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '0.8rem 1rem', color: '#1e293b', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                  <option value="1등급">1등급 (최상위권)</option>
                  <option value="2등급">2등급 (상위권)</option>
                  <option value="3등급">3등급 (중상위권)</option>
                  <option value="4등급">4등급 (중위권)</option>
                  <option value="5등급">5등급 (중하위권)</option>
                  <option value="6등급">6등급</option>
                  <option value="7등급">7등급</option>
                  <option value="8등급">8등급</option>
                  <option value="9등급">9등급</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className={`btn-primary login-btn ${isAdmin ? 'admin-btn' : ''} ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            {isLoading ? (isSignUp ? '가입 중...' : '로그인 중...') : (
              <>{isSignUp ? '가입하기' : (isAdmin ? '관리자 로그인' : '로그인')} <ArrowRight size={20} /></>
            )}
          </button>

          {/* Google 로그인 (학생 전용, 가입 아닐 때) */}
          {!isAdmin && !isSignUp && (
            <button type="button" className="btn-secondary login-btn" onClick={handleGoogleLogin} disabled={isLoading}
              style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}>
              <Sparkles size={18} color="#60a5fa" style={{ marginRight: '8px' }} />
              Google 계정으로 계속하기
            </button>
          )}

          <div className="login-footer-links">
            <button type="button" className="text-link" onClick={() => { setIsResetMode(true); setErrorMsg(''); setSuccessMsg(''); }}>
              비밀번호 찾기
            </button>
            <span className="divider">|</span>
            <button type="button" className="text-link highlight" onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
              setEmailSent(false);
            }}>
              {isSignUp ? '로그인하러 가기' : '회원가입'}
            </button>
          </div>

          {isAdmin && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.3rem', lineHeight: '1.5' }}>
              ⚠️ 관리자 인증코드는 본사에서 발급받으실 수 있습니다.
            </p>
          )}
        </form>

        {/* 🔑 슈퍼패스 통합관리자 모드 */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {!showSuperPass ? (
            <button
              type="button"
              onClick={() => setShowSuperPass(true)}
              style={{
                background: 'transparent',
                border: '1px dashed rgba(255,255,255,0.15)',
                color: '#64748b',
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              🔑 통합관리자 모드
            </button>
          ) : (
            <form onSubmit={handleSuperPass} style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '16px',
              padding: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 'bold' }}>
                🔑 통합관리자 슈퍼패스
              </div>
              <input
                type="password"
                placeholder="관리자 인증번호 입력"
                value={superPassInput}
                onChange={(e) => setSuperPassInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {superPassError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{superPassError}</div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  잠금 해제
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSuperPass(false); setSuperPassError(''); }}
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="login-bottom-footer" style={{ marginTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', lineHeight: '1.6', zIndex: 10 }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>© {new Date().getFullYear()} KS BrainTech. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</Link>
            <span style={{ color: '#475569' }}>·</span>
            <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</Link>
            <span style={{ color: '#475569' }}>·</span>
            <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none' }}>Refund</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
