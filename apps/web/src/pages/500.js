import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

export default function ServerErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Track 500 errors for analytics
    if (typeof window !== 'undefined') {
      console.error('500 Server Error:', router.asPath)
    }
  }, [router.asPath])

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 500 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-red-500 mb-4">500</div>
          <div className="text-red-400 text-6xl mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-4">
          Server Error
        </h1>
        <p className="text-red-700 dark:text-red-300 mb-8 leading-relaxed">
          Something went wrong on our end. Our kitchen staff (developers) have been notified 
          and are working to fix the issue. Please try again in a few moments.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-100"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Error Details */}
        <div className="mt-12 pt-8 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Error Code: 500 - Internal Server Error
          </p>
          <p className="text-xs text-red-500 dark:text-red-500">
            If this problem persists, please contact our support team.
          </p>
        </div>

        {/* Status Information */}
        <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            💡 <strong>What you can do:</strong>
          </p>
          <ul className="text-sm text-orange-700 dark:text-orange-300 mt-2 space-y-1">
            <li>• Wait a few minutes and try again</li>
            <li>• Check our status page for updates</li>
            <li>• Clear your browser cache</li>
            <li>• Try a different browser</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
