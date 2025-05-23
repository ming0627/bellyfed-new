import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFoundPage() {
  const router = useRouter()

  useEffect(() => {
    // Track 404 errors for analytics
    if (typeof window !== 'undefined') {
      console.warn('404 Error:', router.asPath)
    }
  }, [router.asPath])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-orange-500 mb-4">404</div>
          <div className="text-orange-400 text-6xl mb-4">🍽️</div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-4">
          Page Not Found
        </h1>
        <p className="text-orange-700 dark:text-orange-300 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have wandered off like a food truck. 
          Don't worry, we'll help you find your way back to delicious discoveries.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          <Link
            href="/search"
            className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors duration-200 dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Restaurants
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
            Popular destinations:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/restaurants"
              className="px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-full transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-200"
            >
              Restaurants
            </Link>
            <Link
              href="/dishes"
              className="px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-full transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-200"
            >
              Dishes
            </Link>
            <Link
              href="/rankings"
              className="px-3 py-1 text-sm bg-orange-200 hover:bg-orange-300 text-orange-800 rounded-full transition-colors duration-200 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-200"
            >
              Rankings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
