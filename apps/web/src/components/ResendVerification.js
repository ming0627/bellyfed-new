/**
 * Resend Verification Component
 * 
 * Allows users to resend email verification for account activation.
 * Handles verification code resending with rate limiting and feedback.
 * 
 * Features:
 * - Email verification resending
 * - Rate limiting and cooldown
 * - Success and error feedback
 * - User-friendly interface
 * - Integration with Cognito
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { cognitoAuthService } from '../services/cognitoAuthService.js'

const ResendVerification = ({
  email = '',
  onSuccess = null,
  onError = null,
  showEmailInput = true,
  autoFocus = true,
  className = ''
}) => {
  // State
  const [userEmail, setUserEmail] = useState(email)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [attempts, setAttempts] = useState(0)

  // Context
  const { trackUserEngagement } = useAnalyticsContext()

  // Cooldown timer
  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [cooldown])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!userEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`)
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Resend verification code
      await cognitoAuthService.resendConfirmationCode(userEmail.trim())
      
      setSuccess(true)
      setAttempts(prev => prev + 1)
      
      // Set cooldown based on attempts (progressive delay)
      const cooldownTime = Math.min(30 + (attempts * 30), 300) // Max 5 minutes
      setCooldown(cooldownTime)

      // Track successful resend
      trackUserEngagement('auth', 'resend_verification', 'success', {
        email: userEmail,
        attempts: attempts + 1
      })

      // Call success callback
      if (onSuccess) {
        onSuccess(userEmail)
      }
    } catch (err) {
      console.error('Error resending verification:', err)
      
      let errorMessage = 'Failed to resend verification email'
      
      // Handle specific Cognito errors
      if (err.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email address'
      } else if (err.code === 'InvalidParameterException') {
        errorMessage = 'Invalid email address format'
      } else if (err.code === 'LimitExceededException') {
        errorMessage = 'Too many attempts. Please try again later'
        setCooldown(300) // 5 minutes
      } else if (err.code === 'UserAlreadyConfirmedException') {
        errorMessage = 'Your account is already verified. You can sign in now'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)

      // Track failed resend
      trackUserEngagement('auth', 'resend_verification', 'error', {
        email: userEmail,
        error: err.code || err.message,
        attempts: attempts + 1
      })

      // Call error callback
      if (onError) {
        onError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle email change
  const handleEmailChange = (e) => {
    setUserEmail(e.target.value)
    setError('')
    setSuccess(false)
  }

  return (
    <div className={className}>
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Resend Verification
          </h2>
          <p className="text-gray-600">
            Enter your email to receive a new verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          {showEmailInput && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={userEmail}
                onChange={handleEmailChange}
                placeholder="Enter your email address"
                autoFocus={autoFocus}
                disabled={loading}
                className={`
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  ${loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                `}
                required
              />
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <div>
                  <p className="text-green-800 font-medium">
                    Verification email sent!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    Check your inbox and spam folder for the verification email.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-600">❌</span>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || cooldown > 0 || !userEmail.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Wait ${cooldown}s`
            ) : (
              'Resend Verification Email'
            )}
          </Button>

          {/* Cooldown Info */}
          {cooldown > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                You can request another verification email in {cooldown} seconds
              </p>
            </div>
          )}

          {/* Attempts Info */}
          {attempts > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Verification emails sent: {attempts}
              </p>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Having trouble?</p>
            <ul className="space-y-1 text-xs">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Verification emails may take a few minutes to arrive</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm">
            <span className="text-gray-600">Already verified? </span>
            <a
              href="/signin"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign In
            </a>
          </div>
          
          <div className="text-sm">
            <span className="text-gray-600">Need a new account? </span>
            <a
              href="/signup"
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign Up
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ResendVerification
