import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import OTPValidation from './OTPValidation';
import { checkPasswordStrength } from '@/utils/securityUtils';

type AuthMode = 'signin' | 'signup' | 'otp';

interface AuthFormProps {
  initialMode?: AuthMode;
  redirectTo?: string;
}

export function AuthForm({ initialMode = 'signin', redirectTo = '/' }: AuthFormProps) {
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
        const { data, error } = await signIn(email, password);
        if (error) {
          console.error("Sign-in failed:", error.message);
          toast.error(error.message || 'Sign in failed');
          await handleSendOTP();
        } else {
          toast.success('Sign in successful!');
          navigate(redirectTo);
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        
        const strengthResult = checkPasswordStrength(password);
        if (strengthResult.strength === 'weak') {
          toast.error(strengthResult.message);
          setLoading(false);
          return;
        }
        
        const { data, error } = await signUp(email, password);
        if (error) {
          toast.error(error.message || 'Sign up failed');
        } else {
          toast.success('Account created! Verification email sent.');
          await handleSendOTP();
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
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

  const verifyOtpWithEmail = async (token: string) => {
    console.log('Verifying OTP for email:', email);
    try {
      return await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
    } catch (error) {
      console.error('Error in verifyOtpWithEmail:', error);
      throw error;
    }
  };
  
  const handleVerifyOtp = async (token: string) => {
    setLoading(true);
    try {
      console.log(`Attempting to verify OTP for ${email} with token: ${token}`);
      const { error } = await verifyOtpWithEmail(token);
      if (error) {
        throw error;
      } else {
        toast.success('Verification successful!');
        navigate(redirectTo);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'signin' && (
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendOTP();
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Sign in with OTP instead
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {mode === 'signup' && password && (
              <PasswordStrengthIndicator password={password} />
            )}
          </div>
          
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            {mode === 'signin' ? (
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('signup');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Create one
                </a>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('signin');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Sign in
                </a>
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
