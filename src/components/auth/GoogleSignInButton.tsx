
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  loading?: boolean;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  loading = false, 
  className = "" 
}) => {
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast.error('Failed to sign in with Google');
        console.error('Google sign in error:', error);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 ${className}`}
    >
      <img 
        src="/lovable-uploads/google/signin.png" 
        alt="Google" 
        className="w-5 h-5"
      />
      Continue with Google
    </Button>
  );
};

export default GoogleSignInButton;
