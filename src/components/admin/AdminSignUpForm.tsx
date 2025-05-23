
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkPasswordStrength } from '@/utils/securityUtils';
import { supabase } from '@/integrations/supabase/client';
import PasswordStrengthIndicator from '../auth/PasswordStrengthIndicator';

const AdminSignUpForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Check password strength
    const strengthResult = checkPasswordStrength(password);
    if (strengthResult.strength === 'weak') {
      toast.error(strengthResult.message);
      return;
    }
    
    setLoading(true);
    
    try {
      // First check if email already exists in admin_users
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingAdmin) {
        toast.error('An admin with this email already exists');
        setLoading(false);
        return;
      }
      
      // Sign up admin user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            is_admin: true
          }
        }
      });
      
      if (error) throw error;
      
      // Create admin record
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({ email });
        
      if (adminError) throw adminError;
      
      toast.success('Admin account created successfully!');
      navigate('/admin/login');
    } catch (error: any) {
      console.error('Admin signup error:', error);
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-blue-900 text-white rounded-t-lg">
        <CardTitle className="text-center text-xl">Admin Sign Up</CardTitle>
        <CardDescription className="text-center text-gray-200">
          Create a new administrator account
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            {password && <PasswordStrengthIndicator password={password} />}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/admin/login"
            className="text-blue-600 hover:underline"
          >
            Sign In
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AdminSignUpForm;
