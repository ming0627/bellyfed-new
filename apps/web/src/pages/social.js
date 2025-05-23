import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Star, MapPin, Clock, Users, TrendingUp } from 'lucide-react'

export default function SocialPage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('feed')
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for social feed
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        user: {
          id: 1,
          name: 'Sarah Chen',
          username: '@sarahfoodie',
          avatar: '/images/sarah-avatar.jpg',
          isVerified: true
        },
        type: 'review',
        timestamp: '2 hours ago',
        restaurant: {
          id: 1,
          name: 'The Golden Spoon',
          location: 'Downtown'
        },
        dish: {
          id: 1,
          name: 'Truffle Pasta'
        },
        rating: 5,
        content: 'Absolutely incredible! The truffle pasta here is a masterpiece. The aroma hits you before the plate even reaches the table. Every bite is pure luxury. 🍝✨',
        images: ['/images/truffle-pasta-1.jpg', '/images/truffle-pasta-2.jpg'],
        likes: 47,
        comments: 12,
        shares: 8,
        isLiked: false
      },
      {
        id: 2,
        user: {
          id: 2,
          name: 'Mike Rodriguez',
          username: '@mikeats',
          avatar: '/images/mike-avatar.jpg',
          isVerified: false
        },
        type: 'check-in',
        timestamp: '4 hours ago',
        restaurant: {
          id: 2,
          name: 'Casa España',
          location: 'Spanish Quarter'
        },
        content: 'First time trying authentic Spanish tapas! The atmosphere here is incredible and the paella is to die for. Already planning my next visit! 🥘',
        images: ['/images/casa-espana-interior.jpg'],
        likes: 23,
        comments: 5,
        shares: 3,
        isLiked: true
      },
      {
        id: 3,
        user: {
          id: 3,
          name: 'Emma Thompson',
          username: '@emmaeats',
          avatar: '/images/emma-avatar.jpg',
          isVerified: true
        },
        type: 'ranking',
        timestamp: '6 hours ago',
        content: 'Just updated my top 5 burger rankings! Burger Palace takes the crown with their Wagyu creation. The quality is unmatched! 🍔👑',
        ranking: [
          { name: 'Wagyu Burger', restaurant: 'Burger Palace' },
          { name: 'Classic Beef', restaurant: 'Corner Diner' },
          { name: 'Veggie Delight', restaurant: 'Green Garden' }
        ],
        likes: 89,
        comments: 24,
        shares: 15,
        isLiked: false
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
  }

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading social feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                Social Feed
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300">
              Discover what fellow foodies are eating and sharing
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-orange-100 dark:bg-orange-800 rounded-lg p-1">
              {[
                { id: 'feed', label: 'Feed', icon: TrendingUp },
                { id: 'following', label: 'Following', icon: Users },
                { id: 'trending', label: 'Trending', icon: Star }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
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

      {/* Social Feed */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center">
                    <span className="text-orange-700 dark:text-orange-300 font-semibold">
                      {post.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        {post.user.name}
                      </h3>
                      {post.user.isVerified && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                      <span>{post.user.username}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-6 pb-4">
                {/* Restaurant/Dish Info */}
                {post.restaurant && (
                  <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <Link
                        href={`/restaurants/${post.restaurant.id}`}
                        className="font-medium text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
                      >
                        {post.restaurant.name}
                      </Link>
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span className="text-orange-600 dark:text-orange-400">
                        {post.restaurant.location}
                      </span>
                    </div>
                    {post.dish && (
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-orange-600 dark:text-orange-400">Dish:</span>
                        <Link
                          href={`/dishes/${post.dish.id}`}
                          className="font-medium text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100"
                        >
                          {post.dish.name}
                        </Link>
                        {post.rating && (
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < post.rating
                                    ? 'text-orange-500 fill-current'
                                    : 'text-orange-300 dark:text-orange-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Text */}
                <p className="text-orange-800 dark:text-orange-200 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Ranking List */}
                {post.ranking && (
                  <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                      Top Rankings:
                    </h4>
                    <div className="space-y-2">
                      {post.ranking.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium text-orange-800 dark:text-orange-200">
                            {item.name}
                          </span>
                          <span className="text-orange-600 dark:text-orange-400">
                            at {item.restaurant}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${
                      post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                    }`}>
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center"
                        >
                          <span className="text-orange-400 text-4xl">📸</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 border-t border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.isLiked
                          ? 'text-red-500'
                          : 'text-orange-600 hover:text-red-500 dark:text-orange-400 dark:hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{formatNumber(post.likes)}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{formatNumber(post.shares)}</span>
                    </button>
                  </div>

                  <div className="text-sm text-orange-500 dark:text-orange-400">
                    {post.type === 'review' && '📝 Review'}
                    {post.type === 'check-in' && '📍 Check-in'}
                    {post.type === 'ranking' && '🏆 Ranking'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  )
}
