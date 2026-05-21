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
        createdAt: dbUser.created_at
      };

      localStorage.setItem('mentos_mock_user', JSON.stringify(legacyUser));
      if (isPaid) {
        localStorage.setItem('mentos_is_paid', 'true');
      } else {
        // Keep existing payment status from local storage if any, otherwise default to false
        const localPaid = localStorage.getItem('mentos_is_paid') === 'true';
        if (localPaid) {
          // Sync existing payment back to Supabase metadata in background
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
      setSession(activeSession);
      setUser(activeSession?.user ?? null);
      syncToLocalStorage(activeSession);
      setLoading(false);
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log(`[Supabase Auth Event] ${event}`);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      syncToLocalStorage(newSession);
      setLoading(false);

      // Force storage event dispatch to trigger updates across multi-tabs/iframes if any
      window.dispatchEvent(new Event('storage'));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with Email/Password
  const signUpWithEmail = async (email, password, name, role = 'student') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          is_paid: false
        }
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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      updatePremiumStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
