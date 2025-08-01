
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from 'sonner';

interface OTPValidationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

const OTPValidation: React.FC<OTPValidationProps> = ({
  email,
  onVerify,
  onResend,
  onBack
}) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimeout > 0) {
      const timer = setTimeout(() => {
        setResendTimeout(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimeout]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await onVerify(otp);
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsSubmitting(true);
    try {
      await onResend();
      toast.success('New verification code sent');
      setResendTimeout(60);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to send new verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP input completion
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
  }, [otp]);

  // For development purposes only - show a test OTP
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const testToken = Math.floor(100000 + Math.random() * 900000).toString();
    }
  }, [email]);

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-medium">Enter verification code</h2>
      <p className="text-center text-sm text-gray-500">
        We've sent a 6-digit code to {email}
      </p>
      
      <div className="flex justify-center py-4">
        <InputOTP 
          maxLength={6} 
          value={otp} 
          onChange={setOtp}
          containerClassName="gap-2"
        >
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
        onClick={handleVerify}
        className="w-full"
        disabled={isSubmitting || otp.length < 6}
      >
        {isSubmitting ? 'Verifying...' : 'Verify Code'}
      </Button>
      
      <div className="flex justify-between text-sm">
        <button 
          type="button" 
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to login
        </button>
        <button 
          type="button" 
          onClick={handleResend} 
          className={`${canResend ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
          disabled={!canResend || isSubmitting}
        >
          {canResend ? 'Resend code' : `Resend in ${resendTimeout}s`}
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded-md">
          <p className="text-xs text-gray-500">
            <strong>Dev Mode:</strong> Check browser console for a test OTP you can use.
          </p>
        </div>
      )}
    </div>
  );
};

export default OTPValidation;
