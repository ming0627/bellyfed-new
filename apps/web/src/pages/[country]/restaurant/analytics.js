/**
 * Restaurant Analytics Page
 * 
 * Comprehensive analytics dashboard for restaurant owners.
 * Provides detailed insights into business performance, customer behavior,
 * and revenue trends.
 * 
 * Features:
 * - Revenue and sales analytics
 * - Customer insights and demographics
 * - Popular dishes performance
 * - Rating trends and reviews analysis
 * - Time-based filtering
 * - Export capabilities
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
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  DollarSign,
  Download,
  BarChart3,
  Activity
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext.js'

export default function RestaurantAnalyticsPage({ country }) {
  const { isAuthenticated } = useAuth()
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        const mockData = {
          overview: {
            totalRevenue: 125750,
            revenueChange: 15.2,
            totalOrders: 1247,
            ordersChange: 8.7,
            avgOrderValue: 42.50,
            avgOrderChange: 6.1,
            customerRetention: 68.5,
            retentionChange: 3.2
          },
          revenueChart: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            data: [28500, 32100, 29800, 35350]
          },
          topDishes: [
            { name: 'Truffle Pasta', orders: 156, revenue: 4680, rating: 4.8 },
            { name: 'Grilled Salmon', orders: 134, revenue: 4418, rating: 4.6 },
            { name: 'Beef Wellington', orders: 98, revenue: 3920, rating: 4.9 },
            { name: 'Caesar Salad', orders: 87, revenue: 1479, rating: 4.3 },
            { name: 'Chocolate Soufflé', orders: 76, revenue: 1140, rating: 4.7 }
          ],
          customerInsights: {
            newCustomers: 234,
            returningCustomers: 456,
            avgVisitsPerCustomer: 2.3,
            peakHours: ['7:00 PM', '8:00 PM', '8:30 PM'],
            demographics: {
              ageGroups: [
                { range: '18-25', percentage: 15 },
                { range: '26-35', percentage: 35 },
                { range: '36-45', percentage: 28 },
                { range: '46-55', percentage: 15 },
                { range: '55+', percentage: 7 }
              ]
            }
          },
          ratingTrends: {
            currentRating: 4.7,
            previousRating: 4.5,
            totalReviews: 342,
            ratingDistribution: [
              { stars: 5, count: 198 },
              { stars: 4, count: 89 },
              { stars: 3, count: 34 },
              { stars: 2, count: 15 },
              { stars: 1, count: 6 }
            ]
          }
        }
        
        setTimeout(() => {
          setAnalyticsData(mockData)
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAnalyticsData()
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
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
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
            Sign in with your restaurant owner account to view analytics.
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
          <p className="text-orange-600 dark:text-orange-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-orange-300 mx-auto mb-4" />
          <p className="text-orange-600 dark:text-orange-400">Unable to load analytics data</p>
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
            <div className="flex items-center space-x-4">
              <Link
                href={`/${country}/restaurant/dashboard`}
                className="flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-orange-200 dark:bg-orange-700"></div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  Restaurant Analytics
                </h1>
                <p className="text-orange-600 dark:text-orange-400 mt-1">
                  Detailed insights into your restaurant&apos;s performance
                </p>
              </div>
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
                <option value="1y">Last year</option>
              </select>
              
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(analyticsData.overview.totalRevenue)}
                </p>
                {formatChange(analyticsData.overview.revenueChange)}
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {analyticsData.overview.totalOrders.toLocaleString()}
                </p>
                {formatChange(analyticsData.overview.ordersChange)}
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(analyticsData.overview.avgOrderValue)}
                </p>
                {formatChange(analyticsData.overview.avgOrderChange)}
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Customer Retention</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {analyticsData.overview.customerRetention}%
                </p>
                {formatChange(analyticsData.overview.retentionChange)}
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Revenue Trends
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData.revenueChart.data.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-orange-500 rounded-t"
                    style={{ height: `${(value / Math.max(...analyticsData.revenueChart.data)) * 200}px` }}
                  ></div>
                  <span className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    {analyticsData.revenueChart.labels[index]}
                  </span>
                  <span className="text-xs font-medium text-orange-900 dark:text-orange-100">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Customer Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-600 dark:text-orange-400">New Customers</span>
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  {analyticsData.customerInsights.newCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 dark:text-orange-400">Returning Customers</span>
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  {analyticsData.customerInsights.returningCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-orange-600 dark:text-orange-400">Avg Visits per Customer</span>
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  {analyticsData.customerInsights.avgVisitsPerCustomer}
                </span>
              </div>
              <div>
                <span className="text-orange-600 dark:text-orange-400 block mb-2">Peak Hours</span>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.customerInsights.peakHours.map((hour, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-800 dark:text-orange-200">
                      {hour}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Dishes and Rating Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Dishes */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Top Performing Dishes
            </h3>
            <div className="space-y-4">
              {analyticsData.topDishes.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-900 dark:text-orange-100">
                        {dish.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                        <span>{dish.orders} orders</span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {dish.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-900 dark:text-orange-100">
                      {formatCurrency(dish.revenue)}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      revenue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Trends */}
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Rating Trends
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-600 dark:text-orange-400">Current Rating</span>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {analyticsData.ratingTrends.currentRating}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-orange-600 dark:text-orange-400">Total Reviews</span>
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  {analyticsData.ratingTrends.totalReviews}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-orange-600 dark:text-orange-400 block">Rating Distribution</span>
                {analyticsData.ratingTrends.ratingDistribution.map((rating) => (
                  <div key={rating.stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm text-orange-700 dark:text-orange-300">{rating.stars}</span>
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    </div>
                    <div className="flex-1 bg-orange-200 dark:bg-orange-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${(rating.count / analyticsData.ratingTrends.totalReviews) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-orange-600 dark:text-orange-400 w-8">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
