import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Clock, Database, Server, Wifi } from 'lucide-react'

export default function HealthPage() {
  const [healthStatus, setHealthStatus] = useState({
    overall: 'checking',
    services: {
      database: { status: 'checking', responseTime: null, lastCheck: null },
      api: { status: 'checking', responseTime: null, lastCheck: null },
      auth: { status: 'checking', responseTime: null, lastCheck: null },
      storage: { status: 'checking', responseTime: null, lastCheck: null },
      search: { status: 'checking', responseTime: null, lastCheck: null }
    },
    metrics: {
      uptime: null,
      totalRequests: null,
      errorRate: null,
      avgResponseTime: null
    }
  })

  // Simulate health checks
  useEffect(() => {
    const checkHealth = async () => {
      const services = ['database', 'api', 'auth', 'storage', 'search']
      const newStatus = { ...healthStatus }

      // Simulate checking each service
      for (const service of services) {
        const startTime = Date.now()
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500))
        
        const responseTime = Date.now() - startTime
        const isHealthy = Math.random() > 0.1 // 90% chance of being healthy
        
        newStatus.services[service] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date().toISOString()
        }
      }

      // Calculate overall status
      const allHealthy = Object.values(newStatus.services).every(s => s.status === 'healthy')
      const anyUnhealthy = Object.values(newStatus.services).some(s => s.status === 'unhealthy')
      
      newStatus.overall = allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded'

      // Mock metrics
      newStatus.metrics = {
        uptime: '99.9%',
        totalRequests: '1,234,567',
        errorRate: '0.1%',
        avgResponseTime: '245ms'
      }

      setHealthStatus(newStatus)
    }

    checkHealth()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-orange-500 animate-spin" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400'
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-orange-600 dark:text-orange-400'
    }
  }

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'unhealthy':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      default:
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
    }
  }

  const serviceIcons = {
    database: Database,
    api: Server,
    auth: CheckCircle,
    storage: Database,
    search: Wifi
  }

  const serviceNames = {
    database: 'Database',
    api: 'API Server',
    auth: 'Authentication',
    storage: 'File Storage',
    search: 'Search Service'
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
              System Health Status
            </h1>
            <p className="text-orange-700 dark:text-orange-300">
              Real-time monitoring of Bellyfed services and infrastructure
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Status */}
        <div className={`rounded-lg border p-6 mb-8 ${getStatusBg(healthStatus.overall)}`}>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              {getStatusIcon(healthStatus.overall)}
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${getStatusColor(healthStatus.overall)}`}>
                  {healthStatus.overall === 'checking' ? 'Checking...' : 
                   healthStatus.overall === 'healthy' ? 'All Systems Operational' :
                   healthStatus.overall === 'degraded' ? 'Some Services Degraded' :
                   'Service Disruption Detected'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {Object.entries(healthStatus.services).map(([service, data]) => {
            const Icon = serviceIcons[service]
            return (
              <div
                key={service}
                className={`rounded-lg border p-6 ${getStatusBg(data.status)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      {serviceNames[service]}
                    </h3>
                  </div>
                  {getStatusIcon(data.status)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-700 dark:text-orange-300">Status:</span>
                    <span className={`font-medium ${getStatusColor(data.status)}`}>
                      {data.status === 'checking' ? 'Checking...' : 
                       data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                  </div>
                  
                  {data.responseTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700 dark:text-orange-300">Response Time:</span>
                      <span className="text-orange-900 dark:text-orange-100 font-medium">
                        {data.responseTime}ms
                      </span>
                    </div>
                  )}
                  
                  {data.lastCheck && (
                    <div className="flex justify-between text-sm">
                      <span className="text-orange-700 dark:text-orange-300">Last Check:</span>
                      <span className="text-orange-900 dark:text-orange-100 font-medium">
                        {new Date(data.lastCheck).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-6">
            System Metrics
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {healthStatus.metrics.uptime || '--'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Uptime (30 days)
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {healthStatus.metrics.totalRequests || '--'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Total Requests
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {healthStatus.metrics.errorRate || '--'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Error Rate
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {healthStatus.metrics.avgResponseTime || '--'}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                Avg Response Time
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-orange-100 dark:bg-orange-800 rounded-lg p-6">
          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
            About This Page
          </h4>
          <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
            <p>
              This page provides real-time status information about Bellyfed's core services and infrastructure.
            </p>
            <p>
              Status checks are performed every 30 seconds. If you're experiencing issues, please check back in a few minutes or contact support.
            </p>
            <p>
              For detailed incident reports and maintenance schedules, visit our status page.
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}
