
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toastWrapper';
import AdminOTPForm from '@/components/admin/AdminOTPForm';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Check if this user is an admin
        const { data: adminCheck } = await supabase.rpc('is_admin', {
          user_email: data.session.user.email
        });

        if (adminCheck) {
          navigate('/admin/dashboard');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if email exists in admin_users table
      const { data: adminExists, error: checkError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (!adminExists) {
        throw new Error('Email not found in admin records');
      }
        
      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: `${window.location.origin}/admin/dashboard`
        }
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent!', {
        description: `Please check ${email} for a verification link`
      });
      
      setIsVerifying(true);
    } catch (err: any) {
      console.error('OTP error:', err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    try {
      // In development mode, allow the default code "123456"
      if (process.env.NODE_ENV === 'development' && otp === '123456') {
        const { data: adminExists } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', email)
          .maybeSingle();
          
        if (adminExists) {
          // For the default code in dev, automatically sign in
          // Using email link since we removed password auth
          const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false // Don't create a new user if it doesn't exist
            }
          });
          
          if (error) throw error;
          
          toast.success('Admin verification successful');
          navigate('/admin/dashboard');
          return;
        }
      }
      
      // For real OTP verification
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink'
      });
      
      if (error) throw error;
      
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Invalid verification code');
      toast.error('Verification failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    return await handleSendOTP();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              {isVerifying ? 'Enter the verification code' : 'Sign in to your admin account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isVerifying ? (
              <AdminOTPForm 
                email={email} 
                onVerify={handleVerifyOTP}
                onResend={handleResendOTP}
                onBack={() => setIsVerifying(false)}
              />
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-md">
                    {error}
                  </div>
                )}
                
                <button 
                  onClick={handleSendOTP}
                  disabled={loading || !email}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
                
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                    <p className="font-medium">For development:</p>
                    <p>Default admin: <code className="bg-white px-1 py-0.5 rounded">b3fprintingsolutions@gmail.com</code></p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
