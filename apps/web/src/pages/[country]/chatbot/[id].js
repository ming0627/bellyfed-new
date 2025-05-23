import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Refresh
} from 'lucide-react'

export default function ChatbotDetailPage() {
  const router = useRouter()
  const { country, id } = router.query
  const [chatbot, setChatbot] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)

  // Mock chatbot data
  useEffect(() => {
    if (id) {
      const mockChatbots = {
        '1': {
          id: 1,
          name: 'Chef AI',
          description: 'Your personal cooking assistant',
          avatar: '👨‍🍳',
          status: 'online',
          capabilities: ['Recipe suggestions', 'Cooking tips', 'Ingredient substitutions'],
          greeting: 'Hello! I\'m Chef AI, your personal cooking assistant. I can help you with recipes, cooking techniques, and ingredient suggestions. What would you like to cook today?'
        },
        '2': {
          id: 2,
          name: 'Restaurant Finder',
          description: 'Find the perfect restaurant for any occasion',
          avatar: '🔍',
          status: 'online',
          capabilities: ['Restaurant recommendations', 'Cuisine matching', 'Location-based search'],
          greeting: 'Hi there! I\'m Restaurant Finder. I can help you discover amazing restaurants based on your preferences, location, and occasion. What kind of dining experience are you looking for?'
        },
        '3': {
          id: 3,
          name: 'Nutrition Guide',
          description: 'Get nutritional information and dietary advice',
          avatar: '🥗',
          status: 'online',
          capabilities: ['Nutritional analysis', 'Dietary advice', 'Meal planning'],
          greeting: 'Welcome! I\'m your Nutrition Guide. I can provide nutritional information, dietary advice, and help you plan healthy meals. How can I assist you with your nutrition goals today?'
        }
      }

      const selectedBot = mockChatbots[id]
      if (selectedBot) {
        setChatbot(selectedBot)
        setMessages([
          {
            id: 1,
            type: 'bot',
            content: selectedBot.greeting,
            timestamp: new Date(),
            reactions: []
          }
        ])
      }
      setIsLoading(false)
    }
  }, [id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      reactions: []
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsSending(true)

    // Simulate bot response
    setTimeout(() => {
      const botResponses = {
        '1': [ // Chef AI responses
          "That sounds delicious! Let me suggest a recipe for you. What ingredients do you have available?",
          "Great choice! Here's a step-by-step recipe that should take about 30 minutes to prepare.",
          "I'd recommend trying a Mediterranean-style preparation. Would you like me to walk you through it?",
          "For that dish, I suggest using fresh herbs like basil and oregano. The key is to not overcook the vegetables!"
        ],
        '2': [ // Restaurant Finder responses
          "I found several great restaurants in your area! What type of cuisine are you in the mood for?",
          "Based on your preferences, I recommend checking out these highly-rated local spots.",
          "For that occasion, I'd suggest a restaurant with a cozy atmosphere and excellent reviews.",
          "Here are some restaurants that match your criteria, all within 5 miles of your location."
        ],
        '3': [ // Nutrition Guide responses
          "That's a great question about nutrition! Let me break down the nutritional content for you.",
          "For a balanced diet, I recommend including a variety of colorful vegetables and lean proteins.",
          "Based on your dietary goals, here's a meal plan that should work well for you.",
          "The nutritional value of that food is quite good - it's rich in vitamins and minerals."
        ]
      }

      const responses = botResponses[id] || ["I'm here to help! Could you tell me more about what you're looking for?"]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: randomResponse,
        timestamp: new Date(),
        reactions: []
      }

      setMessages(prev => [...prev, botMessage])
      setIsSending(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // TODO: Implement voice recognition
  }

  const addReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
        : msg
    ))
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
    // TODO: Show toast notification
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Chatbot Not Found
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            The chatbot you're looking for doesn't exist or is currently unavailable.
          </p>
          <Link
            href={`/${country}/ai-center`}
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
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/${country}/ai-center`}
                className="mr-4 p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-2xl mr-3">
                  {chatbot.avatar}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    {chatbot.name}
                  </h1>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {chatbot.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                <Star className="w-5 h-5" />
              </button>
              <button className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-orange-900 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-orange-500 dark:text-orange-400">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {message.type === 'bot' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => addReaction(message.id, 'like')}
                          className="p-1 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => addReaction(message.id, 'dislike')}
                          className="p-1 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 text-orange-400 hover:text-orange-600 dark:hover:text-orange-200"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-sm mr-3 order-1 flex-shrink-0">
                    {chatbot.avatar}
                  </div>
                )}
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm ml-3 order-1 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0">
                  {chatbot.avatar}
                </div>
                <div className="bg-white dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-orange-900 border-t border-orange-200 dark:border-orange-800 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${chatbot.name}...`}
                  className="w-full px-4 py-3 pr-12 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100 dark:placeholder-orange-400"
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-1 rounded ${
                      isListening 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-orange-400 hover:text-orange-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button className="p-1 text-orange-400 hover:text-orange-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-orange-400 hover:text-orange-600">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Capabilities */}
          <div className="mt-3 flex flex-wrap gap-2">
            {chatbot.capabilities.map((capability, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(capability)}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors dark:bg-orange-800 dark:text-orange-300 dark:hover:bg-orange-700"
              >
                {capability}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
