import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { challengeMFA, verifyMFAChallenge, getPrimaryMFAFactor } from '../services/mfaService';
import type { MFAFactor } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaFactor: MFAFactor | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; mfaRequired?: boolean }>;
  signUp: (email: string, password: string, userData?: { firstName: string; lastName: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  verifyMFALogin: (code: string) => Promise<{ error: AuthError | null }>;
  cancelMFAChallenge: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactor, setMfaFactor] = useState<MFAFactor | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    // Check if MFA is required
    if (data.user && data.session) {
      try {
        const factor = await getPrimaryMFAFactor();
        if (factor) {
          // MFA is enabled, create a challenge
          const challenge = await challengeMFA(factor.id);
          setMfaRequired(true);
          setMfaFactor(factor);
          setMfaChallengeId(challenge.id);
          return { error: null, mfaRequired: true };
        }
      } catch (mfaError) {
        console.error('Error checking MFA:', mfaError);
        // Continue with normal login if MFA check fails
      }
    }

    return { error: null };
  };

  const signUp = async (email: string, password: string, userData?: { firstName: string; lastName: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData ? {
          first_name: userData.firstName,
          last_name: userData.lastName,
        } : undefined,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const verifyMFALogin = async (code: string) => {
    if (!mfaFactor || !mfaChallengeId) {
      return { error: { message: 'No MFA challenge active' } as AuthError };
    }

    try {
      await verifyMFAChallenge(mfaFactor.id, mfaChallengeId, code);
      // MFA verification successful, clear MFA state
      setMfaRequired(false);
      setMfaFactor(null);
      setMfaChallengeId(null);
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const cancelMFAChallenge = () => {
    setMfaRequired(false);
    setMfaFactor(null);
    setMfaChallengeId(null);
    // Sign out to clear any partial session
    supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    mfaRequired,
    mfaFactor,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyMFALogin,
    cancelMFAChallenge,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
