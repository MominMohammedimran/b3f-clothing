
import React, { useState, Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSupabaseClient } from '@/hooks/useSupabase';
import { Eye, EyeOff } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Define both interfaces to handle both use cases
export interface SignupFormProps {
  onVerificationSent?: (email: string, password: string, data: { firstName: string; lastName: string }) => void;
  // Properties for AuthFormContainer use case
  email?: string;
  setEmail?: Dispatch<SetStateAction<string>>;
  password?: string;
  setPassword?: Dispatch<SetStateAction<string>>;
  confirmPassword?: string;
  setConfirmPassword?: Dispatch<SetStateAction<string>>;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  handleSubmit?: (e: React.FormEvent) => Promise<void>;
  loading?: boolean;
  setMode?: Dispatch<SetStateAction<'signin' | 'signup' | 'otp'>>;
}

const SignupForm: React.FC<SignupFormProps> = ({ 
  onVerificationSent,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  togglePasswordVisibility,
  handleSubmit: externalHandleSubmit,
  loading,
  setMode
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localShowPassword, setLocalShowPassword] = useState(false);
  const [localShowConfirmPassword, setLocalShowConfirmPassword] = useState(false);
  const supabase = useSupabaseClient();

  // Determine which mode we're in based on props
  const isStandalone = !!onVerificationSent;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: email || '',
      password: password || '',
      confirmPassword: confirmPassword || ''
    }
  });

  // Update form values when props change
  React.useEffect(() => {
    if (!isStandalone && email) {
      form.setValue('email', email);
    }
    if (!isStandalone && password) {
      form.setValue('password', password);
    }
    if (!isStandalone && confirmPassword) {
      form.setValue('confirmPassword', confirmPassword);
    }
  }, [email, password, confirmPassword, isStandalone, form]);

  const handleSignUpSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isStandalone) {
      setIsSubmitting(true);
      
      try {
        if (!supabase) {
          throw new Error('Authentication service not available');
        }
        
        // First check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', values.email)
          .maybeSingle();
        
        if (existingUser) {
          toast.error('User with this email already exists');
          setIsSubmitting(false);
          return;
        }
        
        // Create new user
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              first_name: values.firstName,
              last_name: values.lastName,
              full_name: `${values.firstName} ${values.lastName}`
            }
          }
        });
        
        if (error) {
          throw error;
        }
        
        // Generate a verification code (for development convenience)
        const verificationCode = "123456"; // Fixed code for testing
        console.log(`Verification code for ${values.email}: ${verificationCode}`);
        
        // Store user data for verification
        if (data.user) {
          // Create profile for user
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: values.email,
            first_name: values.firstName,
            last_name: values.lastName,
            display_name: `${values.firstName} ${values.lastName}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        // Show verification code (in real app, this would be sent via email)
        toast.success(`Development mode: Use verification code: 123456`);
        
        // Pass data to parent component
        if (onVerificationSent) {
          onVerificationSent(values.email, values.password, {
            firstName: values.firstName,
            lastName: values.lastName
          });
        }
        
      } catch (error: any) {
        console.error('Sign up error:', error);
        if (error.message && error.message.includes('unique constraint')) {
          toast.error('User with this email already exists');
        } else if (error.message && error.message.includes('48 seconds')) {
          toast.error('Please wait a moment before trying again');
          // Still show verification screen with the default code
          if (onVerificationSent) {
            onVerificationSent(values.email, values.password, {
              firstName: form.getValues().firstName,
              lastName: form.getValues().lastName
            });
          }
        } else {
          toast.error(error.message || 'Failed to create account');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For AuthFormContainer case, update parent state
      if (setEmail) setEmail(values.email);
      if (setPassword) setPassword(values.password);
      if (setConfirmPassword) setConfirmPassword(values.password);
      
      // Use the parent's submit handler
      if (externalHandleSubmit) {
        const event = { preventDefault: () => {} } as React.FormEvent;
        externalHandleSubmit(event);
      }
    }
  };

  // Render different form based on the mode we're in
  if (!isStandalone) {
    // Simplified form for AuthFormContainer
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        if (externalHandleSubmit) externalHandleSubmit(e);
      }} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email || ''}
            onChange={(e) => setEmail && setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={password || ''}
              onChange={(e) => setPassword && setPassword(e.target.value)}
              required
            />
            {togglePasswordVisibility && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword || ''}
            onChange={(e) => setConfirmPassword && setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setMode && setMode('signin')}
            className="text-primary font-medium hover:underline"
          >
            Sign In
          </button>
        </p>
      </form>
    );
  }

  // Original standalone form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUpSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={localShowPassword ? "text" : "password"}
                    placeholder="********"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setLocalShowPassword(!localShowPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {localShowPassword ? 
                      <EyeOff className="h-5 w-5" /> : 
                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={localShowConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setLocalShowConfirmPassword(!localShowConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {localShowConfirmPassword ? 
                      <EyeOff className="h-5 w-5" /> : 
                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default SignupForm;
