
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Layout from '../components/layout/Layout';
import { useSupabaseClient } from '../hooks/useSupabase';
import { Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    // Check if there's a session (required for password reset)
    const checkSession = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        toast.error('Your password reset link has expired. Please request a new one.');
        navigate('/signin');
      }
    };
    
    checkSession();
  }, [supabase, navigate]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (!supabase) {
        throw new Error('Authentication service not available');
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) throw error;
      
      toast.success('Password has been reset successfully!');
      
      // Redirect to sign in page after a delay
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom  pb-24 mt-10">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 mt-8">
          <h1 className="text-2xl font-bold text-center mb-6 bg-blue-600 text-white py-2 rounded">
            Reset Your Password
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? 
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
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="********"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showConfirmPassword ? 
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
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
