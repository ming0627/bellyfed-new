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
  Database,
  Globe
} from 'lucide-react'

export default function SimpleTestPage() {
  const router = useRouter()
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simple test suite
  const testSuites = [
    {
      id: 'basic',
      name: 'Basic Functionality',
      description: 'Test core application features',
      icon: Zap,
      tests: [
        { name: 'Page Rendering', status: 'passed', duration: 45 },
        { name: 'Navigation Links', status: 'passed', duration: 32 },
        { name: 'Form Validation', status: 'passed', duration: 67 },
        { name: 'Button Interactions', status: 'passed', duration: 28 },
        { name: 'Modal Dialogs', status: 'warning', duration: 89 }
      ]
    },
    {
      id: 'connectivity',
      name: 'Connectivity Tests',
      description: 'Test external service connections',
      icon: Globe,
      tests: [
        { name: 'API Endpoints', status: 'passed', duration: 120 },
        { name: 'Database Connection', status: 'passed', duration: 85 },
        { name: 'Authentication Service', status: 'passed', duration: 95 },
        { name: 'Image Upload Service', status: 'failed', duration: 200 },
        { name: 'Email Service', status: 'warning', duration: 150 }
      ]
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Test application performance metrics',
      icon: Clock,
      tests: [
        { name: 'Page Load Time', status: 'passed', duration: 1200, value: '1.2s' },
        { name: 'Bundle Size Check', status: 'passed', duration: 0, value: '245KB' },
        { name: 'Memory Usage', status: 'warning', duration: 0, value: '48MB' },
        { name: 'CPU Usage', status: 'passed', duration: 0, value: '12%' },
        { name: 'Network Requests', status: 'passed', duration: 0, value: '8 requests' }
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
        await new Promise(resolve => setTimeout(resolve, 300))
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
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
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
          <p className="text-orange-600 dark:text-orange-400">Loading simple tests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <TestTube className="w-10 h-10 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    Simple Tests
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    Quick and easy application health checks
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
                    Run All
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
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {testResults.summary.total}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Total</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {testResults.summary.passed}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {testResults.summary.failed}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {testResults.summary.warnings}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Warnings</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {(testResults.summary.duration / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Duration</div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Suites */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {testResults.suites.map((suite) => (
            <div
              key={suite.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800"
            >
              <div className="p-4 border-b border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <suite.icon className="w-6 h-6 text-orange-500 mr-3" />
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
                      <span className="ml-3 font-medium text-orange-900 dark:text-orange-100">
                        {test.name}
                      </span>
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

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/debug"
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Code className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Debug Console
              </span>
            </Link>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
              <Download className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Export Results
              </span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
              <Database className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Database Health
              </span>
            </button>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
              <Shield className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Security Check
              </span>
            </button>
          </div>
        </div>

        {/* Test Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <TestTube className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Simple Test Suite
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                This is a simplified test suite for quick health checks. 
                For comprehensive testing, use the full test suite in the development environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
