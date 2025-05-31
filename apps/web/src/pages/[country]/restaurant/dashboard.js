/**
 * Restaurant Owner Dashboard Page
 * 
 * Main dashboard for restaurant owners to manage their business.
 * Provides comprehensive overview including analytics, recent activity,
 * and quick access to management tools.
 * 
 * Features:
 * - Real-time business metrics
 * - Revenue and booking analytics
 * - Recent reviews and activity
 * - Quick action navigation
 * - Mobile-responsive design
 * 
 * Next.js 15 Compatible:
 * - Uses getStaticPaths and getStaticProps
 * - Default export only
 * - JavaScript (.js) file
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  BarChart3,
  Star,
  DollarSign,
  Calendar,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function RestaurantDashboard({ country }) {
  const { isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  // Mock restaurant ID - in real app, this would come from user's restaurant ownership
  const restaurantId = '1'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        const mockData = {
          restaurant: {
            id: restaurantId,
            name: 'The Golden Spoon',
            status: 'active',
            verified: true
          },
          overview: {
            totalRevenue: 45250,
            revenueChange: 12.5,
            totalBookings: 234,
            bookingsChange: 8.3,
            avgRating: 4.7,
            ratingChange: 0.2,
            totalReviews: 89,
            reviewsChange: 15.6,
            pageViews: 3420,
            viewsChange: -2.1
          },
          recentActivity: [
            { type: 'booking', message: 'New booking for 4 people', time: '2 minutes ago' },
            { type: 'review', message: 'New 5-star review received', time: '15 minutes ago' },
            { type: 'menu', message: 'Menu item "Truffle Pasta" updated', time: '1 hour ago' },
            { type: 'staff', message: 'New staff member added', time: '3 hours ago' }
          ],
          upcomingBookings: [
            { id: 1, customerName: 'Sarah Chen', time: '7:30 PM', guests: 2, status: 'confirmed' },
            { id: 2, customerName: 'Mike Rodriguez', time: '8:00 PM', guests: 4, status: 'pending' },
            { id: 3, customerName: 'Emily Johnson', time: '8:30 PM', guests: 6, status: 'confirmed' }
          ],
          popularDishes: [
            { name: 'Truffle Pasta', orders: 45, revenue: 1350 },
            { name: 'Grilled Salmon', orders: 38, revenue: 1140 },
            { name: 'Beef Wellington', orders: 32, revenue: 1280 }
          ]
        }
        
        setTimeout(() => {
          setDashboardData(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, timeRange])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatChange = (change) => {
    const isPositive = change > 0
    return (
      <span className={`flex items-center text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(change)}%
      </span>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to access the dashboard.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-orange-300 mx-auto mb-4" />
          <p className="text-orange-600 dark:text-orange-400">Unable to load dashboard data</p>
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
            <div>
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                Restaurant Dashboard
              </h1>
              <p className="text-orange-600 dark:text-orange-400 mt-1">
                {dashboardData.restaurant.name} • {country.toUpperCase()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 text-sm dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <Link
                href={`/${country}/restaurants/${restaurantId}`}
                className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(dashboardData.overview.totalRevenue)}
                </p>
                {formatChange(dashboardData.overview.revenueChange)}
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Bookings</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.overview.totalBookings}
                </p>
                {formatChange(dashboardData.overview.bookingsChange)}
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.overview.avgRating}
                </p>
                {formatChange(dashboardData.overview.ratingChange)}
              </div>
              <Star className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Page Views</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {dashboardData.overview.pageViews.toLocaleString()}
                </p>
                {formatChange(dashboardData.overview.viewsChange)}
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href={`/${country}/restaurant/menu/add`}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-800 dark:hover:bg-orange-700 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">Add Menu Item</span>
            </Link>
            
            <Link
              href={`/${country}/restaurant/bookings`}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-800 dark:hover:bg-orange-700 rounded-lg transition-colors"
            >
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">View Bookings</span>
            </Link>
            
            <Link
              href={`/${country}/restaurant/analytics`}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-800 dark:hover:bg-orange-700 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">View Analytics</span>
            </Link>
            
            <Link
              href={`/${country}/restaurant/settings`}
              className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 dark:bg-orange-800 dark:hover:bg-orange-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-orange-700 dark:text-orange-300 font-medium">Settings</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity and Upcoming Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'booking' ? 'bg-green-500' :
                    activity.type === 'review' ? 'bg-blue-500' :
                    activity.type === 'menu' ? 'bg-orange-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-orange-900 dark:text-orange-100 text-sm">
                      {activity.message}
                    </p>
                    <p className="text-orange-600 dark:text-orange-400 text-xs">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Upcoming Bookings
              </h3>
              <Link
                href={`/${country}/restaurant/bookings`}
                className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {dashboardData.upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      {booking.customerName}
                    </p>
                    <p className="text-orange-600 dark:text-orange-400 text-sm">
                      {booking.time} • {booking.guests} guests
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Popular Dishes
            </h3>
            <Link
              href={`/${country}/restaurant/menu`}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
            >
              Manage menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.popularDishes.map((dish, index) => (
              <div key={index} className="p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  {dish.name}
                </h4>
                <div className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                  <div>{dish.orders} orders</div>
                  <div>{formatCurrency(dish.revenue)} revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  return {
    paths: [
      { params: { country: 'my' } },
      { params: { country: 'sg' } }
    ],
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  return {
    props: {
      country: params.country
    },
    revalidate: 300 // 5 minutes
  }
}
