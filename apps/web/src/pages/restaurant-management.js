import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Store, 
  Settings, 
  BarChart3, 
  Users, 
  Star,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Filter,
  Download
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.js'

export default function RestaurantManagementPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [restaurantData, setRestaurantData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock restaurant management data
  useEffect(() => {
    if (isAuthenticated) {
      const mockData = {
        restaurant: {
          id: 1,
          name: 'The Golden Spoon',
          cuisine: 'Italian',
          address: '123 Main St, Downtown',
          phone: '+1 (555) 123-4567',
          email: 'info@goldenspoon.com',
          website: 'goldenspoon.com',
          status: 'active',
          verified: true,
          rating: 4.8,
          reviewCount: 1247,
          claimDate: '2023-06-15'
        },
        analytics: {
          views: {
            today: 156,
            thisWeek: 1234,
            thisMonth: 5678,
            change: '+12%'
          },
          reviews: {
            total: 1247,
            thisMonth: 89,
            avgRating: 4.8,
            change: '+5%'
          },
          photos: {
            total: 234,
            thisMonth: 23,
            views: 12456,
            change: '+8%'
          },
          bookings: {
            total: 567,
            thisMonth: 89,
            revenue: 12450,
            change: '+15%'
          }
        },
        recentReviews: [
          {
            id: 1,
            user: 'Sarah Chen',
            rating: 5,
            comment: 'Amazing truffle pasta! The service was exceptional and the atmosphere was perfect for our anniversary dinner.',
            date: '2024-01-14',
            helpful: 12,
            response: null
          },
          {
            id: 2,
            user: 'Mike Rodriguez',
            rating: 4,
            comment: 'Great food and ambiance. The wine selection is impressive. Only minor issue was the wait time.',
            date: '2024-01-13',
            helpful: 8,
            response: 'Thank you for your feedback! We\'re working on reducing wait times during peak hours.'
          },
          {
            id: 3,
            user: 'Emily Johnson',
            rating: 5,
            comment: 'Best Italian restaurant in the city! The osso buco was perfectly cooked and the staff was very knowledgeable.',
            date: '2024-01-12',
            helpful: 15,
            response: null
          }
        ],
        menu: {
          categories: [
            { name: 'Appetizers', items: 8, avgPrice: 12 },
            { name: 'Pasta', items: 12, avgPrice: 18 },
            { name: 'Main Courses', items: 15, avgPrice: 28 },
            { name: 'Desserts', items: 6, avgPrice: 9 },
            { name: 'Beverages', items: 20, avgPrice: 8 }
          ],
          totalItems: 61,
          lastUpdated: '2024-01-10'
        },
        hours: {
          monday: { open: '11:00', close: '22:00', closed: false },
          tuesday: { open: '11:00', close: '22:00', closed: false },
          wednesday: { open: '11:00', close: '22:00', closed: false },
          thursday: { open: '11:00', close: '22:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '11:00', close: '23:00', closed: false },
          sunday: { open: '12:00', close: '21:00', closed: false }
        }
      }

      // Simulate API call
      setTimeout(() => {
        setRestaurantData(mockData)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const respondToReview = (reviewId) => {
    // TODO: Implement review response functionality
    console.log('Responding to review:', reviewId)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Restaurant Owner Access Required
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Sign in with your restaurant owner account to manage your business.
          </p>
          <div className="space-x-4">
            <Link
              href="/signin"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/claim-restaurant"
              className="inline-flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
            >
              Claim Restaurant
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading restaurant dashboard...</p>
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
                <Store className="w-10 h-10 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {restaurantData.restaurant.name}
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    Restaurant Management Dashboard
                  </p>
                </div>
              </div>

              {/* Restaurant Status */}
              <div className="flex items-center space-x-4">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  restaurantData.restaurant.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    restaurantData.restaurant.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {restaurantData.restaurant.status}
                </div>
                
                {restaurantData.restaurant.verified && (
                  <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium dark:bg-blue-900 dark:text-blue-200">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </div>
                )}
                
                <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {restaurantData.restaurant.rating} ({restaurantData.restaurant.reviewCount} reviews)
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/restaurants/${restaurantData.restaurant.id}`}
                className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Link>
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Edit className="w-4 h-4 mr-2" />
                Edit Restaurant
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex border-b border-orange-200 dark:border-orange-700">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                { id: 'menu', label: 'Menu', icon: Settings },
                { id: 'hours', label: 'Hours', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Page Views</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {restaurantData.analytics.views.thisMonth.toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm">{restaurantData.analytics.views.change}</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Reviews</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {restaurantData.analytics.reviews.thisMonth}
                    </p>
                    <p className="text-green-600 text-sm">{restaurantData.analytics.reviews.change}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Photo Views</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {restaurantData.analytics.photos.views.toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm">{restaurantData.analytics.photos.change}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Revenue</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      ${restaurantData.analytics.bookings.revenue.toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm">{restaurantData.analytics.bookings.change}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Recent Reviews
              </h3>
              <div className="space-y-4">
                {restaurantData.recentReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-orange-200 dark:border-orange-700 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-orange-900 dark:text-orange-100 mr-2">
                            {review.user}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-orange-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-orange-600 dark:text-orange-400 text-sm ml-2">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                          {review.comment}
                        </p>
                        {review.response && (
                          <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-3 mt-2">
                            <p className="text-orange-700 dark:text-orange-300 text-sm">
                              <strong>Your response:</strong> {review.response}
                            </p>
                          </div>
                        )}
                      </div>
                      {!review.response && (
                        <button
                          onClick={() => respondToReview(review.id)}
                          className="ml-4 px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="#"
                  onClick={() => setActiveTab('reviews')}
                  className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
                >
                  View all reviews →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Customer Reviews
              </h3>
              <div className="flex items-center space-x-3">
                <select className="px-3 py-2 border border-orange-200 rounded-lg bg-white text-orange-700 text-sm dark:bg-orange-800 dark:border-orange-700 dark:text-orange-300">
                  <option>All Reviews</option>
                  <option>5 Stars</option>
                  <option>4 Stars</option>
                  <option>3 Stars</option>
                  <option>2 Stars</option>
                  <option>1 Star</option>
                  <option>Needs Response</option>
                </select>
                <button className="flex items-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {restaurantData.recentReviews.map((review) => (
                <div key={review.id} className="border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-orange-900 dark:text-orange-100 mr-3">
                          {review.user}
                        </span>
                        <div className="flex items-center mr-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-orange-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-orange-600 dark:text-orange-400 text-sm">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-orange-700 dark:text-orange-300">
                        {review.comment}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-orange-600 dark:text-orange-400">
                        <Users className="w-4 h-4 mr-1" />
                        {review.helpful} people found this helpful
                      </div>
                    </div>
                  </div>

                  {review.response ? (
                    <div className="bg-orange-50 dark:bg-orange-800 rounded-lg p-3 mt-3">
                      <p className="text-orange-700 dark:text-orange-300 text-sm">
                        <strong>Your response:</strong> {review.response}
                      </p>
                      <button className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-xs mt-1">
                        Edit response
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button
                        onClick={() => respondToReview(review.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Respond to Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Menu Management
              </h3>
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {restaurantData.menu.categories.map((category, index) => (
                <div key={index} className="border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    {category.name}
                  </h4>
                  <div className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                    <div>{category.items} items</div>
                    <div>Avg price: ${category.avgPrice}</div>
                  </div>
                  <button className="mt-3 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium">
                    Manage items →
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Total menu items: {restaurantData.menu.totalItems}
                  </p>
                  <p className="text-orange-600 dark:text-orange-400 text-sm">
                    Last updated: {new Date(restaurantData.menu.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
                  Update Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hours Tab */}
        {activeTab === 'hours' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Business Hours
              </h3>
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                Edit Hours
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(restaurantData.hours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-4 border border-orange-200 dark:border-orange-700 rounded-lg">
                  <span className="font-medium text-orange-900 dark:text-orange-100 capitalize">
                    {day}
                  </span>
                  <span className="text-orange-700 dark:text-orange-300">
                    {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Performance Analytics
              </h3>
              <p className="text-orange-600 dark:text-orange-400">
                Detailed analytics dashboard coming soon. Track your restaurant's performance, 
                customer engagement, and revenue trends.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
