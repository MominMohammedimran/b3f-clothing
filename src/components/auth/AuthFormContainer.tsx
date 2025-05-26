import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import OTPValidation from './OTPValidation';
import { useAuth } from '@/context/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { cleanupAuthState } from '@/context/AuthContext';

type AuthMode = 'signin' | 'signup' | 'otp';

interface AuthFormContainerProps {
  initialMode?: 'signin' | 'signup';
  redirectTo?: string;
  isAdmin?: boolean;
}

export const AuthFormContainer: React.FC<AuthFormContainerProps> = ({
  initialMode = 'signin',
  redirectTo = '/',
  isAdmin = false
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'signin') {
        // Clear any existing auth state first
        cleanupAuthState();
        
        // Check if email and password are provided
        if (!email || !password) {
          toast.error('Please enter both email and password');
          setLoading(false);
          return;
        }
        
        // Log for debugging
        console.log("Attempting sign-in with:", { email, passwordLength: password.length });
        
        // Attempt to sign in with provided credentials
        const { data, error } = await signIn(email, password);
        
        if (error) {
          console.error("Sign-in failed:", error.message);
          toast.error(error.message || 'Sign in failed. Please check your credentials.');
          setLoading(false);
          return;
        } 
        
        // If login is successful
        if (data && data.session) {
          console.log("Sign-in successful with session:", data.session.user.id);
          toast.success('Sign in successful!');
          navigate(redirectTo);
        } else {
          console.error("Sign-in response has no session:", data);
          toast.error('Unable to authenticate. Please try again.');
          setLoading(false);
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        
        const { data, error } = await signUp(email, password);
        if (error) {
          toast.error(error.message || 'Sign up failed');
          setLoading(false);
          return;
        } else {
          toast.success('Account created! Verification email sent.');
          setMode('otp');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      setLoading(false);
    } finally {
      if (mode === 'signin') {
        setLoading(false);
      }
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await sendOtpToEmail(email);
      if (error) {
        throw error;
      } else {
        toast.success('Verification code sent to your email');
        setMode('otp');
      }
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const sendOtpToEmail = async (email: string) => {
    console.log('Sending OTP to email:', email);
    
    try {
      const testToken = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Development test token for ${email}: ${testToken}`);
      
      return await supabase.auth.signInWithOtp({
        email,
      });
    } catch (error) {
      console.error('Error in sendOtpToEmail:', error);
      throw error;
    }
  };

  const handleVerifyOtp = async (token: string) => {
    setLoading(true);
    try {
      console.log(`Attempting to verify OTP for ${email} with token: ${token}`);
      
      // For development, accept a test token
      let authResult;
      
      if (process.env.NODE_ENV === 'development' && token === '123456') {
        console.log("Using development test token");
        
        // Create a mock session to simulate successful verification
        authResult = await supabase.auth.signInWithPassword({
          email,
          password: "password", // This won't be used in test mode
        });
      } else {
        authResult = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email'
        });
      }
      
      const { data, error } = authResult;
      
      if (error) {
        throw error;
      } else if (data && data.session) {
        console.log("OTP verification successful with session:", data.session.user.id);
        toast.success('Verification successful!');
        navigate(redirectTo);
      } else {
        console.error("OTP verification response has no session:", data);
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (mode === 'otp') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OTPValidation
            email={email}
            onVerify={handleVerifyOtp}
            onResend={handleSendOTP}
            onBack={() => setMode('signin')}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'signin' ? 'Enter your credentials to sign in' : 'Create a new account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'signin' ? (
          <LoginForm 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            handleSubmit={handleSubmit}
            handleSendOTP={handleSendOTP}
            loading={loading}
            setMode={setMode}
          />
        ) : (
          <SignupForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
            handleSubmit={handleSubmit}
            loading={loading}
            setMode={setMode}
          />
        )}
      </CardContent>
      {process.env.NODE_ENV === 'development' && (
        <CardFooter>
          <div className="w-full p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
            <p className="font-medium">For development testing:</p>
            <p>Email: <code className="bg-white px-1">test@example.com</code></p>
            <p>Password: <code className="bg-white px-1">Password123!</code></p>
            <p>OTP code: <code className="bg-white px-1">123456</code></p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
