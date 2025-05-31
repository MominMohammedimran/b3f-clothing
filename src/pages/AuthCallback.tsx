
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserProfile, currentUser } = useAuth();
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.error('Auth callback started');
        
        if (!supabase) {
          console.error('Supabase client not initialized');
          toast({
            title: "Error",
            description: 'Authentication service not available',
            variant: 'destructive'
          });
          navigate('/signin');
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          toast({
            title: "Authentication error",
            description: error.message,
            variant: 'destructive'
          });
          navigate('/signin');
          return;
        }

        const isAdminAuth = location.search.includes('admin=true');

        if (session) {
          console.error('Authentication successful, session established');
          
          if (refreshUserProfile) {
            await refreshUserProfile();
          }
          
          setMessage('Authentication successful! Redirecting...');
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (!profile) {
            console.error('Creating profile for new user');
            
            await supabase.from('profiles').insert({
              id: session.user.id,
              email: session.user.email,
              first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
              last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
              avatar_url: session.user.user_metadata?.avatar_url || '',
              display_name: session.user.user_metadata?.full_name || '',
              reward_points: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          
          if (isAdminAuth) {
            const { data: adminUser } = await supabase
              .from('admin_users')
              .select('*')
              .eq('email', session.user.email)
              .maybeSingle();
              
            if (adminUser) {
              console.error('Admin user authenticated');
              localStorage.setItem('adminLoggedIn', 'true');
              toast({
                title: "Success",
                description: 'Successfully signed in as admin!',
                variant: 'success'
              });
              navigate('/admin/dashboard');
              return;
            } else {
              try {
                await supabase.from('admin_users').insert({
                  email: session.user.email
                });
                localStorage.setItem('adminLoggedIn', 'true');
                toast({
                  title: "Success",
                  description: 'New admin account created and signed in!',
                  variant: 'success'
                });
                navigate('/admin/dashboard');
                return;
              } catch (error) {
                console.error('Failed to create admin user:', error);
                toast({
                  title: "Error",
                  description: 'You do not have admin privileges',
                  variant: 'destructive'
                });
                navigate('/');
                return;
              }
            }
          }
          
          toast({
            title: "Success",
            description: 'Successfully signed in!',
            variant: 'success'
          });
          
          navigate('/');
        } else {
          console.error('No session found after auth callback');
          setMessage('Awaiting email verification...');
          toast({
            title: "Email verification",
            description: 'Please check your email to verify your account'
          });
          navigate('/signin');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        toast({
          title: "Authentication error",
          description: 'An error occurred during authentication',
          variant: 'destructive'
        });
        navigate('/signin');
      }
    };

    handleAuthCallback();
  }, [navigate, refreshUserProfile, location.search]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xl font-medium text-gray-700">{message}</p>
    </div>
  );
};

export default AuthCallback;
