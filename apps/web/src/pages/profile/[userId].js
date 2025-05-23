import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserMinus,
  Settings,
  Share2,
  Trophy,
  Camera
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'

export default function UserProfilePage() {
  const router = useRouter()
  const { userId } = router.query
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('reviews')
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  // Mock user profile data
  useEffect(() => {
    if (userId) {
      const mockProfile = {
        id: userId,
        firstName: 'Sarah',
        lastName: 'Chen',
        username: '@sarahfoodie',
        bio: 'Food enthusiast exploring the best flavors around the world. Always on the hunt for the perfect dish! 🍽️✨',
        location: 'San Francisco, CA',
        joinDate: '2022-03-15',
        avatar: '/images/sarah-avatar.jpg',
        isVerified: true,
        stats: {
          reviews: 234,
          followers: 1567,
          following: 892,
          photos: 456,
          rankings: 12
        },
        badges: [
          { name: 'Elite Reviewer', icon: '⭐', color: 'bg-yellow-500' },
          { name: 'Photo Master', icon: '📸', color: 'bg-blue-500' },
          { name: 'Local Expert', icon: '🏆', color: 'bg-orange-500' }
        ],
        recentReviews: [
          {
            id: 1,
            restaurant: 'The Golden Spoon',
            dish: 'Truffle Pasta',
            rating: 5,
            content: 'Absolutely incredible! The truffle pasta here is a masterpiece.',
            date: '2024-01-15',
            likes: 47,
            photos: 2
          },
          {
            id: 2,
            restaurant: 'Casa España',
            dish: 'Paella Valenciana',
            rating: 4,
            content: 'Authentic Spanish flavors that transport you to Valencia.',
            date: '2024-01-10',
            likes: 23,
            photos: 1
          }
        ],
        favoriteRestaurants: [
          { id: 1, name: 'The Golden Spoon', cuisine: 'Italian', rating: 4.9 },
          { id: 2, name: 'Casa España', cuisine: 'Spanish', rating: 4.8 },
          { id: 3, name: 'Noodle House', cuisine: 'Japanese', rating: 4.6 }
        ]
      }

      // Simulate API call
      setTimeout(() => {
        setProfile(mockProfile)
        setIsFollowing(Math.random() > 0.5) // Random follow status
        setIsLoading(false)
      }, 1000)
    }
  }, [userId])

  const handleFollow = async () => {
    setIsFollowLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsFollowing(!isFollowing)
      
      // Update follower count
      setProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1
        }
      }))
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const isOwnProfile = currentUser && currentUser.id === userId

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            User Not Found
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            The user profile you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-700 font-medium"
          >
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Profile Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center">
                <span className="text-3xl text-orange-700 dark:text-orange-300">
                  {profile.firstName.charAt(0)}
                </span>
              </div>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400 mb-2">
                    {profile.username}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {profile.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {new Date(profile.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Link
                      href="/profile/edit"
                      className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        disabled={isFollowLoading}
                        className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${
                          isFollowing
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {isFollowLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        ) : isFollowing ? (
                          <UserMinus className="w-4 h-4 mr-2" />
                        ) : (
                          <UserPlus className="w-4 h-4 mr-2" />
                        )}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                      <button className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <button className="flex items-center px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-orange-800 dark:text-orange-200 mt-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.stats.reviews}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.stats.followers}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.stats.following}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.stats.photos}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Photos</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}
                  >
                    <span className="mr-1">{badge.icon}</span>
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-orange-100 dark:bg-orange-800 rounded-lg p-1 mb-8">
          {[
            { id: 'reviews', label: 'Reviews', count: profile.stats.reviews },
            { id: 'photos', label: 'Photos', count: profile.stats.photos },
            { id: 'favorites', label: 'Favorites', count: profile.favoriteRestaurants.length },
            { id: 'rankings', label: 'Rankings', count: profile.stats.rankings }
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {profile.recentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                      {review.dish}
                    </h3>
                    <p className="text-orange-600 dark:text-orange-400">
                      at {review.restaurant}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-orange-500 fill-current'
                            : 'text-orange-300 dark:text-orange-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-orange-800 dark:text-orange-200 mb-4">
                  {review.content}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-orange-600 dark:text-orange-400">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    {review.photos > 0 && (
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Camera className="w-4 h-4 mr-1" />
                        {review.photos} photos
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-orange-600 dark:text-orange-400">
                    <Heart className="w-4 h-4 mr-1" />
                    {review.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="aspect-square bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-700 transition-colors"
              >
                <Camera className="w-8 h-8 text-orange-400" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.favoriteRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  {restaurant.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 dark:text-orange-400">
                    {restaurant.cuisine}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                    <span className="text-orange-900 dark:text-orange-100 font-medium">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Rankings Coming Soon
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              User rankings and leaderboards will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
