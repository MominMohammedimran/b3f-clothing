
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SignUpForm from '../components/auth/SignUpForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
        navigate('/signin');
      }
    } catch (error) {
      toast.error('An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          </div>
          <SignUpForm onSubmit={handleSignUp} loading={loading} />
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
