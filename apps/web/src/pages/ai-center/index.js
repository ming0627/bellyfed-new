import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Brain, 
  MessageSquare, 
  Sparkles, 
  TrendingUp, 
  Star,
  Users,
  Zap,
  ChefHat,
  Search,
  Globe,
  ArrowRight,
  Play
} from 'lucide-react'

export default function AICenterIndexPage() {
  const router = useRouter()
  const [featuredContent, setFeaturedContent] = useState({
    globalInsights: [],
    popularBots: [],
    trendingTopics: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Mock global AI data
  useEffect(() => {
    const mockData = {
      globalInsights: [
        {
          id: 1,
          title: 'Global Food Trends 2024',
          description: 'AI analysis of worldwide culinary trends and emerging cuisines',
          countries: ['USA', 'Japan', 'Italy', 'France', 'Thailand'],
          insights: 'Plant-based fusion cuisine is rising globally',
          confidence: 94
        },
        {
          id: 2,
          title: 'Restaurant Innovation Index',
          description: 'How restaurants worldwide are adapting to changing consumer preferences',
          countries: ['Global'],
          insights: 'Tech integration in dining experiences up 67%',
          confidence: 89
        },
        {
          id: 3,
          title: 'Seasonal Cuisine Patterns',
          description: 'AI-powered analysis of seasonal food preferences across regions',
          countries: ['Europe', 'Asia', 'Americas'],
          insights: 'Comfort food demand peaks in winter months',
          confidence: 91
        }
      ],
      popularBots: [
        {
          id: 1,
          name: 'Global Chef AI',
          description: 'International recipe recommendations and cooking guidance',
          users: 15420,
          rating: 4.8,
          languages: ['English', 'Spanish', 'French', 'Japanese'],
          specialty: 'International Cuisine'
        },
        {
          id: 2,
          name: 'Restaurant Scout',
          description: 'Find restaurants worldwide with AI-powered recommendations',
          users: 23150,
          rating: 4.9,
          languages: ['English', 'Mandarin', 'German', 'Italian'],
          specialty: 'Restaurant Discovery'
        },
        {
          id: 3,
          name: 'Nutrition Oracle',
          description: 'Personalized nutrition advice and meal planning',
          users: 8930,
          rating: 4.7,
          languages: ['English', 'Spanish', 'Portuguese'],
          specialty: 'Health & Nutrition'
        }
      ],
      trendingTopics: [
        {
          id: 1,
          topic: 'Sustainable Dining',
          growth: '+156%',
          description: 'Eco-friendly restaurants and zero-waste cooking',
          regions: ['Europe', 'North America', 'Australia']
        },
        {
          id: 2,
          topic: 'AI-Powered Menus',
          growth: '+89%',
          description: 'Restaurants using AI for dynamic menu optimization',
          regions: ['Asia', 'North America']
        },
        {
          id: 3,
          topic: 'Virtual Food Experiences',
          growth: '+67%',
          description: 'VR dining and virtual cooking classes',
          regions: ['Global']
        },
        {
          id: 4,
          topic: 'Hyper-Local Sourcing',
          growth: '+45%',
          description: 'Farm-to-table with AI supply chain optimization',
          regions: ['Europe', 'North America']
        }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setFeaturedContent(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading AI Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 mr-4" />
              <Sparkles className="w-16 h-16" />
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Global AI Food Center
            </h1>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Discover the future of food with AI-powered insights, recommendations, and trends from around the world
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">50M+</div>
                <div className="text-orange-100">AI Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">180+</div>
                <div className="text-orange-100">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">25+</div>
                <div className="text-orange-100">AI Assistants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">99.2%</div>
                <div className="text-orange-100">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Country Selection */}
      <div className="bg-white dark:bg-orange-900 border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 text-center mb-6">
            Choose Your Country for Personalized AI Experience
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['USA', 'Canada', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Japan', 'Australia', 'Singapore', 'Thailand', 'Brazil'].map((country) => (
              <Link
                key={country}
                href={`/${country.toLowerCase()}/ai-center`}
                className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 group"
              >
                <div className="w-12 h-12 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-300 dark:group-hover:bg-orange-600 transition-colors">
                  <Globe className="w-6 h-6 text-orange-600 dark:text-orange-300" />
                </div>
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  {country}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Global Insights */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
          <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            Global Food Insights
          </h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredContent.globalInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {insight.title}
                </h3>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium dark:bg-green-900 dark:text-green-200">
                  {insight.confidence}% confident
                </div>
              </div>
              
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                {insight.description}
              </p>
              
              <div className="mb-4">
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                  Regions: {insight.countries.join(', ')}
                </div>
                <div className="text-sm font-medium text-orange-900 dark:text-orange-100 bg-orange-50 dark:bg-orange-800 p-2 rounded">
                  💡 {insight.insights}
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                View Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popular AI Assistants */}
      <div className="bg-white dark:bg-orange-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-8">
            <MessageSquare className="w-8 h-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              Popular AI Assistants
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredContent.popularBots.map((bot) => (
              <div
                key={bot.id}
                className="bg-orange-50 dark:bg-orange-800 rounded-lg border border-orange-200 dark:border-orange-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    {bot.name}
                  </h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                    <span className="font-semibold text-orange-900 dark:text-orange-100">
                      {bot.rating}
                    </span>
                  </div>
                </div>
                
                <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                  {bot.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
                    <Users className="w-4 h-4 mr-2" />
                    {bot.users.toLocaleString()} users
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    <strong>Specialty:</strong> {bot.specialty}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">
                    <strong>Languages:</strong> {bot.languages.join(', ')}
                  </div>
                </div>
                
                <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                  <Play className="w-4 h-4 mr-2" />
                  Try Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <Zap className="w-8 h-8 text-orange-500 mr-3" />
          <h2 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            Trending Food Topics
          </h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {featuredContent.trendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  {topic.topic}
                </h3>
                <div className="text-2xl font-bold text-green-600">
                  {topic.growth}
                </div>
              </div>
              
              <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                {topic.description}
              </p>
              
              <div className="text-sm text-orange-600 dark:text-orange-400">
                <strong>Popular in:</strong> {topic.regions.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Experience AI-Powered Food Discovery?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join millions of food lovers using AI to discover their next favorite meal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-orange-500 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
              Get Started Free
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-500 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
