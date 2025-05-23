import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Clock,
  RefreshCw,
  Shield
} from 'lucide-react'

export default function ResendVerificationPage() {
  const router = useRouter()
  const { email: queryEmail } = router.query
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Set email from query parameter
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail)
    }
  }, [queryEmail])

  // Countdown timer for resend button
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate success
      setIsSuccess(true)
      setCountdown(60) // 60 second cooldown
      
      // TODO: Call actual resend verification API
      console.log('Resending verification email to:', email)
      
    } catch (err) {
      setError('Failed to send verification email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Mail className="w-16 h-16 text-orange-500" />
          </div>
          <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            Resend Verification Email
          </h2>
          <p className="mt-2 text-orange-600 dark:text-orange-400">
            Enter your email address to receive a new verification link
          </p>
        </div>

        {/* Success State */}
        {isSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Verification Email Sent!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  We've sent a new verification link to <strong>{email}</strong>. 
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-orange-300 placeholder-orange-500 text-orange-900 rounded-lg focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100 dark:placeholder-orange-400"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !isValidEmail(email) || countdown > 0}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : countdown > 0 ? (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Send Verification Email
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Additional Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Why verify your email?
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                <li>• Secure your account and enable password recovery</li>
                <li>• Receive important notifications about your account</li>
                <li>• Access all premium features and services</li>
                <li>• Join the community and interact with other users</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-6">
          <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-3">
            Still having trouble?
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
              <span className="text-orange-700 dark:text-orange-300">
                Check your spam or junk folder for the verification email
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
              <span className="text-orange-700 dark:text-orange-300">
                Make sure you entered the correct email address
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
              <span className="text-orange-700 dark:text-orange-300">
                Add noreply@bellyfed.com to your contacts to ensure delivery
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 dark:text-orange-400 mr-2">•</span>
              <span className="text-orange-700 dark:text-orange-300">
                Wait a few minutes as email delivery can sometimes be delayed
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
            <Link
              href="/contact"
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
            >
              Contact support if you continue having issues →
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center justify-between">
          <Link
            href="/signin"
            className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </Link>
          
          <Link
            href="/signup"
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
          >
            Create New Account
          </Link>
        </div>

        {/* Email Tips */}
        <div className="text-center">
          <details className="text-left">
            <summary className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium cursor-pointer">
              Email not arriving? Click for troubleshooting tips
            </summary>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
              <h4 className="font-medium mb-2">Common email delivery issues:</h4>
              <ul className="space-y-1 text-xs">
                <li><strong>Gmail:</strong> Check the "Promotions" or "Updates" tabs</li>
                <li><strong>Outlook:</strong> Look in the "Junk Email" folder</li>
                <li><strong>Yahoo:</strong> Check the "Bulk" or "Spam" folder</li>
                <li><strong>Corporate email:</strong> Your IT department may be blocking external emails</li>
                <li><strong>Mobile apps:</strong> Try checking email on a computer instead</li>
              </ul>
              <p className="mt-2 text-xs">
                If you're using a custom domain or less common email provider, 
                please contact our support team for assistance.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
