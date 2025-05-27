
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useSupabaseClient } from '@/hooks/useSupabase';
import { verifyDefaultToken } from '@/utils/verificationUtils';

interface VerificationFormProps {
  userEmail: string;
  userPassword: string;
  userData: { firstName: string; lastName: string } | null;
  onBack: () => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ 
  userEmail, 
  userPassword, 
  userData, 
  onBack 
}) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid verification code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!supabase) {
        throw new Error('Authentication service not available');
      }
      
      // For development: always accept the default token "123456"
      const isValidToken = otp === "123456";
      
      if (!isValidToken) {
        throw new Error('Invalid verification code');
      }
      
      // Sign in the user with email and password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      });
      
      if (signInError) throw signInError;
      
      // Update profile if needed
      if (signInData.user && userData) {
        await supabase.from('profiles').upsert({
          id: signInData.user.id,
          email: userEmail,
          first_name: userData.firstName,
          last_name: userData.lastName,
          display_name: `${userData.firstName} ${userData.lastName}`,
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success('Sign up successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-medium">Enter verification code</h2>
      <p className="text-center text-sm text-gray-500">
        We've sent a 6-digit code to your email
      </p>
      
      <div className="flex justify-center py-4">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
        onClick={handleVerifyOtp}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Verifying...' : 'Verify & Complete Sign Up'}
      </Button>
      
      <p className="text-center text-sm">
        Didn't receive code?{" "}
        <button 
          type="button" 
          onClick={onBack} 
          className="text-blue-600 font-medium"
        >
          Try Again
        </button>
      </p>
      <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
        <p className="text-sm font-medium">For development:</p>
        <p className="text-sm">Use code: <code className="bg-white px-2 py-1 rounded">123456</code></p>
      </div>
    </div>
  );
};

export default VerificationForm;
