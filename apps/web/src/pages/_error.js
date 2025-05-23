import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  ArrowLeft,
  Bug,
  Mail,
  ExternalLink
} from 'lucide-react'

function Error({ statusCode, hasGetInitialPropsRun, err }) {
  const router = useRouter()

  useEffect(() => {
    // Log error for monitoring (replace with actual error tracking service)
    if (err) {
      console.error('Error occurred:', {
        statusCode,
        message: err.message,
        stack: err.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }
  }, [err, statusCode])

  const getErrorMessage = (statusCode) => {
    switch (statusCode) {
      case 400:
        return {
          title: 'Bad Request',
          description: 'The request could not be understood by the server.',
          suggestion: 'Please check your input and try again.'
        }
      case 401:
        return {
          title: 'Unauthorized',
          description: 'You need to sign in to access this page.',
          suggestion: 'Please sign in to your account and try again.'
        }
      case 403:
        return {
          title: 'Access Forbidden',
          description: 'You don\'t have permission to access this resource.',
          suggestion: 'Contact support if you believe this is an error.'
        }
      case 404:
        return {
          title: 'Page Not Found',
          description: 'The page you\'re looking for doesn\'t exist.',
          suggestion: 'Check the URL or navigate back to the homepage.'
        }
      case 500:
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end.',
          suggestion: 'Please try again later or contact support if the problem persists.'
        }
      case 502:
        return {
          title: 'Bad Gateway',
          description: 'The server received an invalid response.',
          suggestion: 'This is usually temporary. Please try again in a few minutes.'
        }
      case 503:
        return {
          title: 'Service Unavailable',
          description: 'The service is temporarily unavailable.',
          suggestion: 'We\'re working to fix this. Please try again later.'
        }
      case 504:
        return {
          title: 'Gateway Timeout',
          description: 'The server took too long to respond.',
          suggestion: 'Please try again. If the problem persists, contact support.'
        }
      default:
        return {
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred.',
          suggestion: 'Please try refreshing the page or contact support if the problem continues.'
        }
    }
  }

  const errorInfo = getErrorMessage(statusCode)
  const isClientError = statusCode >= 400 && statusCode < 500
  const isServerError = statusCode >= 500

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleReportError = () => {
    const errorDetails = {
      statusCode,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      message: err?.message || 'No additional details'
    }
    
    const subject = `Error Report - ${statusCode} ${errorInfo.title}`
    const body = `Error Details:\n\n${JSON.stringify(errorDetails, null, 2)}\n\nAdditional Information:\n[Please describe what you were doing when this error occurred]`
    
    window.open(`mailto:support@bellyfed.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            isServerError 
              ? 'bg-red-100 dark:bg-red-900' 
              : 'bg-orange-100 dark:bg-orange-800'
          }`}>
            <AlertTriangle className={`w-12 h-12 ${
              isServerError 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-orange-500 dark:text-orange-400'
            }`} />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-6">
          <h1 className={`text-6xl font-bold mb-2 ${
            isServerError 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {statusCode || 'Error'}
          </h1>
          <h2 className="text-2xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
            {errorInfo.title}
          </h2>
        </div>

        {/* Error Description */}
        <div className="mb-8">
          <p className="text-lg text-orange-700 dark:text-orange-300 mb-4">
            {errorInfo.description}
          </p>
          <p className="text-orange-600 dark:text-orange-400">
            {errorInfo.suggestion}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>

          {isServerError && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          )}
        </div>

        {/* Additional Help */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Need Help?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Quick Solutions
              </h4>
              <ul className="text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Check your internet connection</li>
                <li>• Clear your browser cache</li>
                <li>• Try a different browser</li>
                <li>• Disable browser extensions</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                Still Having Issues?
              </h4>
              <div className="space-y-2">
                <button
                  onClick={handleReportError}
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report this error
                </button>
                <a
                  href="mailto:support@bellyfed.com"
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact support
                </a>
                <Link
                  href="/health"
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Check system status
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Error ID for Support */}
        {err && (
          <div className="mt-6 text-xs text-orange-500 dark:text-orange-400">
            Error ID: {Date.now().toString(36)}-{Math.random().toString(36).substr(2, 9)}
          </div>
        )}

        {/* Fun Food-Related Message */}
        <div className="mt-8 p-4 bg-orange-100 dark:bg-orange-800 rounded-lg">
          <p className="text-orange-700 dark:text-orange-300 text-sm">
            🍽️ While you're here, why not explore our{' '}
            <Link href="/restaurants" className="font-medium hover:underline">
              restaurant recommendations
            </Link>
            {' '}or check out the{' '}
            <Link href="/rankings" className="font-medium hover:underline">
              latest food rankings
            </Link>
            ?
          </p>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
