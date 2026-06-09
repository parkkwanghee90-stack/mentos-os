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
  // 계정 유형: student | parent | admin (학부모 추가 — 결제 등 보호자 전용 진입)
  const [accountType, setAccountType] = useState(
    location.state?.tab === 'admin' ? 'admin'
      : location.state?.tab === 'parent' ? 'parent'
      : 'student'
  );
  const isAdmin = accountType === 'admin';
  const isParent = accountType === 'parent';
  const isStudent = accountType === 'student';
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberId, setRememberId] = useState(false);

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

  // 슈퍼패스 인증번호는 환경변수(VITE_SUPER_PASS)에서만 주입한다. 코드에 하드코딩 금지. (main #5)
  // 환경변수가 설정된 경우에만 UI 노출 → 미설정 시 백도어 자체가 렌더되지 않음(프로덕션 기본 미노출).
  const SUPER_PASS = import.meta.env.VITE_SUPER_PASS;
  const SUPERPASS_ENABLED = !!SUPER_PASS;

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
        if (isStudent && !school.trim()) {
          setErrorMsg('학교명을 입력해 주세요.');
          setIsLoading(false);
          return;
        }
        if (isStudent && !parentPhone.trim()) {
          setErrorMsg('학부모 전화번호를 입력해 주세요. (수업 결과 알림 발송용)');
          setIsLoading(false);
          return;
        }
        if (isStudent && parentPhone.trim() && !/^01[016789]-?\d{3,4}-?\d{4}$/.test(parentPhone.trim())) {
          setErrorMsg('전화번호 형식이 올바르지 않습니다. (예: 010-0000-0000)');
          setIsLoading(false);
          return;
        }

        const nickname = username.split('@')[0] || (isParent ? '학부모' : '학생');
        const role = accountType; // student | parent | admin
        
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

        // 계정의 실제 역할 기준으로 분기 (학부모/관리자는 학생 온보딩 불필요)
        const meta = signedUser?.user_metadata || {};
        const acctRole = meta.role || accountType; // student | parent | admin
        const destByRole = acctRole === 'admin' ? '/admin'
          : acctRole === 'parent' ? '/parent/dashboard'
          : '/dashboard';
        if (acctRole === 'student' && (!meta.school || !meta.grade || !meta.math_grade)) {
          setSuccessMsg('학습 정보 설정이 필요합니다...');
          setTimeout(() => {
            setIsOnboarding(true);
            setSuccessMsg('');
          }, 800);
        } else {
          setSuccessMsg('로그인 성공! 이동 중...');
          setTimeout(() => {
            const from = location.state?.from?.pathname || destByRole;
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

  // ─── 메인 로그인/가입 화면 (login.png split 레이아웃) ───
  const features = [
    { icon: <Sparkles size={20} color="#7c3aed" />, title: '무료 체험 7일', sub: '모든 기능을 무료로 체험' },
    { icon: <Zap size={20} color="#7c3aed" />, title: '맞춤형 학습', sub: '개인별 최적화된 학습 경로' },
    { icon: <Shield size={20} color="#7c3aed" />, title: '전문 선생님', sub: '검증된 AI 튜터와 함께' },
  ];
  return (
    <div className="login-split">
      {/* LEFT: 브랜드 패널 */}
      <div className="login-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: '3rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(124,58,237,0.32)' }}>
            <Sparkles size={22} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>AVS 풀이</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px' }}>AI Math Tutor</div>
          </div>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 3.4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.28, margin: 0, color: '#0f172a' }}>
          AI와 함께<br />
          <span style={{ color: '#7c3aed' }}>수학 실력을<br />업그레이드하세요!</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.02rem', marginTop: '1.3rem', lineHeight: 1.6, maxWidth: 420 }}>
          지금 가입하고 맞춤형 학습의 놀라운 경험을 시작하세요.
        </p>
        <div style={{ display: 'flex', gap: '1.1rem', marginTop: '2.6rem', flexWrap: 'wrap' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 150 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{f.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: 로그인 폼 */}
      <div className="login-formside">
        <div className="login-card">
          <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            {isSignUp ? (isAdmin ? '관리자 회원가입' : isParent ? '학부모 회원가입' : '회원가입') : '로그인'}
          </h2>
          <p style={{ margin: '0 0 1.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            {isParent ? '자녀 학습 확인과 결제는 학부모 계정으로' : 'AVS 풀이와 모든 콘텐츠를 무제한으로'}
          </p>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.1rem', background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
            {[
              { key: 'student', label: '학생' },
              { key: 'parent', label: '학부모' },
              { key: 'admin', label: '관리자/원장' },
            ].map((t) => {
              const active = accountType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setAccountType(t.key); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ flex: 1, padding: '0.5rem 0.3rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap', background: active ? '#fff' : 'transparent', color: active ? '#7c3aed' : '#64748b', boxShadow: active ? '0 1px 3px rgba(15,23,42,0.08)' : 'none' }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {errorMsg && <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.7rem', borderRadius: 10, fontSize: '0.82rem', textAlign: 'center', marginBottom: '0.9rem' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.7rem', borderRadius: 10, fontSize: '0.82rem', textAlign: 'center', marginBottom: '0.9rem' }}>{successMsg}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="lsplit-input" aria-label="이메일 또는 아이디" type="text" placeholder="이메일 또는 아이디" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="lsplit-input" aria-label="비밀번호" type="password" placeholder={isSignUp ? '비밀번호 (8자리 이상)' : '비밀번호'} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {isSignUp && (
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="lsplit-input" aria-label="비밀번호 확인" type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
              </div>
            )}
            {isAdmin && (
              <div style={{ position: 'relative' }}>
                <Key size={18} color="#7c3aed" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="lsplit-input" aria-label="관리자 인증코드" type="password" placeholder="관리자 인증코드" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
              </div>
            )}
            {isSignUp && isStudent && (
              <>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input className="lsplit-input" aria-label="학교명" type="text" placeholder="학교명 (예: 서울고등학교)" value={school} onChange={(e) => setSchool(e.target.value)} required />
                </div>
                <input className="lsplit-input" style={{ paddingLeft: '0.95rem' }} type="tel" aria-label="학부모 전화번호" placeholder="학부모 전화번호 (010-0000-0000)" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                <select value={grade} aria-label="학년" onChange={(e) => setGrade(e.target.value)} className="lsplit-input" style={{ paddingLeft: '0.95rem', cursor: 'pointer' }}>
                  <option value="중학교 1학년">중학교 1학년</option><option value="중학교 2학년">중학교 2학년</option><option value="중학교 3학년">중학교 3학년</option>
                  <option value="고등학교 1학년">고등학교 1학년</option><option value="고등학교 2학년">고등학교 2학년</option><option value="고등학교 3학년">고등학교 3학년</option>
                </select>
                <select value={mathGrade} aria-label="수학 등급" onChange={(e) => setMathGrade(e.target.value)} className="lsplit-input" style={{ paddingLeft: '0.95rem', cursor: 'pointer' }}>
                  <option value="1등급">1등급 (최상위권)</option><option value="2등급">2등급 (상위권)</option><option value="3등급">3등급 (중상위권)</option><option value="4등급">4등급 (중위권)</option><option value="5등급">5등급 (중하위권)</option><option value="6등급">6등급</option><option value="7등급">7등급</option><option value="8등급">8등급</option><option value="9등급">9등급</option>
                </select>
              </>
            )}

            {!isSignUp && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberId} onChange={(e) => setRememberId(e.target.checked)} style={{ accentColor: '#7c3aed', width: 15, height: 15 }} />
                  아이디 저장
                </label>
                <button type="button" onClick={() => { setIsResetMode(true); setErrorMsg(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>비밀번호 찾기</button>
              </div>
            )}

            <button type="submit" className="lsplit-btn lsplit-btn--primary" disabled={isLoading} style={{ marginTop: '0.3rem', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? (isSignUp ? '가입 중...' : '로그인 중...') : (isSignUp ? '가입하기' : '로그인')}
            </button>
          </form>

          {!isSignUp && !isAdmin && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.2rem 0', color: '#cbd5e1', fontSize: '0.78rem' }}>
                <div style={{ flex: 1, height: 1, background: '#e4e8f1' }} /> 또는 <div style={{ flex: 1, height: 1, background: '#e4e8f1' }} />
              </div>
              <button type="button" className="lsplit-btn lsplit-btn--social" onClick={handleGoogleLogin} disabled={isLoading} style={{ marginBottom: '0.6rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                Google로 로그인
              </button>
              <button type="button" className="lsplit-btn lsplit-btn--kakao" onClick={() => { setSuccessMsg(''); setErrorMsg('카카오 로그인은 준비 중입니다. 이메일 또는 Google로 로그인해 주세요.'); }} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#181600"><path d="M12 3C6.5 3 2 6.48 2 10.77c0 2.78 1.86 5.21 4.65 6.58-.2.72-.73 2.64-.84 3.05-.13.5.18.5.39.36.16-.11 2.6-1.77 3.66-2.5.71.1 1.44.16 2.14.16 5.5 0 10-3.48 10-7.61C22 6.48 17.5 3 12 3z"/></svg>
                Kakao로 로그인
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.4rem', fontSize: '0.85rem', color: '#64748b' }}>
            {isSignUp ? '이미 계정이 있으신가요? ' : '아직 계정이 없으신가요? '}
            <button type="button" onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setSuccessMsg(''); setEmailSent(false); }} style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </div>

          {SUPERPASS_ENABLED && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            {!showSuperPass ? (
              <button type="button" onClick={() => setShowSuperPass(true)} style={{ background: 'transparent', border: '1px dashed #d4d9e3', color: '#94a3b8', padding: '0.4rem 0.9rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.74rem' }}>통합관리자 모드</button>
            ) : (
              <form onSubmit={handleSuperPass} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f5f3fe', border: '1px solid #ddd6fe', borderRadius: 12, padding: '0.9rem' }}>
                <input type="password" aria-label="관리자 인증번호" placeholder="관리자 인증번호" value={superPassInput} onChange={(e) => setSuperPassInput(e.target.value)} autoFocus className="lsplit-input" style={{ paddingLeft: '0.95rem' }} />
                {superPassError && <div style={{ color: '#dc2626', fontSize: '0.78rem' }}>{superPassError}</div>}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="submit" className="lsplit-btn lsplit-btn--primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.82rem' }}>잠금 해제</button>
                  <button type="button" onClick={() => { setShowSuperPass(false); setSuperPassError(''); }} className="lsplit-btn lsplit-btn--social" style={{ width: 70, padding: '0.6rem', fontSize: '0.82rem' }}>취소</button>
                </div>
              </form>
            )}
          </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.74rem' }}>
            <p style={{ margin: '0 0 0.4rem' }}>© {new Date().getFullYear()} Mentos AI. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms</Link>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy</Link>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <Link to="/refund" style={{ color: '#94a3b8', textDecoration: 'none' }}>Refund</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
