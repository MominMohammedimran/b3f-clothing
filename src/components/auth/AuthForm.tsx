
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthFormContainer } from './AuthFormContainer';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  redirectTo?: string;
  isAdmin?: boolean;
}

export function AuthForm({ initialMode = 'signin', redirectTo = '/', isAdmin = false }: AuthFormProps) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  // For admin logins, use the container component for consistent UI
  if (isAdmin) {
    return <AuthFormContainer initialMode={initialMode} redirectTo={redirectTo} isAdmin={true} />;
  }

  return <AuthFormContainer initialMode={initialMode} redirectTo={redirectTo} />;
}
