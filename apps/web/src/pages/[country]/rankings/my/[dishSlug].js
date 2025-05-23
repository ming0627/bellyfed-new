import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Trophy, 
  Star, 
  MapPin, 
  Edit3, 
  Plus, 
  Trash2,
  Save,
  X,
  DragHandleDots2Icon,
  ArrowUp,
  ArrowDown,
  User
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext.js'

export default function MyDishRankingPage() {
  const router = useRouter()
  const { country, dishSlug } = router.query
  const { user, isAuthenticated } = useAuth()
  const [myRanking, setMyRanking] = useState([])
  const [dishInfo, setDishInfo] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for user's personal ranking
  useEffect(() => {
    if (dishSlug && isAuthenticated) {
      const dishName = dishSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      const mockDishInfo = {
        name: dishName,
        description: `Your personal ranking of ${dishName.toLowerCase()} in ${country}`,
        totalRanked: 5,
        lastUpdated: '2024-01-15'
      }

      const mockRanking = [
        {
          id: 1,
          restaurant: 'The Golden Spoon',
          location: 'Downtown',
          rating: 5,
          price: 28,
          notes: 'Absolutely perfect! The truffle flavor is incredible and the pasta is cooked to perfection.',
          visitDate: '2024-01-10',
          rank: 1,
          image: '/images/truffle-pasta-1.jpg'
        },
        {
          id: 2,
          restaurant: 'Casa Italiana',
          location: 'Little Italy',
          rating: 4,
          price: 22,
          notes: 'Great traditional preparation. Authentic flavors but could use a bit more truffle.',
          visitDate: '2024-01-05',
          rank: 2,
          image: '/images/truffle-pasta-2.jpg'
        },
        {
          id: 3,
          restaurant: 'Modern Bistro',
          location: 'Arts District',
          rating: 4,
          price: 24,
          notes: 'Interesting fusion take. Creative presentation but not as traditional as I prefer.',
          visitDate: '2023-12-20',
          rank: 3,
          image: '/images/truffle-pasta-3.jpg'
        },
        {
          id: 4,
          restaurant: 'Nonna\'s Kitchen',
          location: 'Suburbs',
          rating: 3,
          price: 18,
          notes: 'Good value for money. Decent taste but nothing special.',
          visitDate: '2023-12-15',
          rank: 4,
          image: '/images/truffle-pasta-4.jpg'
        },
        {
          id: 5,
          restaurant: 'Fancy Place',
          location: 'Uptown',
          rating: 2,
          price: 35,
          notes: 'Overpriced and underwhelming. Too much focus on presentation, not enough on taste.',
          visitDate: '2023-12-10',
          rank: 5,
          image: '/images/truffle-pasta-5.jpg'
        }
      ]

      // Simulate API call
      setTimeout(() => {
        setDishInfo(mockDishInfo)
        setMyRanking(mockRanking)
        setIsLoading(false)
      }, 1000)
    } else if (!isAuthenticated) {
      setIsLoading(false)
    }
  }, [dishSlug, country, isAuthenticated])

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newRanking = [...myRanking]
      const temp = newRanking[index]
      newRanking[index] = newRanking[index - 1]
      newRanking[index - 1] = temp
      
      // Update ranks
      newRanking[index].rank = index + 1
      newRanking[index - 1].rank = index
      
      setMyRanking(newRanking)
    }
  }

  const handleMoveDown = (index) => {
    if (index < myRanking.length - 1) {
      const newRanking = [...myRanking]
      const temp = newRanking[index]
      newRanking[index] = newRanking[index + 1]
      newRanking[index + 1] = temp
      
      // Update ranks
      newRanking[index].rank = index + 1
      newRanking[index + 1].rank = index + 2
      
      setMyRanking(newRanking)
    }
  }

  const handleRemoveItem = (id) => {
    if (confirm('Are you sure you want to remove this item from your ranking?')) {
      const newRanking = myRanking
        .filter(item => item.id !== id)
        .map((item, index) => ({ ...item, rank: index + 1 }))
      setMyRanking(newRanking)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
      // Update last updated date
      setDishInfo(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString().split('T')[0]
      }))
    } catch (error) {
      console.error('Failed to save ranking:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // TODO: Revert changes if needed
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Sign In to Create Rankings
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Create and manage your personal food rankings.
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
          <p className="text-orange-600 dark:text-orange-400">Loading your ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 mb-6">
            <Link href={`/${country}`} className="hover:text-orange-800 dark:hover:text-orange-200">
              {country}
            </Link>
            <span>/</span>
            <Link href={`/${country}/rankings`} className="hover:text-orange-800 dark:hover:text-orange-200">
              Rankings
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">My Rankings</span>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">{dishInfo?.name}</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-orange-500 mr-3" />
              <Trophy className="w-10 h-10 text-orange-500 mr-3" />
              <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                My {dishInfo?.name} Ranking
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              {dishInfo?.description}
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 text-center mb-6">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dishInfo?.totalRanked}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Items Ranked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dishInfo?.lastUpdated ? new Date(dishInfo.lastUpdated).toLocaleDateString() : 'Never'}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300">Last Updated</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Ranking
                  </button>
                  <button className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium rounded-lg transition-colors"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {myRanking.length > 0 ? (
          <div className="space-y-4">
            {myRanking.map((item, index) => (
              <div
                key={item.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
              >
                <div className="flex items-center space-x-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      item.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900' :
                      item.rank === 2 ? 'bg-gray-100 dark:bg-gray-800' :
                      item.rank === 3 ? 'bg-orange-100 dark:bg-orange-800' :
                      'bg-orange-50 dark:bg-orange-800'
                    }`}>
                      <span className={`text-2xl font-bold ${
                        item.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                        item.rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                        item.rank === 3 ? 'text-orange-600 dark:text-orange-400' :
                        'text-orange-500 dark:text-orange-400'
                      }`}>
                        #{item.rank}
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center">
                      <span className="text-orange-400 text-2xl">🍽️</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-1">
                          {item.restaurant}
                        </h3>
                        <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {item.location}
                        </div>
                        <div className="flex items-center space-x-4 text-sm mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                            <span className="font-medium text-orange-900 dark:text-orange-100">
                              {item.rating}/5
                            </span>
                          </div>
                          <span className="text-orange-600 dark:text-orange-400">
                            ${item.price}
                          </span>
                          <span className="text-orange-500 dark:text-orange-400">
                            Visited {new Date(item.visitDate).toLocaleDateString()}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-orange-700 dark:text-orange-300 text-sm italic">
                            "{item.notes}"
                          </p>
                        )}
                      </div>

                      {/* Edit Controls */}
                      {isEditing && (
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 text-orange-600 hover:text-orange-800 disabled:text-orange-300 dark:text-orange-400 dark:hover:text-orange-200 dark:disabled:text-orange-600"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === myRanking.length - 1}
                            className="p-1 text-orange-600 hover:text-orange-800 disabled:text-orange-300 dark:text-orange-400 dark:hover:text-orange-200 dark:disabled:text-orange-600"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No rankings yet
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              Start building your personal {dishInfo?.name} ranking by adding restaurants you've tried.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Ranking
            </button>
          </div>
        )}

        {/* Tips */}
        {!isEditing && myRanking.length > 0 && (
          <div className="mt-8 bg-orange-100 dark:bg-orange-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
              Tips for Better Rankings
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
              <li>• Add detailed notes about what you liked or disliked</li>
              <li>• Include the date you visited for better tracking</li>
              <li>• Rate consistently using the same criteria</li>
              <li>• Update your rankings as you try new places</li>
              <li>• Share your rankings with friends to get recommendations</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
