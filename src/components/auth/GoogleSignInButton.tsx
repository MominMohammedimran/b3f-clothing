
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  isSignUp?: boolean;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  isSignUp = false, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      variant="outline"
      className={`w-full ${className}`}
    >
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google logo"
        className="w-5 h-5 mr-2"
      />
      {isLoading 
        ? (isSignUp ? 'Continuing to Google account...' : 'Signing in to Google...')
        : (isSignUp ? 'Continue with Google' : 'Sign in with Google')
      }
    </Button>
  );
};

export default GoogleSignInButton;
