import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Trophy, 
  Star, 
  Calendar, 
  Users, 
  Gift,
  Clock,
  Medal,
  Crown,
  Target,
  Zap,
  Camera,
  ChefHat,
  MapPin,
  Award
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.js'

export default function CompetitionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [competitions, setCompetitions] = useState([])
  const [activeTab, setActiveTab] = useState('active')
  const [isLoading, setIsLoading] = useState(true)

  // Mock competitions data
  useEffect(() => {
    const mockCompetitions = {
      active: [
        {
          id: 1,
          title: 'Best Food Photo Challenge',
          description: 'Share your most mouth-watering food photos and win amazing prizes!',
          type: 'photo',
          prize: '$500 Gift Card',
          participants: 1247,
          endDate: '2024-02-15',
          status: 'active',
          difficulty: 'easy',
          requirements: ['Upload original food photo', 'Include restaurant location', 'Write creative caption'],
          image: '/images/photo-contest.jpg',
          sponsor: 'FoodieGram',
          isParticipating: false
        },
        {
          id: 2,
          title: 'Global Cuisine Explorer',
          description: 'Try dishes from 10 different countries and document your journey',
          type: 'challenge',
          prize: 'Premium Membership + $200',
          participants: 892,
          endDate: '2024-03-01',
          status: 'active',
          difficulty: 'medium',
          requirements: ['Visit restaurants from 10 countries', 'Write detailed reviews', 'Upload photos'],
          image: '/images/global-cuisine.jpg',
          sponsor: 'WorldEats',
          isParticipating: true,
          progress: 6
        },
        {
          id: 3,
          title: 'Local Hidden Gems',
          description: 'Discover and review 5 hidden gem restaurants in your city',
          type: 'discovery',
          prize: 'Exclusive Chef Dinner',
          participants: 567,
          endDate: '2024-02-28',
          status: 'active',
          difficulty: 'medium',
          requirements: ['Find restaurants with <50 reviews', 'Write comprehensive reviews', 'Include photos'],
          image: '/images/hidden-gems.jpg',
          sponsor: 'Local Eats',
          isParticipating: false
        }
      ],
      upcoming: [
        {
          id: 4,
          title: 'Street Food Festival',
          description: 'Celebrate street food culture from around the world',
          type: 'festival',
          prize: 'Festival VIP Pass',
          participants: 0,
          startDate: '2024-03-15',
          endDate: '2024-03-22',
          status: 'upcoming',
          difficulty: 'easy',
          requirements: ['Try 5 different street foods', 'Share experiences', 'Vote for favorites'],
          image: '/images/street-food.jpg',
          sponsor: 'Street Eats Co'
        },
        {
          id: 5,
          title: 'Michelin Star Quest',
          description: 'Experience fine dining at Michelin-starred restaurants',
          type: 'premium',
          prize: '$2000 Dining Credit',
          participants: 0,
          startDate: '2024-04-01',
          endDate: '2024-04-30',
          status: 'upcoming',
          difficulty: 'hard',
          requirements: ['Dine at 3 Michelin-starred restaurants', 'Write expert-level reviews', 'Premium membership required'],
          image: '/images/michelin.jpg',
          sponsor: 'Fine Dining Guild'
        }
      ],
      completed: [
        {
          id: 6,
          title: 'New Year Food Resolutions',
          description: 'Try healthy eating and document your journey',
          type: 'health',
          prize: 'Wellness Package',
          participants: 2340,
          endDate: '2024-01-31',
          status: 'completed',
          difficulty: 'medium',
          winner: 'HealthyFoodie23',
          image: '/images/healthy-eating.jpg',
          sponsor: 'WellnessEats'
        },
        {
          id: 7,
          title: 'Holiday Dessert Showcase',
          description: 'Share your favorite holiday desserts and recipes',
          type: 'seasonal',
          prize: 'Baking Equipment Set',
          participants: 1890,
          endDate: '2023-12-31',
          status: 'completed',
          difficulty: 'easy',
          winner: 'SweetTooth_Chef',
          image: '/images/holiday-desserts.jpg',
          sponsor: 'Baker\'s Paradise'
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setCompetitions(mockCompetitions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const joinCompetition = async (competitionId) => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=' + encodeURIComponent(router.asPath))
      return
    }

    try {
      // TODO: Implement actual API call
      setCompetitions(prev => ({
        ...prev,
        active: prev.active.map(comp => 
          comp.id === competitionId 
            ? { ...comp, isParticipating: true, participants: comp.participants + 1 }
            : comp
        )
      }))
    } catch (error) {
      console.error('Failed to join competition:', error)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'photo':
        return Camera
      case 'challenge':
        return Target
      case 'discovery':
        return MapPin
      case 'festival':
        return Gift
      case 'premium':
        return Crown
      case 'health':
        return Zap
      case 'seasonal':
        return Star
      default:
        return Trophy
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading competitions...</p>
        </div>
      </div>
    )
  }

  const currentCompetitions = competitions[activeTab] || []

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="w-16 h-16 mr-4" />
              <Medal className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Food Competitions
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Join exciting food challenges, win amazing prizes, and connect with fellow food enthusiasts from around the world
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">25+</div>
                <div className="text-orange-100">Active Competitions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">15K+</div>
                <div className="text-orange-100">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$50K+</div>
                <div className="text-orange-100">Prizes Awarded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">180+</div>
                <div className="text-orange-100">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-orange-900 border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            {[
              { id: 'active', label: 'Active Competitions', count: competitions.active?.length || 0 },
              { id: 'upcoming', label: 'Upcoming', count: competitions.upcoming?.length || 0 },
              { id: 'completed', label: 'Completed', count: competitions.completed?.length || 0 }
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Competitions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentCompetitions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentCompetitions.map((competition) => {
              const TypeIcon = getTypeIcon(competition.type)
              const isActive = competition.status === 'active'
              const isUpcoming = competition.status === 'upcoming'
              const isCompleted = competition.status === 'completed'

              return (
                <div
                  key={competition.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="aspect-video bg-orange-100 dark:bg-orange-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TypeIcon className="w-16 h-16 text-orange-400" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isActive ? 'bg-green-500 text-white' :
                        isUpcoming ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {competition.status}
                      </span>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(competition.difficulty)}`}>
                        {competition.difficulty}
                      </span>
                    </div>

                    {/* Participation Badge */}
                    {competition.isParticipating && (
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500 text-white">
                          Participating
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                        {competition.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                          {competition.prize}
                        </div>
                      </div>
                    </div>

                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                      {competition.description}
                    </p>

                    {/* Progress Bar (for participating competitions) */}
                    {competition.isParticipating && competition.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-orange-700 dark:text-orange-300">Progress</span>
                          <span className="font-medium text-orange-900 dark:text-orange-100">
                            {competition.progress}/10
                          </span>
                        </div>
                        <div className="bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                          <div 
                            className="bg-orange-500 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${(competition.progress / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Users className="w-4 h-4 mr-1" />
                        {competition.participants.toLocaleString()} participants
                      </div>
                      <div className="flex items-center text-orange-600 dark:text-orange-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {isUpcoming ? (
                          `Starts ${new Date(competition.startDate).toLocaleDateString()}`
                        ) : (
                          `Ends ${new Date(competition.endDate).toLocaleDateString()}`
                        )}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Requirements:
                      </h4>
                      <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                        {competition.requirements.slice(0, 2).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {req}
                          </li>
                        ))}
                        {competition.requirements.length > 2 && (
                          <li className="text-orange-500">
                            +{competition.requirements.length - 2} more requirements
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Winner (for completed competitions) */}
                    {isCompleted && competition.winner && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Winner: {competition.winner}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Sponsor */}
                    <div className="text-xs text-orange-500 dark:text-orange-400 mb-4">
                      Sponsored by {competition.sponsor}
                    </div>

                    {/* Action Button */}
                    {isActive && (
                      <button
                        onClick={() => joinCompetition(competition.id)}
                        disabled={competition.isParticipating}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          competition.isParticipating
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                      >
                        {competition.isParticipating ? 'Participating' : 'Join Competition'}
                      </button>
                    )}

                    {isUpcoming && (
                      <button className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                        Get Notified
                      </button>
                    )}

                    {isCompleted && (
                      <button className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                        View Results
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No {activeTab} competitions
            </h3>
            <p className="text-orange-600 dark:text-orange-400">
              {activeTab === 'active' && 'Check back soon for new competitions!'}
              {activeTab === 'upcoming' && 'New competitions will be announced soon.'}
              {activeTab === 'completed' && 'No completed competitions to show.'}
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8">
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 text-center mb-8">
            How Competitions Work
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                1. Join Competition
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Browse active competitions and join the ones that interest you
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                2. Complete Tasks
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Follow the requirements and complete the competition tasks
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                3. Get Judged
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Community votes and expert judges evaluate submissions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                4. Win Prizes
              </h3>
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                Winners receive amazing prizes and recognition
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
