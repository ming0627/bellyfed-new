import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import cognitoAuthService from '@/services/cognitoAuthService';
// Custom toast
interface ResendVerificationProps {
  email?: string;
  onSuccess?: () => void;
}

export default function ResendVerification({
  email: initialEmail,
  onSuccess,
}: ResendVerificationProps): React.ReactElement {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await cognitoAuthService.resendConfirmationCode(email);
      setIsSuccess(true);
      toast({
        title: 'Success',
        description: 'Verification code sent',
        variant: 'default',
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error resending code:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while resending the verification code');
      }
      toast({
        title: 'Error',
        description: 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Resend Verification Code</h2>
        <p className="text-gray-600 mt-2">
          {isSuccess
            ? 'Verification code has been sent to your email'
            : 'Enter your email to receive a new verification code'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleResendCode} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            disabled={isLoading || isSuccess}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : isSuccess ? (
            'Code Sent'
          ) : (
            'Resend Verification Code'
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>
          Did not receive the code? Check your spam folder or try again in a few
          minutes.
        </p>
        <p className="mt-2">
          If you're still having trouble, please contact our support team.
        </p>
      </div>

      {isSuccess && (
        <div className="text-center text-sm text-green-600 mt-2">
          A new verification code has been sent to your email. Please check your
          inbox and follow the instructions to verify your account.
        </div>
      )}
    </div>
  );
}
