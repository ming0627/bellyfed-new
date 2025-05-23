import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  User, 
  Settings, 
  Star, 
  Heart, 
  Camera, 
  Trophy, 
  MapPin, 
  Calendar,
  Edit,
  Share2,
  Download
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'

export default function ProfileIndexPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    reviews: 0,
    photos: 0,
    followers: 0,
    following: 0,
    favorites: 0,
    rankings: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user profile data
  useEffect(() => {
    if (isAuthenticated && user) {
      // Mock data - replace with actual API calls
      const mockStats = {
        reviews: 47,
        photos: 123,
        followers: 234,
        following: 156,
        favorites: 89,
        rankings: 12
      }

      const mockActivity = [
        {
          id: 1,
          type: 'review',
          content: 'Reviewed Truffle Pasta at The Golden Spoon',
          rating: 5,
          date: '2024-01-15',
          restaurant: 'The Golden Spoon'
        },
        {
          id: 2,
          type: 'photo',
          content: 'Added 3 photos to Burger Palace',
          date: '2024-01-14',
          restaurant: 'Burger Palace'
        },
        {
          id: 3,
          type: 'follow',
          content: 'Started following @mikeeats',
          date: '2024-01-13'
        },
        {
          id: 4,
          type: 'favorite',
          content: 'Added Casa España to favorites',
          date: '2024-01-12',
          restaurant: 'Casa España'
        }
      ]

      setTimeout(() => {
        setStats(mockStats)
        setRecentActivity(mockActivity)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'review':
        return <Star className="w-4 h-4 text-orange-500" />
      case 'photo':
        return <Camera className="w-4 h-4 text-blue-500" />
      case 'follow':
        return <User className="w-4 h-4 text-green-500" />
      case 'favorite':
        return <Heart className="w-4 h-4 text-red-500" />
      default:
        return <User className="w-4 h-4 text-orange-500" />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Please Sign In
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            You need to be signed in to view your profile.
          </p>
          <div className="space-x-4">
            <Link
              href="/signin"
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
            >
              Sign Up
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
          <p className="text-orange-600 dark:text-orange-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center">
                <span className="text-3xl text-orange-700 dark:text-orange-300">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400 mb-2">
                    {user?.username || '@username'}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                    {user?.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <Link
                    href="/profile/edit"
                    className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  <button className="flex items-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              {user?.bio && (
                <p className="text-orange-800 dark:text-orange-200 mt-4 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.reviews}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.photos}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Photos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.followers}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.following}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.favorites}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.rankings}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Rankings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/restaurants"
                  className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <Star className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Write Review
                  </span>
                </Link>
                <Link
                  href="/favorites"
                  className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <Heart className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    My Favorites
                  </span>
                </Link>
                <Link
                  href="/rankings"
                  className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <Trophy className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Rankings
                  </span>
                </Link>
                <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
                  <Download className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Export Data
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Recent Activity
                </h3>
                <Link
                  href={`/profile/${user?.id}`}
                  className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-orange-900 dark:text-orange-100">
                        {activity.content}
                        {activity.rating && (
                          <span className="ml-2">
                            {[...Array(activity.rating)].map((_, i) => (
                              <Star key={i} className="inline w-3 h-3 text-orange-500 fill-current" />
                            ))}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Profile Completion
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700 dark:text-orange-300">Progress</span>
                  <span className="text-orange-900 dark:text-orange-100 font-medium">75%</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-2 dark:bg-orange-700">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Profile photo added
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Bio completed
                  </div>
                  <div className="flex items-center text-orange-600 dark:text-orange-400">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Add social links
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      First Review
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Posted your first review
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📸</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Photo Enthusiast
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Uploaded 100+ photos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Social Butterfly
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      100+ followers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
