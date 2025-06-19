import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    // Wait a bit to allow React to re-render before redirecting
    setTimeout(async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast.success('Redirecting to Google...');
        if (onSuccess) onSuccess();
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        setLoading(false);
      }
    }, 300); // Delay for re-render
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full flex items-center justify-center ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
           <img
            src="/lovable-uploads/google/google_logo.webp"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Signing in...
        </>
      ) : (
        <>
          <img
            src="/lovable-uploads/google/google_logo.webp"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          Continue with Google.
        </>
      )}
    </Button>
  );
};

export default GoogleSignInButton;
