
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  handleSendOTP
}) => {
  return (
    <>
      {usePasswordLogin ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <div className="text-center mt-2">
            <Button 
              variant="link" 
              type="button"
              onClick={() => setUsePasswordLogin(false)}
            >
              Sign in with OTP instead
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-medium">For development:</p>
              <p>Email: <code className="bg-white px-1">b3fprintingsolutions@gmail.com</code></p>
              <p>Password: <code className="bg-white px-1">Mmdimran@1</code></p>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          <Button 
            onClick={handleSendOTP} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </Button>
          <div className="text-center mt-2">
            <Button 
              variant="link"
              type="button"
              onClick={() => setUsePasswordLogin(true)}
            >
              Use password instead
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
              <p className="font-medium">For development:</p>
              <p>Default admin: <code className="bg-white px-1">b3fprintingsolutions@gmail.com</code></p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminLoginForm;
