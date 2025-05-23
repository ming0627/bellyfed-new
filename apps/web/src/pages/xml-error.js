import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  AlertTriangle, 
  Code, 
  FileText, 
  Home, 
  RefreshCw, 
  ArrowLeft,
  Bug,
  Mail,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react'

export default function XmlErrorPage() {
  const router = useRouter()
  const [errorDetails, setErrorDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock XML error data
  useEffect(() => {
    const mockErrorDetails = {
      type: 'XML_PARSE_ERROR',
      message: 'Invalid XML structure detected in API response',
      timestamp: new Date().toISOString(),
      requestId: 'req_' + Math.random().toString(36).substr(2, 9),
      endpoint: '/api/restaurants/feed.xml',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<restaurants>
  <restaurant id="123">
    <name>The Golden Spoon</name>
    <location>Downtown</location>
    <rating>4.8</rating>
    <!-- Missing closing tag for description -->
    <description>Amazing Italian restaurant with authentic flavors
  </restaurant>
  <restaurant id="124">
    <name>Ocean Breeze</name>
    <location>Waterfront</location>
    <rating>4.7</rating>
    <description>Fresh seafood and ocean views</description>
  </restaurant>
</restaurants>`,
      parseError: {
        line: 7,
        column: 65,
        message: 'Expected closing tag for element "description"',
        context: '<description>Amazing Italian restaurant with authentic flavors'
      },
      suggestions: [
        'Add the missing closing tag: </description>',
        'Validate XML structure before processing',
        'Implement proper error handling for malformed XML',
        'Use XML schema validation'
      ],
      relatedErrors: [
        {
          timestamp: '2024-01-15T11:30:00Z',
          message: 'XML validation failed for menu data',
          endpoint: '/api/restaurants/123/menu.xml'
        },
        {
          timestamp: '2024-01-15T10:45:00Z',
          message: 'Malformed XML in restaurant feed',
          endpoint: '/api/restaurants/feed.xml'
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setErrorDetails(mockErrorDetails)
      setIsLoading(false)
    }, 1000)
  }, [])

  const copyErrorDetails = () => {
    const errorText = `
XML Error Details:
Type: ${errorDetails.type}
Message: ${errorDetails.message}
Timestamp: ${errorDetails.timestamp}
Request ID: ${errorDetails.requestId}
Endpoint: ${errorDetails.endpoint}

Parse Error:
Line: ${errorDetails.parseError.line}
Column: ${errorDetails.parseError.column}
Message: ${errorDetails.parseError.message}
Context: ${errorDetails.parseError.context}

XML Content:
${errorDetails.xmlContent}
    `.trim()

    navigator.clipboard.writeText(errorText)
    // TODO: Show toast notification
  }

  const downloadErrorReport = () => {
    const errorReport = {
      ...errorDetails,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify(errorReport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `xml-error-report-${errorDetails.requestId}.json`
    link.click()
  }

  const reportError = () => {
    const subject = `XML Error Report - ${errorDetails.type}`
    const body = `XML Error Details:

Type: ${errorDetails.type}
Message: ${errorDetails.message}
Request ID: ${errorDetails.requestId}
Endpoint: ${errorDetails.endpoint}
Timestamp: ${errorDetails.timestamp}

Parse Error:
Line: ${errorDetails.parseError.line}, Column: ${errorDetails.parseError.column}
Message: ${errorDetails.parseError.message}

Please investigate this XML parsing issue.`
    
    window.open(`mailto:support@bellyfed.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading error details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mr-3" />
              <Code className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              XML Parse Error
            </h1>
            <h2 className="text-2xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
              {errorDetails.type}
            </h2>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              {errorDetails.message}
            </p>
            
            {/* Error Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-orange-100 dark:bg-orange-800 rounded-lg p-4">
                <div className="text-sm text-orange-600 dark:text-orange-400">Request ID</div>
                <div className="font-mono text-orange-900 dark:text-orange-100">
                  {errorDetails.requestId}
                </div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-800 rounded-lg p-4">
                <div className="text-sm text-orange-600 dark:text-orange-400">Endpoint</div>
                <div className="font-mono text-orange-900 dark:text-orange-100">
                  {errorDetails.endpoint}
                </div>
              </div>
              <div className="bg-orange-100 dark:bg-orange-800 rounded-lg p-4">
                <div className="text-sm text-orange-600 dark:text-orange-400">Timestamp</div>
                <div className="font-mono text-orange-900 dark:text-orange-100">
                  {new Date(errorDetails.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Parse Error Details */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Parse Error Details
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-red-900 dark:text-red-100">Line:</span>
                    <span className="ml-2 text-red-700 dark:text-red-300">{errorDetails.parseError.line}</span>
                  </div>
                  <div>
                    <span className="font-medium text-red-900 dark:text-red-100">Column:</span>
                    <span className="ml-2 text-red-700 dark:text-red-300">{errorDetails.parseError.column}</span>
                  </div>
                  <div className="md:col-span-1">
                    <span className="font-medium text-red-900 dark:text-red-100">Error:</span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {errorDetails.parseError.message}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Error Context:
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{errorDetails.parseError.context}</code>
                </pre>
              </div>
            </div>

            {/* XML Content */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                  XML Content
                </h3>
                <button
                  onClick={copyErrorDetails}
                  className="flex items-center px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </button>
              </div>
              
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{errorDetails.xmlContent}</code>
              </pre>
            </div>

            {/* Suggestions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Suggested Solutions
              </h3>
              <ul className="space-y-3">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-orange-700 dark:text-orange-300">
                      {suggestion}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Request
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="w-full flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </button>
              </div>
            </div>

            {/* Report Error */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Report This Error
              </h3>
              <div className="space-y-3">
                <button
                  onClick={reportError}
                  className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </button>
                <button
                  onClick={downloadErrorReport}
                  className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
                <Link
                  href="/debug"
                  className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Debug Console
                </Link>
              </div>
            </div>

            {/* Related Errors */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Related Errors
              </h3>
              <div className="space-y-3">
                {errorDetails.relatedErrors.map((error, index) => (
                  <div key={index} className="p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                      {error.message}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-orange-500 dark:text-orange-400 font-mono">
                      {error.endpoint}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Documentation
              </h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  XML API Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href="#"
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Error Handling Guide
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <a
                  href="#"
                  className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  XML Schema Reference
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <Code className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Technical Information
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                This error occurred while parsing XML data from the API. XML parsing errors typically indicate 
                malformed XML structure, missing tags, or encoding issues. Please check the XML content for 
                syntax errors and ensure proper tag closure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
