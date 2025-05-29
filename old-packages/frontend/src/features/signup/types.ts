/**
 * This file contains the types and interfaces used in the signup feature.
 */

import { z } from 'zod';
import { formSchema } from './FormSchema';

export interface CountryOption {
  label: string;
  value: string;
}

export interface StateOption {
  label: string;
  value: string;
}

export type FormData = z.infer<typeof formSchema>;

export interface StepProps {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string) => void;
  errors: { [key in keyof FormData]?: string };
  touched: { [key in keyof FormData]?: boolean };
  handleBlur: (field: keyof FormData) => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
  shakeFields: string[];
}

export interface ConfirmationStepProps {
  confirmationCode: string;
  setConfirmationCode: (code: string) => void;
  isLoading: boolean;
  handleConfirmSignUp: (event: React.FormEvent) => Promise<void>;
  handleDoItLater: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
}
