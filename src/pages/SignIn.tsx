
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { AuthForm } from '../components/auth/AuthForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const SignIn = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  
  // Pre-select tab based on URL if there's a query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !loading) {
      const redirectTo = new URLSearchParams(location.search).get('redirectTo');
      // Use setTimeout to ensure the redirect happens after render
      setTimeout(() => {
        navigate(redirectTo || '/');
        toast.success('Successfully signed in!');
      }, 100);
    }
  }, [currentUser, loading, navigate, location]);

  const seoData = useSEO({
    title: 'Sign In to Your Account',
    description: 'Sign in to your B3F Prints account to access your designs, order history, and manage your custom products.',
    keywords: 'sign in, login, account access, user account'
  });

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      <div className="container mx-auto min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome</h1>
          
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <TabsContent value="signin">
                <AuthForm initialMode="signin" redirectTo="/" />
              </TabsContent>
              
              <TabsContent value="signup">
                <AuthForm initialMode="signup" redirectTo="/" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SignIn;
