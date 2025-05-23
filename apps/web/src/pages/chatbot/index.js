import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  MessageSquare, 
  Bot, 
  Star, 
  Users, 
  Clock, 
  Search,
  Filter,
  Zap,
  Brain,
  ChefHat,
  MapPin,
  Heart,
  TrendingUp,
  Play
} from 'lucide-react'
import { SearchField } from '@bellyfed/ui'

export default function ChatbotIndexPage() {
  const router = useRouter()
  const [chatbots, setChatbots] = useState([])
  const [filteredChatbots, setFilteredChatbots] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Mock chatbot data
  useEffect(() => {
    const mockChatbots = [
      {
        id: 1,
        name: 'Chef AI',
        description: 'Your personal cooking assistant for recipes and cooking tips',
        category: 'cooking',
        avatar: '👨‍🍳',
        rating: 4.8,
        users: 15420,
        conversations: 89234,
        status: 'online',
        features: ['Recipe suggestions', 'Cooking tips', 'Ingredient substitutions'],
        languages: ['English', 'Spanish', 'French'],
        lastUpdated: '2024-01-15',
        isPopular: true,
        isFeatured: true
      },
      {
        id: 2,
        name: 'Restaurant Finder',
        description: 'Find the perfect restaurant for any occasion with AI recommendations',
        category: 'discovery',
        avatar: '🔍',
        rating: 4.9,
        users: 23150,
        conversations: 156789,
        status: 'online',
        features: ['Restaurant recommendations', 'Cuisine matching', 'Location search'],
        languages: ['English', 'Mandarin', 'German'],
        lastUpdated: '2024-01-14',
        isPopular: true,
        isFeatured: true
      },
      {
        id: 3,
        name: 'Nutrition Guide',
        description: 'Get personalized nutrition advice and meal planning assistance',
        category: 'health',
        avatar: '🥗',
        rating: 4.7,
        users: 8930,
        conversations: 45123,
        status: 'online',
        features: ['Nutritional analysis', 'Dietary advice', 'Meal planning'],
        languages: ['English', 'Spanish'],
        lastUpdated: '2024-01-13',
        isPopular: false,
        isFeatured: true
      },
      {
        id: 4,
        name: 'Wine Sommelier',
        description: 'Expert wine pairing and selection recommendations',
        category: 'beverages',
        avatar: '🍷',
        rating: 4.6,
        users: 5670,
        conversations: 23456,
        status: 'online',
        features: ['Wine pairing', 'Tasting notes', 'Selection advice'],
        languages: ['English', 'French', 'Italian'],
        lastUpdated: '2024-01-12',
        isPopular: false,
        isFeatured: false
      },
      {
        id: 5,
        name: 'Dietary Assistant',
        description: 'Support for special diets and food allergies',
        category: 'health',
        avatar: '🌱',
        rating: 4.5,
        users: 7890,
        conversations: 34567,
        status: 'online',
        features: ['Allergy management', 'Diet tracking', 'Safe alternatives'],
        languages: ['English', 'German'],
        lastUpdated: '2024-01-11',
        isPopular: false,
        isFeatured: false
      },
      {
        id: 6,
        name: 'Food Critic',
        description: 'Professional food reviews and restaurant analysis',
        category: 'reviews',
        avatar: '📝',
        rating: 4.4,
        users: 3450,
        conversations: 12345,
        status: 'beta',
        features: ['Review analysis', 'Quality assessment', 'Trend insights'],
        languages: ['English'],
        lastUpdated: '2024-01-10',
        isPopular: false,
        isFeatured: false
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setChatbots(mockChatbots)
      setFilteredChatbots(mockChatbots)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter chatbots based on search and category
  useEffect(() => {
    let filtered = chatbots

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bot =>
        bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bot.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(bot => bot.category === selectedCategory)
    }

    setFilteredChatbots(filtered)
  }, [chatbots, searchQuery, selectedCategory])

  const categories = [
    { id: 'all', label: 'All Chatbots', icon: Bot },
    { id: 'cooking', label: 'Cooking', icon: ChefHat },
    { id: 'discovery', label: 'Discovery', icon: MapPin },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'beverages', label: 'Beverages', icon: Zap },
    { id: 'reviews', label: 'Reviews', icon: Star }
  ]

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading chatbots...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 text-orange-500 mr-3" />
              <Bot className="w-12 h-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                AI Chatbots
              </h1>
            </div>
            <p className="text-orange-700 dark:text-orange-300 text-lg mb-6">
              Discover intelligent chatbots to help with cooking, restaurant discovery, nutrition, and more
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={clearSearch}
                placeholder="Search chatbots by name, description, or features..."
                className="text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-orange-100 dark:bg-orange-800 border-b border-orange-200 dark:border-orange-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center mr-4">
              <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Categories:
              </span>
            </div>
            
            {categories.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-orange-700 hover:bg-orange-200 dark:bg-orange-700 dark:text-orange-300 dark:hover:bg-orange-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Chatbots */}
      {selectedCategory === 'all' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Star className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              Featured Chatbots
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {chatbots.filter(bot => bot.isFeatured).map((bot) => (
              <div
                key={bot.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/chatbot/${bot.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-2xl mr-3">
                        {bot.avatar}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {bot.name}
                        </h3>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            bot.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm text-orange-600 dark:text-orange-400 capitalize">
                            {bot.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {bot.isPopular && (
                      <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  <p className="text-orange-700 dark:text-orange-300 text-sm mb-4">
                    {bot.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                      <span className="font-semibold text-orange-900 dark:text-orange-100">
                        {bot.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <Users className="w-4 h-4 mr-1" />
                      {bot.users.toLocaleString()}
                    </div>
                    <div className="flex items-center text-orange-600 dark:text-orange-400">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {bot.conversations.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bot.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {bot.features.length > 2 && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300">
                        +{bot.features.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                    <Play className="w-4 h-4 mr-2" />
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Chatbots */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Bot className="w-6 h-6 text-orange-500 mr-3" />
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {selectedCategory === 'all' ? 'All Chatbots' : `${categories.find(c => c.id === selectedCategory)?.label} Chatbots`}
            </h2>
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">
            {filteredChatbots.length} chatbot{filteredChatbots.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {filteredChatbots.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChatbots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/chatbot/${bot.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-xl mr-3">
                      {bot.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                        {bot.name}
                      </h3>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          bot.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-xs text-orange-600 dark:text-orange-400 capitalize">
                          {bot.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                      {bot.rating}
                    </span>
                  </div>
                </div>
                
                <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
                  {bot.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 mb-3">
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {bot.users.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(bot.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {bot.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full dark:bg-orange-800 dark:text-orange-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <button className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm">
                  Start Chat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
              No chatbots found
            </h3>
            <p className="text-orange-600 dark:text-orange-400 mb-4">
              Try adjusting your search or selecting a different category
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="text-orange-500 hover:text-orange-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-orange-900 border-t border-orange-200 dark:border-orange-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {chatbots.length}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Total Chatbots</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {chatbots.reduce((sum, bot) => sum + bot.users, 0).toLocaleString()}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Total Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {chatbots.reduce((sum, bot) => sum + bot.conversations, 0).toLocaleString()}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Conversations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {(chatbots.reduce((sum, bot) => sum + bot.rating, 0) / chatbots.length).toFixed(1)}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
