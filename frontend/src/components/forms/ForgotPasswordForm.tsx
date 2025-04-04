import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Submit the forgot password request to the backend
      const response = await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });
      
      if (response.status === 200) {
        setIsSubmitted(true);
        toast.success('Password reset instructions sent to your email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-2">Check Your Email</h3>
          <p>We've sent recovery instructions to your email address.</p>
        </div>
        
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Please check your inbox and follow the instructions to reset your password.
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Button onClick={() => setIsSubmitted(false)}>
            Try a different email
          </Button>
          
          <Link href="/login" className="text-sm text-blue-600 hover:underline mt-4">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Enter your email and we'll send you instructions to reset your password
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>
        </div>
        
        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
} 