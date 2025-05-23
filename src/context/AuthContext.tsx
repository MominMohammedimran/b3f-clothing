import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { verifyDefaultToken } from '../utils/verificationUtils';

// Cleanup utility for auth state
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('supabase-auth')) {
      localStorage.removeItem(key);
    }
  });
  // Remove session from sessionStorage if exists
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.includes('supabase-auth')) {
      sessionStorage.removeItem(key);
    }
  });
  // Remove admin session if it exists
  localStorage.removeItem('admin_session');
  localStorage.removeItem('adminLoggedIn');
  // Remove shipping address
  localStorage.removeItem('shippingAddress');
};

export interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  userProfile: any;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({}),
  signUp: async () => ({}),
  userProfile: null,
  refreshUserProfile: async () => {}
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Add signIn function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Signed in successfully');
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Add signUp function
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // Create a profile for the new user
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Improved signOut function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clean up all auth state
      cleanupAuthState();
      
      // Then sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Clear user data
      setCurrentUser(null);
      setSession(null);
      setUserProfile(null);
      
      toast.success('Signed out successfully');
      
      // Force page reload for a clean state
      window.location.href = '/signin';
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Error signing out: ' + (error.message || 'Unknown error'));
      
      // Try harder to clean up state if signout fails
      setCurrentUser(null);
      setSession(null);
      setUserProfile(null);
      cleanupAuthState();
      
      // Force redirect
      window.location.href = '/signin';
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add refreshUserProfile function
  const refreshUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error in refreshUserProfile:', error);
    }
  };

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
        setCurrentUser(activeSession?.user ?? null);
        
        if (activeSession?.user) {
          // Defer profile fetching to prevent deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', activeSession.user.id)
                .maybeSingle();
                
              if (!error) {
                setUserProfile(profile);
              } else {
                // Try to create profile if it doesn't exist
                try {
                  await supabase.from('profiles').insert({
                    id: activeSession.user.id,
                    email: activeSession.user.email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                  
                  // Fetch the newly created profile
                  const { data: newProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', activeSession.user.id)
                    .maybeSingle();
                    
                  setUserProfile(newProfile);
                } catch (createError) {
                  console.error('Error creating profile:', createError);
                }
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event);
      setSession(currentSession);
      setCurrentUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Defer data fetching to prevent deadlocks
        setTimeout(async () => {
          try {
            // Check if profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .maybeSingle();
              
            // Create profile if it doesn't exist
            if (!profile) {
              try {
                await supabase.from('profiles').insert({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
                const { data: newProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', currentSession.user.id)
                  .maybeSingle();
                  
                setUserProfile(newProfile);
              } catch (error) {
                console.error('Error creating profile:', error);
              }
            } else {
              setUserProfile(profile);
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
          }
        }, 0);
      } else {
        setUserProfile(null);
      }
    });

    // THEN check for existing session
    getSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    session,
    loading,
    signOut,
    signIn,
    signUp,
    userProfile,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
