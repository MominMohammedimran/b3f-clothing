
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFormContainerProps {
  mode?: 'signin' | 'signup';
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ mode = 'signin' }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    // SignUp success handling is done in the SignUpForm component
    navigate('/signin');
  };

  const handleSignIn = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      if (authData.user) {
        toast.success('Signed in successfully!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50  px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {currentMode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>

        {currentMode === 'signin' ? (
          <Card>
            <CardContent className="pt-6">
              <LoginForm onSubmit={handleSignIn} loading={loading} />
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setCurrentMode('signup')}
                  >
                    Sign up
                  </Button>
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <SignUpForm onSuccess={handleSignUp} />
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={() => setCurrentMode('signin')}
                >
                  Sign in
                </Button>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFormContainer;