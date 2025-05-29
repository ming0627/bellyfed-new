import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/input';

import React, { useState, useEffect } from 'react';
import cognitoAuthService from '@/services/cognitoAuthService';

import Link from 'next/link';

interface AWSError extends Error {
  code?: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<'request' | 'confirm'>('request');
  const router = useRouter();

  useEffect(() => {
    console.log('ForgotPassword component mounted');
    return () => {
      console.log('ForgotPassword component will unmount');
    };
  }, []);

  useEffect(() => {
    console.log('Current stage:', stage);
  }, [stage]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling reset request');
    setError(null);
    setIsLoading(true);
    try {
      await cognitoAuthService.forgotPassword(email);
      setSuccess('Reset code sent to your email. Please check your inbox.');
      setStage('confirm');
    } catch (error) {
      console.error('Error requesting password reset', error);
      if (error instanceof Error) {
        const awsError = error as AWSError;
        setError(awsError.message || 'An error occurred. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling confirm reset');
    setError(null);
    setIsLoading(true);
    try {
      await cognitoAuthService.confirmForgotPassword(email, code, newPassword);
      setSuccess(
        'Password reset successful. You can now sign in with your new password.',
      );
      setTimeout(() => router.push('/signin'), 3000);
    } catch (error) {
      console.error('Error confirming password reset', error);
      if (error instanceof Error) {
        const awsError = error as AWSError;
        setError(awsError.message || 'An error occurred. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Rendering ForgotPassword component, stage:', stage);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{success}</span>
          </div>
        )}
        {stage === 'request' ? (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              placeholder="Email"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <Input
              type="text"
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCode(e.target.value)
              }
              placeholder="Reset Code"
              required
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewPassword(e.target.value)
              }
              placeholder="New Password"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
        <div className="text-center">
          <Link href="/signin" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
