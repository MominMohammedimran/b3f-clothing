
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSupabaseClient } from '@/hooks/useSupabase';
import { verifyDefaultToken } from '@/utils/verificationUtils';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useSupabaseClient();

  const handleSendOtp = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User not found');
      }

      // Send password reset email with OTP
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      setShowOtpInput(true);
      toast.success('OTP sent to your email');
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP (using default token for development)
      const isValidOtp = verifyDefaultToken(otp);
      
      if (!isValidOtp) {
        toast.error('Invalid OTP');
        return;
      }

      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setShowOtpInput(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

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
        />
      </div>

      {showOtpInput && (
        <div>
          <Label htmlFor="otp">Enter OTP (use 123456 for testing)</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={isLoading}
            placeholder="Enter 6-digit OTP"
          />
        </div>
      )}

      <div className="flex gap-2">
        {!showOtpInput ? (
          <Button onClick={handleSendOtp} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Button>
        ) : (
          <Button onClick={handleChangePassword} disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordForm;
