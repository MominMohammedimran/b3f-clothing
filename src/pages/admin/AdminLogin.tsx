import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import AdminOTPForm from '@/components/admin/AdminOTPForm';
import { User } from '@supabase/supabase-js';
import { ensureMainAdminExists, DEFAULT_ADMIN_PERMISSIONS } from '@/utils/adminAuth';

interface AdminRecord {
  id: string;
  email: string;
  user_id?: string;
  role?: string;
  permissions?: string[];
}

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [usePasswordLogin, setUsePasswordLogin] = useState(false);
  const navigate = useNavigate();

  const isMainAdmin = email.trim().toLowerCase() === 'b3fprintingsolutions@gmail.com';

  useEffect(() => {
    checkSession();
    ensureMainAdminExists().catch(console.error);
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (admin) navigate('/admin/dashboard');
    }
  };

  const storeAdminLocally = (admin: AdminRecord, userId: string) => {
    localStorage.setItem('adminRole', admin.role || 'admin');
    localStorage.setItem('adminId', userId);
    localStorage.setItem('adminPermissions', JSON.stringify(admin.permissions || DEFAULT_ADMIN_PERMISSIONS));
  };

  const createOrUpdateAdmin = async (user: User) => {
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();

    if (existingAdmin) {
      if (!existingAdmin.user_id) {
        await supabase
          .from('admin_users')
          .update({ user_id: user.id })
          .eq('id', existingAdmin.id);
      }
      return existingAdmin;
    }

    if (isMainAdmin) {
      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert({
          email: user.email,
          role: 'super_admin',
          permissions: DEFAULT_ADMIN_PERMISSIONS,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newAdmin;
    }

    throw new Error('User is not authorized as admin');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw error || new Error('No user returned');

      const admin = await createOrUpdateAdmin(data.user);
      storeAdminLocally(admin, data.user.id);

      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) return setError('Email is required');

    setLoading(true);
    setError(null);

    try {
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!admin && !isMainAdmin) throw new Error('User is not authorized as admin');

      if (isMainAdmin && !admin) {
        await supabase.from('admin_users').insert({
          email,
          role: 'super_admin',
          permissions: DEFAULT_ADMIN_PERMISSIONS,
        });
      }

      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;

      toast.success('Verification code sent to your email');
      setIsOtpMode(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error || !data.user) throw error || new Error('OTP failed');

      const admin = await createOrUpdateAdmin(data.user);
      storeAdminLocally(admin, data.user.id);

      toast.success('Verification successful!');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {isOtpMode ? (
            <AdminOTPForm
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleSendOTP}
              onBack={() => setIsOtpMode(false)}
            />
          ) : (
            <AdminLoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              error={error}
              loading={loading}
              usePasswordLogin={usePasswordLogin}
              setUsePasswordLogin={setUsePasswordLogin}
              handleLogin={handleLogin}
              handleSendOTP={handleSendOTP}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
