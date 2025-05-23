
import { AuthFormContainer } from './AuthFormContainer';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  redirectTo?: string;
}

export function AuthForm(props: AuthFormProps) {
  return <AuthFormContainer {...props} />;
}
