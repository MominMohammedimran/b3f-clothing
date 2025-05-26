
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Lock, Mail, Loader2 } from 'lucide-react';

interface AdminLoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  loading: boolean;
  usePasswordLogin: boolean;
  setUsePasswordLogin: (value: boolean) => void;
  handleLogin: (e: React.FormEvent) => void;
  handleSendOTP: () => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  usePasswordLogin,
  setUsePasswordLogin,
  handleLogin,
  handleSendOTP,
  showPassword,
  togglePasswordVisibility
}) => {
  return (
    <>
      {usePasswordLogin ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
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
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          <div className="text-center mt-2">
            <Button 
              variant="link" 
              type="button"
              onClick={() => setUsePasswordLogin(false)}
              className="text-sm"
            >
              Sign in with OTP instead
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-medium">For development:</p>
              <p>Email: <code className="bg-white px-1 py-0.5 rounded">b3fprintingsolutions@gmail.com</code></p>
              <p>Password: <code className="bg-white px-1 py-0.5 rounded">Mmdimran@1</code></p>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="pl-10"
              />
            </div>
          </div>
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">{error}</p>}
          
          <Button 
            onClick={handleSendOTP} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Verification Code'
            )}
          </Button>
          
          <div className="text-center mt-2">
            <Button 
              variant="link"
              type="button"
              onClick={() => setUsePasswordLogin(true)}
              className="text-sm"
            >
              Use password instead
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-medium">For development:</p>
              <p>Default admin: <code className="bg-white px-1 py-0.5 rounded">b3fprintingsolutions@gmail.com</code></p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminLoginForm;
