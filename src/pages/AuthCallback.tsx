
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from '@/utils/toastWrapper'; // Use the fixed toast wrapper

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Check for error
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (errorParam) {
          toast.error('Authentication error', {
            description: errorDescription || 'Failed to complete authentication'
          });
          setError(errorDescription || 'Authentication failed');
          setLoading(false);
          // Redirect to sign-in after a delay
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
          return;
        }
        
        // Check if we have tokens from OAuth providers
        if (accessToken && refreshToken) {
          // Set session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            throw error;
          }
          
          // Check if user exists in the database
          if (data.user) {
            try {
              // Check if user has a profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
              // Create profile if not exists
              if (!profile) {
                await supabase.from('profiles').insert({
                  id: data.user.id,
                  email: data.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  display_name: data.user?.user_metadata?.full_name || '',
                  avatar_url: data.user?.user_metadata?.avatar_url || ''
                });
              }
            } catch (profileError) {
              // Continue even if profile creation has an error
              console.error('Error creating/checking profile:', profileError);
            }
          }
          
          toast.success('Successfully signed in!');
          navigate('/');
          return;
        }
        
        // Handle email confirmation if that's what we're doing
        if (type === 'email_confirmation') {
          toast.success('Email successfully confirmed');
        } else if (type === 'recovery') {
          toast.success('Password recovery successful');
        } else if (type === 'signup') {
          toast.success('Signup successful');
        } else if (type === 'magiclink') {
          toast.success('Magic link login successful');
        }
        
        // Default redirect to home
        navigate('/');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        toast.error('Authentication error');
        setError(err.message || 'Authentication failed');
        
        // Redirect to sign-in after a delay
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <h1 className="text-xl font-semibold">Completing authentication...</h1>
        <p className="text-gray-600 mt-2">Please wait while we verify your credentials</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Authentication Error</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <p className="text-gray-500 mt-2">Redirecting you to the sign-in page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
      <h1 className="text-xl font-semibold">Redirecting...</h1>
    </div>
  );
};

export default AuthCallback;
