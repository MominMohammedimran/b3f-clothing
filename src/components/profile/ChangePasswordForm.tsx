
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSupabaseClient } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'password' | 'otp' | 'success'>('password');
  const [userEmail, setUserEmail] = useState('');
  const supabase = useSupabaseClient();

  const validatePasswordForm = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return false;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        throw new Error('User not found');
      }

      setUserEmail(user.email);

      // Try to verify current password by attempting a sign in
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }
      } catch (error: any) {
        throw new Error('Current password is incorrect');
      }

      // For demo purposes, we'll skip actual OTP and move directly to password update
      // In production, you would send actual OTP via email
      setStep('otp');
      toast.success('Moving to verification step');
    } catch (error: any) {
      console.error('Error in password verification:', error);
      toast.error(error.message || 'Failed to verify current password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!otp) {
      toast.error('Please enter verification code');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      // For demo purposes, accept any 6-digit code
      if (otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }

      // Update password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update the profiles table if needed
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Could not update profile timestamp:', profileError);
        }
      }

      setStep('success');
      toast.success('Password changed successfully!');
      
      // Reset form after a delay
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
        setStep('password');
      }, 3000);

    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('password');
    setOtp('');
    setIsLoading(false);
  };

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Success!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">Your password has been changed successfully.</p>
          <Button 
            onClick={() => setStep('password')}
            className="w-full"
          >
            Change Another Password
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Enter Verification Code</h3>
          <p className="text-sm text-gray-600 mt-2">
            We've verified your current password for {userEmail}
          </p>
        </div>

        <div>
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg tracking-wider"
          />
          <p className="text-xs text-gray-500 mt-1">
            For testing purposes, enter any 6-digit code (e.g., 123456)
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleChangePassword} 
            disabled={isLoading || otp.length !== 6}
            className="flex-1"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Change Password</h3>
      
      <div>
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Enter your current password"
        />
      </div>

      <div>
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Enter new password (min 6 characters)"
        />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="Confirm new password"
        />
      </div>

      <Button 
        onClick={handleSendOtp} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Verifying...' : 'Verify Current Password'}
      </Button>
    </div>
  );
};

export default ChangePasswordForm;
