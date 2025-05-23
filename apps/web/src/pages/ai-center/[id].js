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
  Clock,
  Globe,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Bookmark
} from 'lucide-react'

export default function AICenterDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [aiDetail, setAiDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeDemo, setActiveDemo] = useState(null)

  // Mock AI detail data
  useEffect(() => {
    if (id) {
      const mockAiDetails = {
        '1': {
          id: 1,
          name: 'Global Chef AI',
          description: 'Advanced AI assistant for international cuisine recommendations and cooking guidance',
          longDescription: 'Our most sophisticated AI chef combines machine learning with culinary expertise from around the world. It analyzes your taste preferences, dietary restrictions, and cooking skills to provide personalized recipe recommendations and step-by-step cooking guidance.',
          category: 'Cooking Assistant',
          rating: 4.8,
          users: 15420,
          languages: ['English', 'Spanish', 'French', 'Japanese', 'Italian'],
          features: [
            'Personalized recipe recommendations',
            'Step-by-step cooking instructions',
            'Ingredient substitution suggestions',
            'Nutritional analysis',
            'Wine pairing recommendations',
            'Cooking technique tutorials'
          ],
          capabilities: [
            'Natural language processing',
            'Image recognition for ingredients',
            'Real-time cooking assistance',
            'Multi-cuisine expertise',
            'Dietary restriction awareness',
            'Skill level adaptation'
          ],
          demos: [
            {
              id: 1,
              title: 'Recipe Recommendation',
              description: 'See how the AI suggests recipes based on your preferences',
              type: 'interactive'
            },
            {
              id: 2,
              title: 'Cooking Guidance',
              description: 'Experience real-time cooking assistance',
              type: 'video'
            },
            {
              id: 3,
              title: 'Ingredient Analysis',
              description: 'Upload a photo and get ingredient suggestions',
              type: 'upload'
            }
          ],
          stats: {
            accuracy: '96.5%',
            responseTime: '< 2s',
            satisfaction: '4.8/5',
            recipes: '50,000+'
          },
          pricing: {
            free: 'Basic recipes and cooking tips',
            premium: 'Advanced features and personalized recommendations',
            enterprise: 'Custom integration for restaurants and food businesses'
          }
        },
        '2': {
          id: 2,
          name: 'Restaurant Scout',
          description: 'AI-powered restaurant discovery and recommendation engine',
          longDescription: 'Restaurant Scout uses advanced algorithms to analyze millions of reviews, menus, and dining preferences to find the perfect restaurant for any occasion. Whether you\'re looking for a romantic dinner or a family-friendly brunch, our AI has you covered.',
          category: 'Restaurant Discovery',
          rating: 4.9,
          users: 23150,
          languages: ['English', 'Mandarin', 'German', 'Italian', 'Portuguese'],
          features: [
            'Location-based recommendations',
            'Cuisine preference matching',
            'Price range filtering',
            'Occasion-specific suggestions',
            'Real-time availability',
            'Review sentiment analysis'
          ],
          capabilities: [
            'Geolocation services',
            'Preference learning',
            'Real-time data processing',
            'Multi-language support',
            'Social integration',
            'Booking assistance'
          ],
          demos: [
            {
              id: 1,
              title: 'Smart Search',
              description: 'Find restaurants using natural language queries',
              type: 'interactive'
            },
            {
              id: 2,
              title: 'Preference Learning',
              description: 'See how the AI learns your dining preferences',
              type: 'simulation'
            }
          ],
          stats: {
            accuracy: '94.2%',
            responseTime: '< 1s',
            satisfaction: '4.9/5',
            restaurants: '2M+'
          },
          pricing: {
            free: 'Basic restaurant search and recommendations',
            premium: 'Advanced filtering and personalized suggestions',
            enterprise: 'API access for travel and hospitality businesses'
          }
        }
      }

      // Simulate API call
      setTimeout(() => {
        setAiDetail(mockAiDetails[id] || null)
        setIsLoading(false)
      }, 1000)
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading AI details...</p>
        </div>
      </div>
    )
  }

  if (!aiDetail) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            AI Assistant Not Found
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            The AI assistant you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/ai-center"
            className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AI Center
          </Link>
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
            <Link href="/ai-center" className="hover:text-orange-800 dark:hover:text-orange-200">
              AI Center
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">{aiDetail.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Brain className="w-12 h-12 text-orange-500 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {aiDetail.name}
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    {aiDetail.category}
                  </p>
                </div>
              </div>
              
              <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
                {aiDetail.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-orange-500 fill-current mr-2" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100">
                    {aiDetail.rating}
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 ml-1">
                    rating
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100">
                    {aiDetail.users.toLocaleString()}
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 ml-1">
                    users
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-orange-500 mr-2" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100">
                    {aiDetail.languages.length}
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 ml-1">
                    languages
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
              <button className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Try Now
              </button>
              <button className="flex items-center px-6 py-3 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-semibold rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300">
                <Bookmark className="w-5 h-5 mr-2" />
                Save
              </button>
              <button className="flex items-center px-6 py-3 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-semibold rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300">
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                About {aiDetail.name}
              </h2>
              <p className="text-orange-700 dark:text-orange-300 leading-relaxed">
                {aiDetail.longDescription}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Key Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiDetail.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Sparkles className="w-4 h-4 text-orange-500 mr-3 flex-shrink-0" />
                    <span className="text-orange-700 dark:text-orange-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                AI Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiDetail.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center">
                    <Brain className="w-4 h-4 text-orange-500 mr-3 flex-shrink-0" />
                    <span className="text-orange-700 dark:text-orange-300">
                      {capability}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demos */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Interactive Demos
              </h2>
              <div className="space-y-4">
                {aiDetail.demos.map((demo) => (
                  <div
                    key={demo.id}
                    className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 hover:bg-orange-50 dark:hover:bg-orange-800 transition-colors cursor-pointer"
                    onClick={() => setActiveDemo(demo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                          {demo.title}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400 text-sm">
                          {demo.description}
                        </p>
                      </div>
                      <Play className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Performance Stats
              </h3>
              <div className="space-y-4">
                {Object.entries(aiDetail.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-orange-600 dark:text-orange-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="font-semibold text-orange-900 dark:text-orange-100">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Supported Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {aiDetail.languages.map((language) => (
                  <span
                    key={language}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm dark:bg-orange-800 dark:text-orange-300"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Pricing Plans
              </h3>
              <div className="space-y-3">
                {Object.entries(aiDetail.pricing).map(([plan, description]) => (
                  <div key={plan}>
                    <div className="font-medium text-orange-900 dark:text-orange-100 capitalize">
                      {plan}
                    </div>
                    <div className="text-orange-600 dark:text-orange-400 text-sm">
                      {description}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                View Pricing Details
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800">
                  <Download className="w-4 h-4 mr-3" />
                  Download Guide
                </button>
                <button className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800">
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Contact Support
                </button>
                <button className="w-full flex items-center px-4 py-2 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors dark:text-orange-300 dark:hover:bg-orange-800">
                  <RotateCcw className="w-4 h-4 mr-3" />
                  Reset Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
