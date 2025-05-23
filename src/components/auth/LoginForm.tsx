
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSendOTP: () => Promise<void>;
  loading: boolean;
  setMode: (mode: 'signin' | 'signup' | 'otp') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  togglePasswordVisibility,
  handleSubmit,
  handleSendOTP,
  loading,
  setMode
}) => {
  return (
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
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      
      <div className="text-center">
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
      </div>
    </form>
  );
};

export default LoginForm;
