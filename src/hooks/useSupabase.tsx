import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { toast } from '@/utils/toastWrapper';
import { supabase as supabaseClient } from "../integrations/supabase/client";

// Create a Supabase client context
const SupabaseContext = createContext<SupabaseClient | null>(null);

// Provider component
export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSupabase = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        toast.error('Failed to connect to database');
      } finally {
        setLoading(false);
      }
    };

    initSupabase();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={supabaseClient}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook for using Supabase client
export const useSupabaseClient = () => {
  const context = useContext(SupabaseContext);
  return context;
};

// Generate random 6-digit token
const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hook for authentication
export const useAuth = () => {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Check if user profile exists
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();
              
              setUserProfile(profile || null);
              
              if (!profile && !error) {
                // Create profile if it doesn't exist
                await supabase.from('profiles').insert({
                  id: currentUser.id,
                  email: currentUser.email,
                  display_name: currentUser.user_metadata?.full_name || '',
                  first_name: currentUser.user_metadata?.first_name || '',
                  last_name: currentUser.user_metadata?.last_name || '',
                  avatar_url: currentUser.user_metadata?.avatar_url || '',
                });
              }
            } catch (error) {
              // Error handling without console.log
            }
          }, 0);
        }
        
        setLoading(false);
        
        // Show toast notification on sign-in
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully!');
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          setUserProfile(null);
        }
      }
    );
    
    // Get initial user
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          
          setUserProfile(profile || null);
        } catch (error) {
          // Handle error silently
        }
      }
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  return {
    user,
    currentUser: user, // Alias for consistency with AuthContext
    userProfile,
    loading,
    signIn: async (email: string, password: string) => {
      if (!supabase) return { error: { message: 'Supabase client not initialized' } };
      try {
        // First check if user exists
        const { data: userExists, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking if user exists:', checkError);
        }
        
        // If user doesn't exist, show clear message
        if (!userExists) {
          toast.error('Email is not registered', {
            description: 'Please create an account first.'
          });
          return { error: { message: 'Email is not registered' } };
        }
        
        // If user exists, attempt to sign in
        const response = await supabase.auth.signInWithPassword({ email, password });
        if (response.error) throw response.error;
        return response;
      } catch (error) {
        toast.error('Failed to sign in. Please check your credentials.');
        return { error };
      }
    },
    signInWithOtp: async (email: string) => {
      if (!supabase) return { error: { message: 'Supabase client not initialized' } };
      
      try {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        
        toast.success(`Verification email sent to ${email}`);
        return { data, error: null };
      } catch (error) {
        toast.error('Failed to send verification email');
        return { error };
      }
    },
    signUp: async (email: string, password: string) => {
      if (!supabase) return { error: { message: 'Supabase client not initialized' } };
      
      try {
        const response = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (response.error) throw response.error;
        
        toast.success('Sign-up successful! Check your email for verification.');
        return response;
      } catch (error) {
        toast.error('Failed to sign up. Please try again.');
        return { error };
      }
    },
    signOut: async () => {
      if (!supabase) return { error: { message: 'Supabase client not initialized' } };
      return await supabase.auth.signOut();
    },
    refreshSession: async () => {
      if (!supabase) return { error: { message: 'Supabase client not initialized' } };
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { error };
      }
    }
  };
};
