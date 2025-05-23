
import React from 'react';
import { AuthForm } from './AuthForm';
import { toast } from 'sonner';
import { checkSessionSecurity } from '@/utils/securityUtils';

interface AuthFormSecurityWrapperProps {
  initialMode?: 'signin' | 'signup';
  redirectTo?: string;
}

export const AuthFormSecurityWrapper: React.FC<AuthFormSecurityWrapperProps> = ({ 
  initialMode = 'signin', 
  redirectTo = '/' 
}) => {
  // Check security when component mounts
  React.useEffect(() => {
    const checkSecurity = async () => {
      const isSessionValid = await checkSessionSecurity();
      
      if (!isSessionValid && initialMode === 'signin') {
        toast.info('Please sign in to continue');
      }
    };
    
    checkSecurity();
  }, [initialMode]);

  return (
    <AuthForm initialMode={initialMode} redirectTo={redirectTo} />
  );
};

export default AuthFormSecurityWrapper;
