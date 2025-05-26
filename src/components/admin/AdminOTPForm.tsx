
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Loader2 } from 'lucide-react';

interface AdminOTPFormProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

const AdminOTPForm: React.FC<AdminOTPFormProps> = ({
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
      setResendTimeout(60);
      setCanResend(false);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">Enter verification code</h2>
        <p className="text-gray-500 mt-2">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>
      
      <div className="flex justify-center py-4">
        <InputOTP 
          maxLength={6} 
          value={otp} 
          onChange={setOtp}
          containerClassName="gap-2"
          className="text-center"
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
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Code'
        )}
      </Button>
      
      <div className="flex justify-between items-center pt-2 text-sm">
        <Button
          type="button" 
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleResend} 
          variant="ghost"
          size="sm"
          disabled={!canResend || isSubmitting}
          className={canResend ? "text-blue-600 hover:text-blue-800" : "text-gray-400 cursor-not-allowed"}
        >
          {canResend ? 'Resend code' : `Resend in ${resendTimeout}s`}
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
          <p className="text-sm font-medium">For development:</p>
          <p className="text-sm">Use code: <code className="bg-white px-2 py-1 rounded">123456</code></p>
        </div>
      )}
    </div>
  );
};

export default AdminOTPForm;
