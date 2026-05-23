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
      if (activeSession) {
        setSession(activeSession);
        setUser(activeSession.user);
        syncToLocalStorage(activeSession);
      } else {
        // Fallback: Check local storage for mock user if no Supabase session exists
        const localUserJson = localStorage.getItem('mentos_mock_user');
        if (localUserJson) {
          try {
            const localUser = JSON.parse(localUserJson);
            setUser({
              id: localUser.id || 'demo_user',
              email: localUser.email || 'demo@mentos.com',
              user_metadata: {
                name: localUser.name || '데모학생',
                role: localUser.role || 'student',
                is_paid: localStorage.getItem('mentos_is_paid') === 'true'
              }
            });
          } catch (e) {
            localStorage.removeItem('mentos_mock_user');
          }
        }
      }
      setLoading(false);
    }).catch(() => {
      // Connection or client error: Load local mock session anyway
      const localUserJson = localStorage.getItem('mentos_mock_user');
      if (localUserJson) {
        try {
          const localUser = JSON.parse(localUserJson);
          setUser({
            id: localUser.id || 'demo_user',
            email: localUser.email || 'demo@mentos.com',
            user_metadata: {
              name: localUser.name || '데모학생',
              role: localUser.role || 'student',
              is_paid: localStorage.getItem('mentos_is_paid') === 'true'
            }
          });
        } catch (e) {
          localStorage.removeItem('mentos_mock_user');
        }
      }
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
        // Local auth could be active, only clear state if there is no local user in localStorage
        if (!localStorage.getItem('mentos_mock_user')) {
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);

      // Force storage event dispatch to trigger updates across multi-tabs/iframes if any
      window.dispatchEvent(new Event('storage'));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with Email/Password (Admin Auth bypass with Auto-Confirm)
  const signUpWithEmail = async (email, password, name, role = 'student') => {
    console.log(`[AuthContext] Creating auto-confirmed user via Admin API for ${email}...`);
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        is_paid: false
      }
    });
    if (adminError) throw adminError;
    
    console.log(`[AuthContext] Successfully created user! Logging in...`);
    // Immediately log the newly created confirmed user in
    const signInData = await signInWithEmail(email, password);
    return signInData;
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

  // Sign in as Demo Bypass Button (Bypass Supabase)
  const signInAsDemo = async (role = 'student', name = '데모학생', email = 'demo@mentos.com') => {
    const mockUser = {
      id: 'user_demo_' + Date.now(),
      name: role === 'admin' ? '데모관리자' : name,
      email: role === 'admin' ? 'admin_demo@mentos.com' : email,
      role: role,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('mentos_mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mentos_is_paid', 'true'); // Auto enable premium for easier trial
    setUser({
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: { name: mockUser.name, role: mockUser.role, is_paid: true }
    });
    return { user: mockUser };
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
      signInAsDemo,
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
