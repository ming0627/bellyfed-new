import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  Building, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Star,
  MapPin,
  Clock,
  Activity,
  Database,
  FileText
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalRestaurants: 0,
      totalReviews: 0,
      totalPhotos: 0
    },
    recentActivity: [],
    systemHealth: {},
    pendingApprovals: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Check admin permissions
  useEffect(() => {
    if (isAuthenticated && user) {
      // TODO: Replace with actual admin check
      const isAdmin = user.role === 'admin' || user.email?.includes('admin')
      
      if (!isAdmin) {
        router.push('/')
        return
      }

      // Mock admin dashboard data
      const mockData = {
        stats: {
          totalUsers: 12847,
          totalRestaurants: 1256,
          totalReviews: 45632,
          totalPhotos: 23891
        },
        recentActivity: [
          {
            id: 1,
            type: 'user_signup',
            description: 'New user registration: sarah.chen@email.com',
            timestamp: '2024-01-20T10:30:00Z',
            severity: 'info'
          },
          {
            id: 2,
            type: 'restaurant_added',
            description: 'New restaurant added: The Golden Spoon',
            timestamp: '2024-01-20T09:15:00Z',
            severity: 'success'
          },
          {
            id: 3,
            type: 'review_flagged',
            description: 'Review flagged for inappropriate content',
            timestamp: '2024-01-20T08:45:00Z',
            severity: 'warning'
          },
          {
            id: 4,
            type: 'system_error',
            description: 'Database connection timeout in region US-West',
            timestamp: '2024-01-20T08:00:00Z',
            severity: 'error'
          }
        ],
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          storage: 'warning',
          search: 'healthy'
        },
        pendingApprovals: [
          {
            id: 1,
            type: 'restaurant',
            title: 'New Restaurant: Casa Italiana',
            description: 'Pending approval for new restaurant listing',
            submittedBy: 'restaurant.owner@email.com',
            submittedAt: '2024-01-19T14:30:00Z'
          },
          {
            id: 2,
            type: 'review',
            title: 'Flagged Review',
            description: 'Review reported for inappropriate language',
            submittedBy: 'user.report@email.com',
            submittedAt: '2024-01-19T12:15:00Z'
          }
        ]
      }

      setTimeout(() => {
        setDashboardData(mockData)
        setIsLoading(false)
      }, 1000)
    } else if (!isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthenticated, user, router])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'restaurant_added':
        return <Building className="w-4 h-4 text-green-500" />
      case 'review_flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'system_error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-orange-500" />
    }
  }

  const getActivityColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'border-l-green-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'error':
        return 'border-l-red-500'
      default:
        return 'border-l-blue-500'
    }
  }

  const getHealthStatus = (status) => {
    switch (status) {
      case 'healthy':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Healthy' }
      case 'warning':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Warning' }
      case 'error':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Error' }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  Admin Dashboard
                </h1>
                <p className="text-orange-600 dark:text-orange-400">
                  System overview and management tools
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <Link
                href="/health"
                className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                System Health
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Total Users</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Restaurants</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.stats.totalRestaurants.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Reviews</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.stats.totalReviews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Photos</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.stats.totalPhotos.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Recent Activity
                </h3>
                <Link
                  href="/admin/activity"
                  className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`border-l-4 pl-4 py-2 ${getActivityColor(activity.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-orange-900 dark:text-orange-100">
                          {activity.description}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health & Quick Actions */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                System Health
              </h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.systemHealth).map(([service, status]) => {
                  const healthInfo = getHealthStatus(status)
                  return (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                        {service}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthInfo.bg} ${healthInfo.color}`}>
                        {healthInfo.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Pending Approvals
                </h3>
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {dashboardData.pendingApprovals.length}
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData.pendingApprovals.map((item) => (
                  <div key={item.id} className="border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-orange-500 dark:text-orange-500 mt-2">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/restaurants/create"
                  className="flex items-center w-full px-3 py-2 text-left text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Add Restaurant
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center w-full px-3 py-2 text-left text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <Users className="w-4 h-4 mr-3" />
                  Manage Users
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center w-full px-3 py-2 text-left text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  View Reports
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center w-full px-3 py-2 text-left text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
