import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause,
  RotateCcw,
  Download,
  Code,
  Clock,
  Zap,
  Shield,
  Database
} from 'lucide-react'

export default function TestSimplePage() {
  const router = useRouter()
  const { country } = router.query
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock test data
  const testSuites = [
    {
      id: 'api',
      name: 'API Tests',
      description: 'Test API endpoints and data integrity',
      icon: Database,
      tests: [
        { name: 'Restaurant API', endpoint: '/api/restaurants', status: 'passed', duration: 120 },
        { name: 'User Authentication', endpoint: '/api/auth', status: 'passed', duration: 85 },
        { name: 'Review Submission', endpoint: '/api/reviews', status: 'failed', duration: 200 },
        { name: 'Search Functionality', endpoint: '/api/search', status: 'passed', duration: 95 },
        { name: 'Image Upload', endpoint: '/api/upload', status: 'warning', duration: 340 }
      ]
    },
    {
      id: 'ui',
      name: 'UI Tests',
      description: 'Test user interface components and interactions',
      icon: Shield,
      tests: [
        { name: 'Navigation Menu', component: 'Navigation', status: 'passed', duration: 45 },
        { name: 'Restaurant Cards', component: 'RestaurantCard', status: 'passed', duration: 32 },
        { name: 'Search Bar', component: 'SearchField', status: 'passed', duration: 28 },
        { name: 'Review Form', component: 'ReviewForm', status: 'failed', duration: 67 },
        { name: 'User Profile', component: 'UserProfile', status: 'passed', duration: 54 }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Test application performance and load times',
      icon: Zap,
      tests: [
        { name: 'Page Load Speed', metric: 'LCP', status: 'passed', duration: 1200, value: '1.2s' },
        { name: 'First Input Delay', metric: 'FID', status: 'passed', duration: 50, value: '50ms' },
        { name: 'Cumulative Layout Shift', metric: 'CLS', status: 'warning', duration: 0, value: '0.15' },
        { name: 'Time to Interactive', metric: 'TTI', status: 'passed', duration: 2100, value: '2.1s' },
        { name: 'Bundle Size', metric: 'Size', status: 'passed', duration: 0, value: '245KB' }
      ]
    },
    {
      id: 'security',
      name: 'Security Tests',
      description: 'Test security vulnerabilities and data protection',
      icon: Shield,
      tests: [
        { name: 'XSS Protection', type: 'security', status: 'passed', duration: 150 },
        { name: 'CSRF Protection', type: 'security', status: 'passed', duration: 120 },
        { name: 'SQL Injection', type: 'security', status: 'passed', duration: 180 },
        { name: 'Authentication', type: 'security', status: 'passed', duration: 95 },
        { name: 'Data Encryption', type: 'security', status: 'warning', duration: 200 }
      ]
    }
  ]

  useEffect(() => {
    // Simulate loading test results
    setTimeout(() => {
      const results = {
        summary: {
          total: testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
          passed: testSuites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'passed').length, 0),
          failed: testSuites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'failed').length, 0),
          warnings: testSuites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'warning').length, 0),
          duration: testSuites.reduce((sum, suite) => sum + suite.tests.reduce((s, t) => s + t.duration, 0), 0),
          lastRun: new Date().toISOString()
        },
        suites: testSuites
      }
      setTestResults(results)
      setIsLoading(false)
    }, 1000)
  }, [])

  const runTests = async (suiteId = null) => {
    setIsRunning(true)
    setCurrentTest(suiteId)

    // Simulate test execution
    const suitesToRun = suiteId ? [testSuites.find(s => s.id === suiteId)] : testSuites

    for (const suite of suitesToRun) {
      for (const test of suite.tests) {
        setCurrentTest(`${suite.id}-${test.name}`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsRunning(false)
    setCurrentTest(null)
    
    // Update last run time
    setTestResults(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        lastRun: new Date().toISOString()
      }
    }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading test results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 mb-6">
            <Link href={`/${country}`} className="hover:text-orange-800 dark:hover:text-orange-200">
              {country}
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">Simple Tests</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <TestTube className="w-12 h-12 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    Simple Test Suite
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    Basic application testing and health checks for {country}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => runTests()}
                disabled={isRunning}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </button>
              <button className="flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {testResults.summary.total}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {testResults.summary.passed}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {testResults.summary.failed}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {testResults.summary.warnings}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(testResults.summary.duration / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Suites */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {testResults.suites.map((suite) => (
            <div
              key={suite.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800"
            >
              <div className="p-6 border-b border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <suite.icon className="w-8 h-8 text-orange-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        {suite.name}
                      </h3>
                      <p className="text-orange-600 dark:text-orange-400 text-sm">
                        {suite.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => runTests(suite.id)}
                    disabled={isRunning}
                    className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                  >
                    Run
                  </button>
                </div>
              </div>

              <div className="divide-y divide-orange-200 dark:divide-orange-800">
                {suite.tests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 flex items-center justify-between ${
                      currentTest === `${suite.id}-${test.name}` ? 'bg-orange-50 dark:bg-orange-800' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {getStatusIcon(test.status)}
                      <div className="ml-3">
                        <div className="font-medium text-orange-900 dark:text-orange-100">
                          {test.name}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          {test.endpoint || test.component || test.metric || test.type}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {test.value && (
                        <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {test.value}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                      <span className="text-xs text-orange-500 dark:text-orange-400">
                        {test.duration}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Test Details */}
        <div className="mt-8 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Test Information
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-orange-600 dark:text-orange-400">
                Last run: {new Date(testResults.summary.lastRun).toLocaleString()}
              </span>
              <button className="flex items-center px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">
                Test Coverage
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">API Endpoints</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">5/8 (62%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">UI Components</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">5/12 (42%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Performance Metrics</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">5/5 (100%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Security Checks</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">5/7 (71%)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full flex items-center px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                  <Code className="w-4 h-4 mr-2" />
                  View Test Code
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  View Logs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <TestTube className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Test Environment
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Running on development environment with mock data. 
                Tests are simplified for demonstration purposes and may not reflect production behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Force client-side rendering to avoid SSR issues with context providers
export async function getServerSideProps() {
  return {
    props: {},
  };
}
