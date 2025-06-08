
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SignUpForm from '../components/auth/SignUpForm';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUpSuccess = () => {
    toast.success('Account created successfully! Please check your email for verification.');
    navigate('/signin');
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          </div>
          <SignUpForm onSuccess={handleSignUpSuccess} />
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;