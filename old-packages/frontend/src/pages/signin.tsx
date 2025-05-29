// Summary:
// This file implements the Sign In page for the Bellyfed frontend.
// It handles user authentication via email/password and social logins (Facebook, Google).
// Key functionalities include:
// - Form handling with Zod validation for email and password.
// - CSRF token fetching and validation for security.
// - Cognito authentication service integration for sign-in logic.
// - Social sign-in initiation by redirecting to the respective provider's auth URL via a backend API.
// - User session management through AuthContext.
// - Toast notifications for user feedback (success/error messages).
// - UI styled to be consistent with the SignUp page, featuring a centered layout and modern form aesthetics.
// - Links for password recovery and navigation to the sign-up page.
// - Option to continue as a guest.

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import cognitoAuthService from '@/services/cognitoAuthService';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the form schema using Zod
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof formSchema>;

const SignInPage: React.FC = () => {
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    criteriaMode: 'all',
  });

  const { isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [csrfToken, setCsrfToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        // Log the error for debugging purposes
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Handle form field blur for validation
  const handleBlur = (field: keyof FormData) => {
    clearErrors(field);
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    clearErrors('root');

    try {
      // Validate CSRF token
      if (!csrfToken) {
        setError('root', {
          type: 'manual',
          message:
            'Security token missing. Please refresh the page and try again.',
        });
        setIsLoading(false);
        return;
      }

      // Attempt to sign in
      const result = await cognitoAuthService.signIn(data.email, data.password);

      if (result.isSignedIn) {
        // Update user in auth context
        await updateUser(result.username);

        toast({
          message: 'Successfully signed in!',
          type: 'success',
        });
        router.push('/');
      } else {
        setError('root', {
          type: 'manual',
          message: 'Invalid email or password',
        });
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error during sign in:', error);
      setError('root', {
        type: 'manual',
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign-in
  const handleSocialSignIn = async (provider: string) => {
    setSocialLoading(provider);
    try {
      // Validate CSRF token
      if (!csrfToken) {
        toast({
          message:
            'Security token missing. Please refresh the page and try again.',
          type: 'error',
        });
        setSocialLoading(null);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({
          message: data.message || 'Failed to initiate social sign-in',
          type: 'error',
        });
      }
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error during social sign in:', error);
      toast({
        message: 'An error occurred during social sign-in. Please try again.',
        type: 'error',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-500">
            Sign in to continue to Bellyfed
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden CSRF token field - ensure it's handled if needed by your /api/csrf or backend */}
          {/* <input type="hidden" name="csrf_token" value={csrfToken} /> */}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register('email')}
              onBlur={() => handleBlur('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoCapitalize="none"
              autoComplete="current-password"
              {...register('password')}
              onBlur={() => handleBlur('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            disabled={!!socialLoading}
            onClick={() => handleSocialSignIn('Facebook')}
            className="w-full"
          >
            {socialLoading === 'Facebook' ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              'Facebook'
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={!!socialLoading}
            onClick={() => handleSocialSignIn('Google')}
            className="w-full"
          >
            {socialLoading === 'Google' ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              'Google'
            )}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign Up
          </Link>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="block w-full mt-2 text-sm text-muted-foreground hover:underline"
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
