
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/utils/toastWrapper'; // Use the fixed toast wrapper
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { initializeAdmin } from '@/utils/adminAuth';
import { Loader2 } from 'lucide-react';

interface AdminEmailVerificationProps {
  email: string;
  password: string;
  onVerified: () => void;
  onBack: () => void;
}

const AdminEmailVerification: React.FC<AdminEmailVerificationProps> = ({
  email,
  password,
  onVerified,
  onBack
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error('Please enter a valid verification code');
      return;
    }
    
    try {
      setLoading(true);
      
      // For development, use default code "123456" and manually verify
      if (verificationCode === '123456') {
        // Sign in the user now that we're treating the email as verified
        console.log('Starting signInWithPassword');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        console.log('signInWithPassword done', signInData, signInError);
        
        if (signInError) throw signInError;
        
        const userId = signInData.user?.id;
        if (!userId) throw new Error('Failed to get user ID');
        
        // Initialize admin in database
        await initializeAdmin(userId, email);
        
        toast.success('Admin account verified and initialized successfully');
        onVerified();
        return;
      }
      
      // If not using development code, verify with Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });
      
      if (error) throw error;
      
      // Sign in the user after verification
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) throw signInError;
      
      const userId = signInData.user?.id;
      if (userId && email === 'b3fprintingsolutions@gmail.com') {
        // Initialize admin in database for the default admin email
        await initializeAdmin(userId, email);
      }
      
      toast.success('Email verified successfully');
      onVerified();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResendLoading(true);
      
      // For development, offer available options
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent again');
    } catch (error: any) {
      console.error('Error resending code:', error);
      toast.error(error.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md p-4">
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2">Verify Admin Email</h1>
            <p className="text-gray-600">
              Please enter the verification code sent to<br /><strong>{email}</strong>
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-center py-4">
              <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={onBack}
                disabled={loading || resendLoading}
              >
                Back
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResendCode}
                disabled={loading || resendLoading}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
              <p className="text-sm font-medium">For development:</p>
              <p className="text-sm">Use code: <code className="bg-white px-2 py-1 rounded">123456</code></p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailVerification;
