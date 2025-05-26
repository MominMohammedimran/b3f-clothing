import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/utils/toastWrapper';

export const useSupabaseClient = () => {
  return supabase;
};

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
};

export const useAdminStatus = (userEmail: string | undefined | null) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!userEmail) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Use the is_admin function with proper parameter name
        const { data, error } = await supabase.rpc('is_admin', 
          { user_email: userEmail }
        );

        if (error) {
          throw error;
        }

        setIsAdmin(!!data);
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message || 'Failed to check admin status');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [userEmail]);

  return { isAdmin, loading, error };
};

// Add admin login verification function to use hashed_password
export const verifyAdminLogin = async (email: string, password: string) => {
  try {
    // Type assertion to bypass TypeScript's type checking for RPC functions
    const { data, error } = await supabase.rpc(
      'verify_admin_login' as any, 
      {
        input_email: email,
        input_password: password
      }
    );

    if (error) throw error;
    return { success: !!data, error: null };
  } catch (error: any) {
    console.error('Admin login verification failed:', error);
    return { success: false, error: error.message || 'Verification failed' };
  }
};

export default useSupabaseClient;
