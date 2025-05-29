import { Button } from '@/components/ui/button';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useCognitoUser } from '@/hooks/useCognitoUser';
import { useUserProfile } from '@/hooks/useUserProfile';
import { initCsrfProtection, validateCsrfToken } from '@/utils/csrfProtection';
import { useRouter } from 'next/router';
import { z } from 'zod';

import TermsOfServiceModal from '@/components/TermsOfServiceModal';

import cognitoAuthService from '@/services/cognitoAuthService';

import confetti from 'canvas-confetti';
import Link from 'next/link';

import React, { useCallback, useEffect, useState } from 'react';
// Custom toast
// Simplified form schema with only essential fields
const formSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    nickname: z
      .string()
      .min(3, 'Nickname must be at least 3 characters')
      .max(30, 'Nickname must be at most 30 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    termsAgreed: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof formSchema>;

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
  });
  const [errors, setErrors] = useState<{
    [key in keyof FormData | '_error']?: string;
  }>({});
  const [touched, setTouched] = useState<{ [key in keyof FormData]?: boolean }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const router = useRouter();
  const { isAuthenticated, updateUser } = useAuth();
  const [, setShakeFields] = useState<string[]>([]);
  const { toast } = useToast();
  const { refetch: refetchCognitoUser } = useCognitoUser();
  const { refetch: refetchUserProfile } = useUserProfile();

  // Initialize CSRF token when component mounts
  useEffect(() => {
    // Generate and store a CSRF token
    const initToken = async () => {
      const token = await initCsrfProtection();
      setCsrfToken(token);
    };
    initToken();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const updateFormData = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateField = (
    field: keyof FormData,
    value: string | boolean,
  ): void => {
    const fieldSchema = (formSchema.innerType() as z.ZodObject<z.ZodRawShape>)
      .shape[field];
    const result = fieldSchema.safeParse(value);

    if (!result.success) {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0].message,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof FormData): void => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleCheckboxChange = (
    field: keyof FormData,
    checked: boolean,
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
    validateField(field, checked);
  };

  const validateForm = useCallback(() => {
    const fields: (keyof FormData)[] = [
      'email',
      'nickname',
      'password',
      'confirmPassword',
      'termsAgreed',
    ];

    let isValid = true;
    const newErrors: { [key in keyof FormData]?: string } = {};
    const newShakeFields: string[] = [];

    fields.forEach((field) => {
      const fieldSchema = (formSchema.innerType() as z.ZodObject<z.ZodRawShape>)
        .shape[field];
      const result = fieldSchema.safeParse(formData[field]);

      if (!result.success) {
        isValid = false;
        newErrors[field] = result.error.issues[0].message;
        newShakeFields.push(field as string);
      }
    });

    setErrors(newErrors);
    setShakeFields(newShakeFields);

    return isValid;
  }, [formData, setErrors, setShakeFields]);

  const handleSignup = useCallback(async () => {
    // Validate CSRF token
    const isValidToken = await validateCsrfToken(csrfToken);
    if (!isValidToken) {
      toast({
        message: 'Security Error',
        type: 'error',
      });
      return;
    }

    // Validate the form
    const isValid = validateForm();
    if (!isValid) {
      // Show error toast
      toast({
        message: 'Validation Error',
        type: 'error',
      });

      // Set all fields as touched to show individual field errors
      const fields: (keyof FormData)[] = [
        'email',
        'password',
        'confirmPassword',
        'termsAgreed',
      ];
      setTouched((prev) => {
        const newTouched = { ...prev };
        fields.forEach((field) => {
          newTouched[field] = true;
        });
        return newTouched;
      });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = formSchema.parse(formData);

      try {
        // Use email as username and include nickname
        const signUpResult = await cognitoAuthService.signUp(
          validatedData.email,
          validatedData.password,
          validatedData.email,
          validatedData.nickname,
        );

        console.log('SignUp Result:', signUpResult);

        if (signUpResult.userConfirmed) {
          // User is already confirmed (rare case)
          const signInResult = await cognitoAuthService.signIn(
            validatedData.email,
            validatedData.password,
          );
          if (signInResult.isSignedIn) {
            // Update user in AuthContext
            updateUser(validatedData.email);

            // Refetch user data from Cognito and user profile
            await Promise.all([refetchCognitoUser(), refetchUserProfile()]);

            router.push('/');
          }
        } else {
          // Normal flow - user needs to confirm their signup
          setIsConfirming(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (signUpError) {
        console.error('SignUp Error:', signUpError);
        throw signUpError;
      }
    } catch (err) {
      console.error('Signup error:', err);

      if (err instanceof Error) {
        // Define AWS error interface
        interface AWSError extends Error {
          code?: string;
          name: string;
        }

        const awsError = err as AWSError;
        switch (awsError.code || awsError.name) {
          case 'UsernameExistsException':
            setErrors({
              email:
                'An account with this email already exists. Please use a different email or try signing in.',
            });
            toast({
              message: 'Account Already Exists',
              type: 'error',
            });
            break;

          case 'InvalidPasswordException':
            setErrors({
              password:
                'Password does not meet requirements. Please choose a stronger password.',
            });
            toast({
              message: 'Invalid Password',
              type: 'error',
            });
            break;

          case 'InvalidParameterException':
            setErrors({
              _error:
                'Invalid input parameters. Please check your information and try again.',
            });
            toast({
              message: 'Invalid Input',
              type: 'error',
            });
            break;

          default:
            setErrors({
              _error: `An error occurred during signup: ${err.message}`,
            });
            toast({
              message: `Signup Error: ${err.message}`,
              type: 'error',
            });
        }
      } else if (err instanceof z.ZodError) {
        const fieldErrors = err.issues.reduce(
          (acc, issue) => ({
            ...acc,
            [issue.path[0]]: issue.message,
          }),
          {} as { [key in keyof FormData]?: string },
        );
        setErrors(fieldErrors);
        toast({
          message: 'Validation Error',
          type: 'error',
        });
      } else {
        setErrors({
          _error: 'An unexpected error occurred. Please try again later.',
        });
        toast({
          message: 'Unexpected Error',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    validateForm,
    setErrors,
    setIsLoading,
    setIsConfirming,
    updateUser,
    router,
    toast,
    setTouched,
    csrfToken,
  ]);

  const handleConfirmSignUp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate CSRF token
      const isValidToken = await validateCsrfToken(csrfToken);
      if (!isValidToken) {
        toast({
          message: 'Security Error',
          type: 'error',
        });
        return;
      }

      setErrors({});
      setIsLoading(true);

      try {
        const confirmResult = await cognitoAuthService.confirmSignUp(
          formData.email,
          confirmationCode,
        );
        console.log('Confirmation result:', confirmResult);

        const signInResult = await cognitoAuthService.signIn(
          formData.email,
          formData.password,
        );
        if (signInResult.isSignedIn) {
          // Update user in AuthContext
          updateUser(formData.email);

          // Refetch user data from Cognito and user profile
          await Promise.all([refetchCognitoUser(), refetchUserProfile()]);

          router.push('/');
        } else {
          setErrors({
            _error:
              'Sign in was not successful after confirmation. Please try signing in manually.',
          });
        }
      } catch (err) {
        console.error('Confirmation error:', err);
        if (err instanceof Error) {
          setErrors({
            _error: `An error occurred during confirmation: ${err.message}`,
          });
        } else {
          setErrors({
            _error:
              'An unknown error occurred during confirmation. Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData.email,
      formData.password,
      confirmationCode,
      router,
      updateUser,
      setErrors,
      setIsLoading,
      csrfToken,
      toast,
    ],
  );

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!isConfirming) {
          handleSignup();
        } else {
          handleConfirmSignUp(event as unknown as React.FormEvent);
        }
      }
    },
    [isConfirming, handleSignup, handleConfirmSignUp],
  );

  const handleDoItLater = (): void => {
    // Redirect to home page or dashboard
    router.push('/');
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
          {!isConfirming ? (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-sm text-gray-500">
                    Sign up to start exploring delicious food
                  </p>
                </div>

                <div className="space-y-3" onKeyDown={handleKeyPress}>
                  {/* Hidden CSRF token field */}
                  <input type="hidden" name="csrf_token" value={csrfToken} />
                  <FormField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                  />
                  <FormField
                    id="nickname"
                    label="Nickname"
                    type="text"
                    placeholder="Choose a nickname"
                    value={formData.nickname}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.nickname}
                    touched={touched.nickname}
                  />
                  <FormField
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="Enter a secure password"
                    value={formData.password}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                  />
                  <FormField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                  />

                  <div className="flex items-start mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="termsAgreed"
                        type="checkbox"
                        checked={formData.termsAgreed}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleCheckboxChange('termsAgreed', e.target.checked)
                        }
                        className="w-4 h-4 border border-gray-300 rounded bg-white focus:ring-3 focus:ring-primary accent-primary"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="termsAgreed"
                        className="font-light text-gray-500"
                      >
                        I agree to the{' '}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsTermsModalOpen(true);
                          }}
                          className="font-medium text-primary hover:underline"
                        >
                          Terms of Service
                        </a>
                      </label>
                      {errors.termsAgreed && touched.termsAgreed && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.termsAgreed}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col space-y-2">
                  <Button
                    onClick={handleSignup}
                    className="w-full"
                    disabled={isLoading || !formData.termsAgreed}
                  >
                    {isLoading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                  <div className="text-center text-sm">
                    <span className="text-gray-600">
                      Already have an account?{' '}
                    </span>
                    <Link href="/signin" passHref>
                      <Button variant="link" className="p-0 h-auto">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form
              onSubmit={handleConfirmSignUp}
              className="space-y-4"
              onKeyDown={handleKeyPress}
            >
              <h2 className="text-xl font-bold mb-2">Confirm Your Account</h2>
              {/* Hidden CSRF token field */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
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
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                  size="sm"
                >
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
          )}
        </div>
      </div>
      <ToastViewport />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </ToastProvider>
  );
};

export default SignupPage;
