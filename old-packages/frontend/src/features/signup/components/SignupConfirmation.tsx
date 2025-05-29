import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationStepProps } from '../types';

/**
 * This file contains the SignupConfirmation component for the signup process.
 * It handles the confirmation code input after signup.
 */

import React from 'react';

const SignupConfirmation: React.FC<ConfirmationStepProps> = ({
  confirmationCode,
  setConfirmationCode,
  isLoading,
  handleConfirmSignUp,
  handleDoItLater,
  handleKeyPress,
}) => {
  return (
    <form
      onSubmit={handleConfirmSignUp}
      className="space-y-4"
      onKeyDown={handleKeyPress}
    >
      <h2 className="text-xl font-bold mb-2">Confirm Your Account</h2>
      <div className="space-y-1">
        <Label htmlFor="confirmationCode">Confirmation Code</Label>
        <Input
          id="confirmationCode"
          type="text"
          value={confirmationCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmationCode(e.target.value)
          }
          placeholder="Enter confirmation code"
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={isLoading} size="sm">
          {isLoading ? 'Confirming...' : 'Confirm Sign Up'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleDoItLater}
          size="sm"
        >
          Do it later
        </Button>
      </div>
    </form>
  );
};

export default SignupConfirmation;
