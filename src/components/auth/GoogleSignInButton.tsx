
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast.success('Redirecting to Google...');
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      <img
        src="/lovable-uploads/google/signin.png"
        alt="Google"
        className="w-5 h-5 mr-2"
      />
      {loading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};

export default GoogleSignInButton;