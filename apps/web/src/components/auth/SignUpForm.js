import React, { useState, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
/**
 * PasswordStrengthIndicator component for showing password strength
 *
 * @param {Object} props - Component props
 * @param {string} props.password - Password to check strength
 * @returns {JSX.Element} - Rendered component
 */
const PasswordStrengthIndicator = memo(function PasswordStrengthIndicator({
  password,
}) {
  // Calculate password strength
  const getPasswordStrength = password => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters

    return strength;
  };

  const strength = getPasswordStrength(password);

  // Determine color and label based on strength
  const getStrengthColor = strength => {
    if (strength === 0) return 'bg-gray-300 dark:bg-gray-700';
    if (strength < 3) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = strength => {
    if (strength === 0) return 'Enter a password';
    if (strength < 3) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex space-x-1 flex-grow">
          {[1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              className={`h-1.5 flex-grow rounded-full ${
                level <= strength
                  ? getStrengthColor(strength)
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
        <span className="text-xs ml-2 text-gray-600 dark:text-gray-400 min-w-[60px] text-right">
          {getStrengthLabel(strength)}
        </span>
      </div>

      {/* Password requirements */}
      {password && (
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-2">
          <div className="flex items-center">
            <password.length >= 8 ? Check : AlertCircleclassName={`w-3.5 h-3.5 mr-1.5 ${
                password.length >= 8
                  ? 'text-green-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
            />
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center">
            </[A-Z]/.test(password) ? Check : AlertCircleclassName={`w-3.5 h-3.5 mr-1.5 ${
                /[A-Z]/.test(password)
                  ? 'text-green-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
             />
            <span>Uppercase letter</span>
          </div>
          <div className="flex items-center">
            </[0-9]/.test(password) ? Check : AlertCircleclassName={`w-3.5 h-3.5 mr-1.5 ${
                /[0-9]/.test(password)
                  ? 'text-green-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
             />
            <span>Number</span>
          </div>
          <div className="flex items-center">
            </[^A-Za-z0-9]/.test(password) ? Check : AlertCircleclassName={`w-3.5 h-3.5 mr-1.5 ${
                /[^A-Za-z0-9]/.test(password)
                  ? 'text-green-500'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-hidden="true"
             />
            <span>Special character</span>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * SignUpForm component for user registration
 *
 * @param {Object} props - Component props
 * @param {Function} props.onSignUp - Function to handle sign up
 * @param {string} props.redirectPath - Path to redirect after successful sign up
 * @param {Function} props.getCountryLink - Function to generate country-specific links
 * @returns {JSX.Element} - Rendered component
 */
const SignUpForm = memo(function SignUpForm({
  onSignUp,
  redirectPath = '/',
  getCountryLink,
}) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form input change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // In a real app, this would call an authentication service
      if (onSignUp) {
        await onSignUp(formData);
      } else {
        // Mock authentication for demo
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate successful sign up
        console.log('User signed up:', formData.email);

        // Redirect to specified path
        router.push(getCountryLink(redirectPath));
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Create Your Account
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <AlertCircleclassName="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0"
                aria-hidden="true"
               />
              <span className="text-red-800 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                 />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                 />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                 />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <showPassword ? EyeOff : EyeclassName="h-5 w-5"
                    aria-hidden="true"
                   />
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockclassName="h-5 w-5 text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                 />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                  aria-label={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <showConfirmPassword ? EyeOff : EyeclassName="h-5 w-5"
                    aria-hidden="true"
                   />
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="mt-2 flex items-center">
                <
                    formData.password === formData.confirmPassword
                      ? Check
                      : AlertCircle
                  className={`w-4 h-4 mr-1.5 ${
                    formData.password === formData.confirmPassword
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                  aria-hidden="true"
                 />
                <span
                  className={`text-xs ${
                    formData.password === formData.confirmPassword
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {formData.password === formData.confirmPassword
                    ? 'Passwords match'
                    : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="agreeToTerms"
                className="text-gray-700 dark:text-gray-300"
              >
                I agree to the{' '}
                <Link
                  href={getCountryLink('/terms')}
                  className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href={getCountryLink('/privacy')}
                  className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        {/* Social Sign Up */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Sign up with Google</span>
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="sr-only">Sign up with Facebook</span>
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href={getCountryLink('/signin')}
            className="font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
});

export default SignUpForm;
