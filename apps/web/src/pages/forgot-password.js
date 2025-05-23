import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email address is required')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // TODO: Replace with actual Cognito forgot password API call
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to send reset email. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                Check Your Email
              </h1>
              <p className="text-orange-700 dark:text-orange-300">
                We've sent a password reset link to:
              </p>
              <p className="text-orange-600 dark:text-orange-400 font-medium mt-2">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Next steps:</strong>
                </p>
                <ul className="text-sm text-orange-600 dark:text-orange-400 mt-2 space-y-1">
                  <li>• Check your email inbox</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create a new password</li>
                  <li>• Sign in with your new password</li>
                </ul>
              </div>

              <div className="text-sm text-orange-600 dark:text-orange-400">
                <p>Didn't receive the email?</p>
                <ul className="mt-1 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                  setError('')
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Try Different Email
              </button>

              <Link
                href="/signin"
                className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors duration-200 dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
            Forgot Password?
          </h1>
          <p className="text-orange-700 dark:text-orange-300">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
            <div className="text-sm text-orange-700 dark:text-orange-300">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-orange-600 hover:text-orange-800 font-medium dark:text-orange-400 dark:hover:text-orange-200"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-800 rounded-lg">
          <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
            Need help?
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            If you're having trouble resetting your password, please contact our support team 
            and we'll help you get back into your account.
          </p>
        </div>
      </div>
    </div>
  )
}
