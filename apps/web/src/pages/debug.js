import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Bug, 
  Code, 
  Database, 
  Server, 
  Wifi,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Settings
} from 'lucide-react'

export default function DebugPage() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('system')

  // Mock debug data
  useEffect(() => {
    const mockDebugInfo = {
      system: {
        environment: 'development',
        nodeVersion: '18.17.0',
        nextVersion: '14.0.4',
        buildTime: '2024-01-15T10:30:00Z',
        uptime: '2h 34m 12s',
        memory: {
          used: '245MB',
          total: '512MB',
          percentage: 48
        },
        cpu: {
          usage: '12%',
          cores: 4
        }
      },
      database: {
        status: 'connected',
        host: 'localhost:5432',
        database: 'bellyfed_dev',
        connections: {
          active: 3,
          idle: 7,
          total: 10
        },
        lastQuery: '2024-01-15T12:45:30Z',
        queryTime: '45ms'
      },
      api: {
        status: 'healthy',
        baseUrl: 'http://localhost:3000/api',
        endpoints: [
          { path: '/api/health', status: 'ok', responseTime: '12ms' },
          { path: '/api/auth/me', status: 'ok', responseTime: '34ms' },
          { path: '/api/restaurants', status: 'ok', responseTime: '67ms' },
          { path: '/api/reviews', status: 'ok', responseTime: '89ms' },
          { path: '/api/users', status: 'error', responseTime: 'timeout' }
        ]
      },
      services: {
        cognito: { status: 'connected', region: 'us-east-1' },
        s3: { status: 'connected', bucket: 'bellyfed-dev-assets' },
        cloudwatch: { status: 'connected', logGroup: '/aws/lambda/bellyfed' },
        eventbridge: { status: 'connected', eventBus: 'bellyfed-events' }
      },
      performance: {
        pageLoad: '1.2s',
        firstContentfulPaint: '0.8s',
        largestContentfulPaint: '1.1s',
        cumulativeLayoutShift: '0.05',
        firstInputDelay: '15ms'
      },
      errors: [
        {
          id: 1,
          timestamp: '2024-01-15T12:40:15Z',
          level: 'error',
          message: 'Failed to fetch user data',
          stack: 'Error: Network timeout\n  at fetchUser (user.js:45)\n  at UserProfile (profile.js:23)',
          count: 3
        },
        {
          id: 2,
          timestamp: '2024-01-15T12:35:22Z',
          level: 'warning',
          message: 'Slow database query detected',
          stack: 'Query took 2.3s to execute: SELECT * FROM restaurants WHERE...',
          count: 1
        },
        {
          id: 3,
          timestamp: '2024-01-15T12:30:45Z',
          level: 'info',
          message: 'User authentication successful',
          stack: 'User logged in: user@example.com',
          count: 15
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setDebugInfo(mockDebugInfo)
      setIsLoading(false)
    }, 1000)
  }, [])

  const refreshDebugInfo = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
      case 'connected':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
      case 'timeout':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
      case 'connected':
      case 'healthy':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'error':
      case 'timeout':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const exportDebugInfo = () => {
    const dataStr = JSON.stringify(debugInfo, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `debug-info-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading debug information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <Bug className="w-12 h-12 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    Debug Console
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    System diagnostics and debugging information
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={refreshDebugInfo}
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={exportDebugInfo}
                className="flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex border-b border-orange-200 dark:border-orange-700">
              {[
                { id: 'system', label: 'System', icon: Server },
                { id: 'database', label: 'Database', icon: Database },
                { id: 'api', label: 'API', icon: Wifi },
                { id: 'services', label: 'Services', icon: Shield },
                { id: 'performance', label: 'Performance', icon: Clock },
                { id: 'errors', label: 'Errors', icon: Bug }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Info */}
        {activeTab === 'system' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Environment
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-orange-700 dark:text-orange-300">Environment:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {debugInfo.system.environment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700 dark:text-orange-300">Node.js:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {debugInfo.system.nodeVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700 dark:text-orange-300">Next.js:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {debugInfo.system.nextVersion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700 dark:text-orange-300">Uptime:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {debugInfo.system.uptime}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Resources
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-orange-700 dark:text-orange-300">Memory Usage</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.system.memory.used} / {debugInfo.system.memory.total}
                    </span>
                  </div>
                  <div className="bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div 
                      className="bg-orange-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${debugInfo.system.memory.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700 dark:text-orange-300">CPU Usage:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {debugInfo.system.cpu.usage} ({debugInfo.system.cpu.cores} cores)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Database Info */}
        {activeTab === 'database' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Database Status
              </h3>
              {getStatusIcon(debugInfo.database.status)}
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">
                  Connection Info
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Host:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.database.host}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Database:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.database.database}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Last Query:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {new Date(debugInfo.database.lastQuery).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">
                  Connection Pool
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Active:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.database.connections.active}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Idle:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.database.connections.idle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Total:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {debugInfo.database.connections.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Info */}
        {activeTab === 'api' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                API Endpoints
              </h3>
              {getStatusIcon(debugInfo.api.status)}
            </div>
            
            <div className="space-y-3">
              {debugInfo.api.endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-800 rounded-lg"
                >
                  <div className="flex items-center">
                    {getStatusIcon(endpoint.status)}
                    <span className="ml-3 font-medium text-orange-900 dark:text-orange-100">
                      {endpoint.path}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(endpoint.status)}`}>
                      {endpoint.status}
                    </span>
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {endpoint.responseTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Info */}
        {activeTab === 'services' && (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(debugInfo.services).map(([service, info]) => (
              <div
                key={service}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 capitalize">
                    {service}
                  </h3>
                  {getStatusIcon(info.status)}
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(info).map(([key, value]) => (
                    key !== 'status' && (
                      <div key={key} className="flex justify-between">
                        <span className="text-orange-700 dark:text-orange-300 capitalize">
                          {key}:
                        </span>
                        <span className="font-medium text-orange-900 dark:text-orange-100">
                          {value}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance Info */}
        {activeTab === 'performance' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Performance Metrics
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(debugInfo.performance).map(([metric, value]) => (
                <div key={metric} className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    {value}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors Info */}
        {activeTab === 'errors' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Recent Errors
            </h3>
            <div className="space-y-4">
              {debugInfo.errors.map((error) => (
                <div
                  key={error.id}
                  className="border border-orange-200 dark:border-orange-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      {error.level === 'error' && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                      {error.level === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />}
                      {error.level === 'info' && <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />}
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {error.message}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-orange-500 dark:text-orange-400">
                        Count: {error.count}
                      </span>
                      <span className="text-xs text-orange-500 dark:text-orange-400">
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <pre className="text-xs text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-800 p-2 rounded overflow-x-auto">
                    {error.stack}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <Eye className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Debug Mode Active
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                This debug console is only available in development mode. 
                Sensitive information should never be exposed in production environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
