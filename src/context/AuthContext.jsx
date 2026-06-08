import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/services/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase Auth session to localStorage for backward compatibility
  const syncToLocalStorage = (currentSession) => {
    if (currentSession?.user) {
      const dbUser = currentSession.user;
      const isPaid = dbUser.user_metadata?.is_paid === true || dbUser.user_metadata?.premium === true;
      const isPremium = dbUser.user_metadata?.premium === true;
      const paidAt = dbUser.user_metadata?.paid_at || null;

      const legacyUser = {
        id: dbUser.id,
        name: dbUser.user_metadata?.name || dbUser.email?.split('@')[0] || '사용자',
        email: dbUser.email,
        role: dbUser.user_metadata?.role || 'student',
        school: dbUser.user_metadata?.school || '',
        grade: dbUser.user_metadata?.grade || '',
        mathGrade: dbUser.user_metadata?.math_grade || '',
        parentPhone: dbUser.user_metadata?.parent_phone || '',
        createdAt: dbUser.created_at
      };

      localStorage.setItem('mentos_mock_user', JSON.stringify(legacyUser));
      if (isPaid) {
        localStorage.setItem('mentos_is_paid', 'true');
        localStorage.setItem('mentos_premium', isPremium ? 'true' : 'false');
        if (paidAt) localStorage.setItem('mentos_paid_at', paidAt);
      } else {
        const localPaid = localStorage.getItem('mentos_is_paid') === 'true';
        if (localPaid) {
          updatePremiumStatus(true);
        }
      }
    } else {
      localStorage.removeItem('mentos_mock_user');
      localStorage.removeItem('mentos_is_paid');
      localStorage.removeItem('mentos_premium');
      localStorage.removeItem('mentos_paid_at');
    }
  };

  useEffect(() => {
    try {
      // 1. Check initial active session
      supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
          syncToLocalStorage(activeSession);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('[AuthContext] getSession error:', err);
        setLoading(false);
      });

      // 2. Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log(`[Supabase Auth Event] ${event}`);
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          syncToLocalStorage(newSession);
        } else {
          setSession(null);
          setUser(null);
          localStorage.removeItem('mentos_mock_user');
        }
        setLoading(false);
        window.dispatchEvent(new Event('storage'));
      });

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    } catch (err) {
      console.error('[AuthContext] Supabase initialization crashed synchronously:', err);
      setLoading(false);
    }
  }, []);

  // Sign up with Email/Password — Supabase 표준 방식 (이메일 확인 링크 전송)
  const signUpWithEmail = async (email, password, name, role = 'student', school = '', grade = '', mathGrade = '', parentPhone = '') => {
    console.log(`[AuthContext] Signing up user via standard Supabase Auth: ${email}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          is_paid: false,
          school,
          grade,
          math_grade: mathGrade,
          parent_phone: parentPhone
        },
        emailRedirectTo: `${window.location.origin}/login?verified=true`
      }
    });
    if (error) throw error;
    return data;
  };

  // Sign in with Email/Password
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // 비밀번호 재설정 이메일 전송
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=true`
    });
    if (error) throw error;
    return data;
  };

  // 관리자 코드 검증 → role 업데이트
  const verifyAdminCode = async (code) => {
    const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
    if (!adminSecret) {
      console.warn('[AuthContext] VITE_ADMIN_SECRET가 설정되지 않아 관리자 코드 인증이 비활성화되어 있습니다. .env에 값을 설정하세요.');
      return false;
    }
    if (code !== adminSecret) return false;
    const { error } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    if (error) {
      console.error('[AuthContext] Admin role update failed:', error);
      return false;
    }
    // Refresh user state
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUser(data.user);
    return true;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    localStorage.removeItem('mentos_mock_user');
    localStorage.removeItem('mentos_is_paid');
    window.dispatchEvent(new Event('storage'));
  };

  // Update Premium Status in Supabase User Metadata (premium=true & paid_at=현재시간)
  const updatePremiumStatus = async (status) => {
    if (!user) return;
    const now = new Date().toISOString();
    
    // 원장님 요청: premium=true 및 paid_at=현재시간 자동 업데이트
    const { data, error } = await supabase.auth.updateUser({
      data: { 
        is_paid: status,
        premium: status,
        paid_at: status ? now : null
      }
    });

    if (error) {
      console.error("Failed to sync premium status to Supabase metadata:", error);
    } else {
      console.log("Supabase premium status metadata synchronized:", status);
      if (status) {
        localStorage.setItem('mentos_is_paid', 'true');
        localStorage.setItem('mentos_premium', 'true');
        localStorage.setItem('mentos_paid_at', now);
      } else {
        localStorage.removeItem('mentos_is_paid');
        localStorage.removeItem('mentos_premium');
        localStorage.removeItem('mentos_paid_at');
      }
      window.dispatchEvent(new Event('storage'));

      // Profiles 테이블도 동시 반영 승인 (존재한다면)
      try {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ 
            is_paid: status,
            premium: status,
            paid_at: status ? now : null
          })
          .eq('id', user.id);
        if (profileErr) console.warn("Optional profiles update bypassed:", profileErr.message);
      } catch (e) { /* ignore if profiles schema doesn't match */ }
    }
    return data;
  };

  // Update student school, grade, mathGrade
  const updateStudentInfo = async (school, grade, mathGrade) => {
    if (!user) return;
    console.log(`[AuthContext] Updating user student metadata...`);
    
    const { data, error } = await supabase.auth.updateUser({
      data: { school, grade, math_grade: mathGrade }
    });
    
    if (error) {
      console.error("Failed to update student info:", error);
      throw error;
    } else {
      setUser(data.user);
      const localUserJson = localStorage.getItem('mentos_mock_user');
      if (localUserJson) {
        try {
          const localUser = JSON.parse(localUserJson);
          localUser.school = school;
          localUser.grade = grade;
          localUser.mathGrade = mathGrade;
          localStorage.setItem('mentos_mock_user', JSON.stringify(localUser));
        } catch (e) { /* ignore */ }
      }
      window.dispatchEvent(new Event('storage'));
      return data;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUpWithEmail,
      signInWithEmail,
      signOut,
      resetPassword,
      verifyAdminCode,
      updatePremiumStatus,
      updateStudentInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
