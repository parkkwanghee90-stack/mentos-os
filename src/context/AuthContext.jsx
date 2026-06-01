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
      const isPaid = dbUser.user_metadata?.is_paid === true;

      const legacyUser = {
        id: dbUser.id,
        name: dbUser.user_metadata?.name || dbUser.email.split('@')[0],
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
      } else {
        const localPaid = localStorage.getItem('mentos_is_paid') === 'true';
        if (localPaid) {
          updatePremiumStatus(true);
        }
      }
    } else {
      localStorage.removeItem('mentos_mock_user');
      localStorage.removeItem('mentos_is_paid');
    }
  };

  useEffect(() => {
    // 1. Check initial active session
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (activeSession) {
        setSession(activeSession);
        setUser(activeSession.user);
        syncToLocalStorage(activeSession);
      }
      setLoading(false);
    }).catch(() => {
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
      subscription.unsubscribe();
    };
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

  // Google OAuth Login
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
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
    if (!adminSecret || code !== adminSecret) return false;
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

  // Update Premium Status in Supabase User Metadata
  const updatePremiumStatus = async (status) => {
    if (!user) return;
    const { data, error } = await supabase.auth.updateUser({
      data: { is_paid: status }
    });
    if (error) {
      console.error("Failed to sync premium status to Supabase metadata:", error);
    } else {
      console.log("Supabase premium status metadata synchronized:", status);
      if (status) {
        localStorage.setItem('mentos_is_paid', 'true');
      } else {
        localStorage.removeItem('mentos_is_paid');
      }
      window.dispatchEvent(new Event('storage'));
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
      signInWithGoogle,
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
