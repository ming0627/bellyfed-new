import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Home, LogIn, Shield } from 'lucide-react'

export default function ForbiddenPage() {
  const router = useRouter()

  useEffect(() => {
    // Track 403 errors for analytics
    if (typeof window !== 'undefined') {
      console.warn('403 Forbidden:', router.asPath)
    }
  }, [router.asPath])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 403 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-yellow-500 mb-4">403</div>
          <div className="text-yellow-400 text-6xl mb-4">
            <Shield className="w-16 h-16 mx-auto" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mb-4">
          Access Forbidden
        </h1>
        <p className="text-yellow-700 dark:text-yellow-300 mb-8 leading-relaxed">
          You don't have permission to access this page. This area might be reserved 
          for VIP diners or require special credentials. Please check your access level 
          or sign in with the appropriate account.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/signin"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-100"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Help Information */}
        <div className="mt-12 pt-8 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
            Need access to this page?
          </p>
          <div className="space-y-2">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              • Make sure you're signed in to the correct account
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              • Check if you have the required permissions
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              • Contact support if you believe this is an error
            </p>
          </div>
        </div>

        {/* Access Levels */}
        <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            🔐 <strong>Access Levels:</strong>
          </p>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <div>👤 <strong>User:</strong> Basic restaurant browsing</div>
            <div>⭐ <strong>Premium:</strong> Advanced features & reviews</div>
            <div>👨‍💼 <strong>Admin:</strong> Management & moderation</div>
          </div>
        </div>
      </div>
    </div>
  )
}
