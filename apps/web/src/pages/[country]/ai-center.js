import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Brain, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Star,
  MapPin,
  Clock,
  Users,
  Zap,
  ChefHat,
  Search,
  Filter
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function AICenterPage() {
  const router = useRouter()
  const { country } = router.query
  const [activeTab, setActiveTab] = useState('recommendations')
  const [aiData, setAiData] = useState({
    recommendations: [],
    insights: [],
    chatbots: [],
    trends: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Mock AI data
  useEffect(() => {
    const mockAiData = {
      recommendations: [
        {
          id: 1,
          type: 'restaurant',
          title: 'Perfect Match for Your Taste',
          description: 'Based on your recent reviews, you might love this Italian restaurant',
          restaurant: 'Casa Italiana',
          location: 'Downtown',
          rating: 4.8,
          confidence: 95,
          reason: 'Matches your preference for authentic Italian cuisine and cozy atmosphere',
          image: '/images/casa-italiana.jpg'
        },
        {
          id: 2,
          type: 'dish',
          title: 'New Dish Recommendation',
          description: 'Try this trending dish that food lovers with similar taste are raving about',
          dish: 'Truffle Risotto',
          restaurant: 'The Golden Spoon',
          rating: 4.9,
          confidence: 88,
          reason: 'Popular among users who also love pasta dishes',
          image: '/images/truffle-risotto.jpg'
        },
        {
          id: 3,
          type: 'cuisine',
          title: 'Explore New Cuisine',
          description: 'Expand your palate with this cuisine recommendation',
          cuisine: 'Korean BBQ',
          topRestaurant: 'Seoul Kitchen',
          confidence: 76,
          reason: 'Users with similar profiles often enjoy Korean cuisine',
          image: '/images/korean-bbq.jpg'
        }
      ],
      insights: [
        {
          id: 1,
          title: 'Your Taste Profile',
          description: 'You prefer Italian and Mediterranean cuisines with a rating bias toward 4+ star restaurants',
          type: 'profile',
          data: {
            topCuisines: ['Italian', 'Mediterranean', 'French'],
            averageRating: 4.3,
            pricePreference: '$$-$$$'
          }
        },
        {
          id: 2,
          title: 'Dining Patterns',
          description: 'You tend to dine out more on weekends and prefer dinner over lunch',
          type: 'behavior',
          data: {
            preferredTime: 'Evening',
            frequentDays: ['Friday', 'Saturday', 'Sunday'],
            averageSpending: '$45'
          }
        },
        {
          id: 3,
          title: 'Social Influence',
          description: 'Your reviews influence an average of 23 people per review',
          type: 'impact',
          data: {
            influence: 23,
            totalViews: 1247,
            helpfulVotes: 89
          }
        }
      ],
      chatbots: [
        {
          id: 1,
          name: 'Chef AI',
          description: 'Get personalized recipe suggestions and cooking tips',
          type: 'cooking',
          status: 'active',
          conversations: 45,
          rating: 4.7
        },
        {
          id: 2,
          name: 'Restaurant Finder',
          description: 'Find the perfect restaurant for any occasion',
          type: 'discovery',
          status: 'active',
          conversations: 78,
          rating: 4.8
        },
        {
          id: 3,
          name: 'Nutrition Guide',
          description: 'Get nutritional information and dietary advice',
          type: 'health',
          status: 'beta',
          conversations: 23,
          rating: 4.5
        }
      ],
      trends: [
        {
          id: 1,
          title: 'Rising Cuisine: Korean Fusion',
          description: 'Korean fusion restaurants are gaining popularity in your area',
          trend: '+45%',
          period: 'Last 3 months',
          impact: 'high'
        },
        {
          id: 2,
          title: 'Plant-Based Options',
          description: 'Vegetarian and vegan dishes are trending among food enthusiasts',
          trend: '+32%',
          period: 'Last month',
          impact: 'medium'
        },
        {
          id: 3,
          title: 'Late Night Dining',
          description: 'More restaurants are extending hours for late-night dining',
          trend: '+28%',
          period: 'Last 2 months',
          impact: 'medium'
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setAiData(mockAiData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading AI insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 mb-6">
            <Link href={`/${country}`} className="hover:text-orange-800 dark:hover:text-orange-200">
              {country}
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">AI Center</span>
          </nav>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 text-orange-500 mr-3" />
              <Sparkles className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                AI Food Center
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Discover personalized recommendations, insights, and trends powered by artificial intelligence
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder="Ask AI about restaurants, dishes, or cuisines..."
                className="text-lg"
              />
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
              <div className="flex bg-orange-100 dark:bg-orange-800 rounded-lg p-1">
                {[
                  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
                  { id: 'insights', label: 'Insights', icon: TrendingUp },
                  { id: 'chatbots', label: 'AI Assistants', icon: MessageSquare },
                  { id: 'trends', label: 'Trends', icon: Zap }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recommendations */}
        {activeTab === 'recommendations' && (
          <div>
            <div className="flex items-center mb-6">
              <Sparkles className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Personalized Recommendations
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {aiData.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-orange-100 dark:bg-orange-800 flex items-center justify-center relative">
                    <span className="text-orange-400 text-4xl">
                      {rec.type === 'restaurant' ? '🏪' : rec.type === 'dish' ? '🍽️' : '🌍'}
                    </span>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {rec.confidence}% match
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      {rec.title}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                      {rec.description}
                    </p>
                    
                    {rec.restaurant && (
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-orange-900 dark:text-orange-100">
                            {rec.restaurant}
                          </p>
                          {rec.location && (
                            <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              {rec.location}
                            </div>
                          )}
                        </div>
                        {rec.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                            <span className="font-semibold text-orange-900 dark:text-orange-100">
                              {rec.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-800 px-2 py-1 rounded mb-4">
                      {rec.reason}
                    </div>

                    <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div>
            <div className="flex items-center mb-6">
              <TrendingUp className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Your Food Insights
              </h2>
            </div>
            <div className="space-y-6">
              {aiData.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
                >
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 mb-4">
                    {insight.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(insight.data).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-orange-50 dark:bg-orange-800 rounded-lg">
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </div>
                        <div className="text-sm text-orange-700 dark:text-orange-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Assistants */}
        {activeTab === 'chatbots' && (
          <div>
            <div className="flex items-center mb-6">
              <MessageSquare className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                AI Assistants
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {aiData.chatbots.map((bot) => (
                <div
                  key={bot.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/${country}/chatbot/${bot.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      {bot.name}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {bot.status}
                    </div>
                  </div>
                  
                  <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                    {bot.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Users className="w-4 h-4 mr-1" />
                      {bot.conversations} chats
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                      <span className="font-semibold text-orange-900 dark:text-orange-100">
                        {bot.rating}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                    Start Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {activeTab === 'trends' && (
          <div>
            <div className="flex items-center mb-6">
              <Zap className="w-6 h-6 text-orange-500 mr-3" />
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Food Trends
              </h2>
            </div>
            <div className="space-y-4">
              {aiData.trends.map((trend) => (
                <div
                  key={trend.id}
                  className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        {trend.title}
                      </h3>
                      <p className="text-orange-700 dark:text-orange-300 text-sm">
                        {trend.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        trend.impact === 'high' ? 'text-green-600' :
                        trend.impact === 'medium' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {trend.trend}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        {trend.period}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href={`/${country}/ai-center`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <ChefHat className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Recipe AI
              </span>
            </Link>
            <Link
              href={`/${country}/restaurants`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <Search className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Smart Search
              </span>
            </Link>
            <Link
              href={`/${country}/rankings`}
              className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Trend Analysis
              </span>
            </Link>
            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700">
              <Filter className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Smart Filters
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
