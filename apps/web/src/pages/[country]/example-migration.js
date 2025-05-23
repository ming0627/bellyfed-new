import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  Code, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Copy,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  Zap
} from 'lucide-react'

export default function ExampleMigrationPage() {
  const router = useRouter()
  const { country } = router.query
  const [activeTab, setActiveTab] = useState('overview')
  const [migrationData, setMigrationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock migration example data
  useEffect(() => {
    const mockMigrationData = {
      title: 'Restaurant Component Migration Example',
      description: 'A comprehensive example showing how to migrate a restaurant component from the legacy system to the new Bellyfed architecture',
      status: 'completed',
      difficulty: 'intermediate',
      estimatedTime: '2-3 hours',
      lastUpdated: '2024-01-15',
      steps: [
        {
          id: 1,
          title: 'Analyze Legacy Component',
          description: 'Review the existing restaurant component structure and dependencies',
          status: 'completed',
          code: `// Legacy restaurant component (React Class)
class RestaurantCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isFavorited: false
    };
  }

  handleFavorite = () => {
    this.setState({ isFavorited: !this.state.isFavorited });
  }

  render() {
    const { restaurant } = this.props;
    return (
      <div className="restaurant-card">
        <img src={restaurant.image} alt={restaurant.name} />
        <h3>{restaurant.name}</h3>
        <p>{restaurant.description}</p>
        <button onClick={this.handleFavorite}>
          {this.state.isFavorited ? 'Unfavorite' : 'Favorite'}
        </button>
      </div>
    );
  }
}`,
          notes: [
            'Uses React class component pattern',
            'Basic state management for favorites',
            'Simple CSS classes for styling',
            'No TypeScript types'
          ]
        },
        {
          id: 2,
          title: 'Create Modern Component Structure',
          description: 'Convert to functional component with hooks and TypeScript',
          status: 'completed',
          code: `// Modern restaurant component (Functional + Hooks)
import { useState } from 'react'
import { Star, MapPin, Heart } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  description: string
  image: string
  rating: number
  location: string
  cuisine: string
}

interface RestaurantCardProps {
  restaurant: Restaurant
  onFavorite?: (id: string) => void
}

export function RestaurantCard({ restaurant, onFavorite }: RestaurantCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleFavorite = async () => {
    setIsLoading(true)
    setIsFavorited(!isFavorited)
    onFavorite?.(restaurant.id)
    setIsLoading(false)
  }

  return (
    <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-orange-100 dark:bg-orange-800 relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
        >
          <Heart className={\`w-4 h-4 \${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`} />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
          {restaurant.name}
        </h3>
        <p className="text-orange-700 dark:text-orange-300 text-sm mb-3">
          {restaurant.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-orange-500 fill-current mr-1" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                {restaurant.rating}
              </span>
            </div>
            <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {restaurant.location}
            </div>
          </div>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full dark:bg-orange-800 dark:text-orange-300">
            {restaurant.cuisine}
          </span>
        </div>
      </div>
    </div>
  )
}`,
          notes: [
            'Converted to functional component with hooks',
            'Added TypeScript interfaces for type safety',
            'Implemented modern Tailwind CSS styling',
            'Added loading states and better UX',
            'Used Lucide React icons',
            'Added dark mode support'
          ]
        },
        {
          id: 3,
          title: 'Add Package Exports',
          description: 'Configure proper ES module exports for the component',
          status: 'completed',
          code: `// packages/ui/src/components/RestaurantCard/index.ts
export { RestaurantCard } from './RestaurantCard.js'
export type { RestaurantCardProps } from './RestaurantCard.js'

// packages/ui/src/index.ts
export { RestaurantCard } from './components/RestaurantCard/index.js'
export type { RestaurantCardProps } from './components/RestaurantCard/index.js'

// Usage in application
import { RestaurantCard } from '@bellyfed/ui'

const MyPage = () => {
  return (
    <RestaurantCard 
      restaurant={restaurantData}
      onFavorite={handleFavorite}
    />
  )
}`,
          notes: [
            'Proper ES module exports with .js extensions',
            'Exported both component and types',
            'Configured package.json exports',
            'Easy import from @bellyfed/ui package'
          ]
        },
        {
          id: 4,
          title: 'Update Documentation',
          description: 'Create comprehensive documentation for the migrated component',
          status: 'completed',
          code: `# RestaurantCard Component

## Overview
A modern, accessible restaurant card component with favorite functionality.

## Props
\`\`\`typescript
interface RestaurantCardProps {
  restaurant: Restaurant
  onFavorite?: (id: string) => void
}

interface Restaurant {
  id: string
  name: string
  description: string
  image: string
  rating: number
  location: string
  cuisine: string
}
\`\`\`

## Usage
\`\`\`tsx
import { RestaurantCard } from '@bellyfed/ui'

function RestaurantList({ restaurants }) {
  const handleFavorite = (id: string) => {
    // Handle favorite logic
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {restaurants.map(restaurant => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onFavorite={handleFavorite}
        />
      ))}
    </div>
  )
}
\`\`\`

## Features
- ✅ TypeScript support
- ✅ Dark mode compatible
- ✅ Responsive design
- ✅ Accessibility compliant
- ✅ Loading states
- ✅ Hover animations`,
          notes: [
            'Comprehensive documentation with examples',
            'TypeScript interface documentation',
            'Usage examples and best practices',
            'Feature checklist for clarity'
          ]
        }
      ],
      checklist: [
        { item: 'Analyze legacy component structure', completed: true },
        { item: 'Convert to functional component', completed: true },
        { item: 'Add TypeScript types', completed: true },
        { item: 'Implement modern styling', completed: true },
        { item: 'Add accessibility features', completed: true },
        { item: 'Configure package exports', completed: true },
        { item: 'Write comprehensive tests', completed: false },
        { item: 'Update documentation', completed: true },
        { item: 'Review and optimize performance', completed: false }
      ],
      resources: [
        { title: 'Migration Guidelines', url: '/docs/migration-guide', type: 'internal' },
        { title: 'Component Standards', url: '/docs/component-standards', type: 'internal' },
        { title: 'TypeScript Best Practices', url: 'https://typescript-eslint.io/rules/', type: 'external' },
        { title: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', type: 'external' }
      ]
    }

    // Simulate API call
    setTimeout(() => {
      setMigrationData(mockMigrationData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    // TODO: Show toast notification
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600 dark:text-orange-400">Loading migration example...</p>
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
            <span className="text-orange-900 dark:text-orange-100">Migration Example</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-4">
                <Code className="w-10 h-10 text-orange-500 mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {migrationData.title}
                  </h1>
                  <p className="text-orange-600 dark:text-orange-400">
                    {migrationData.description}
                  </p>
                </div>
              </div>

              {/* Status and Info */}
              <div className="flex items-center space-x-6">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  migrationData.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {migrationData.status}
                </div>
                <div className="text-orange-600 dark:text-orange-400 text-sm">
                  <strong>Difficulty:</strong> {migrationData.difficulty}
                </div>
                <div className="text-orange-600 dark:text-orange-400 text-sm">
                  <strong>Time:</strong> {migrationData.estimatedTime}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button className="flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300">
                <GitBranch className="w-4 h-4 mr-2" />
                Fork
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex border-b border-orange-200 dark:border-orange-700">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'steps', label: 'Migration Steps' },
                { id: 'checklist', label: 'Checklist' },
                { id: 'resources', label: 'Resources' }
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-orange-700 hover:text-orange-900 dark:text-orange-300 dark:hover:text-orange-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
              <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Migration Overview
              </h2>
              <p className="text-orange-700 dark:text-orange-300 mb-4">
                This example demonstrates the complete process of migrating a legacy React class component 
                to a modern functional component with TypeScript, proper styling, and package configuration.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Migration Steps</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {migrationData.checklist.filter(item => item.completed).length}/{migrationData.checklist.length}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Tasks Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {migrationData.estimatedTime}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Estimated Time</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Before You Start
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Make sure you have the latest development environment set up with Node.js 18+, 
                    TypeScript 5+, and the Bellyfed CLI tools installed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Migration Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-8">
            {migrationData.steps.map((step, index) => (
              <div key={step.id} className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold mr-3">
                        {step.id}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          {step.title}
                        </h3>
                        <p className="text-orange-600 dark:text-orange-400 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {step.status}
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{step.code}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(step.code)}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                      Key Points:
                    </h4>
                    <ul className="space-y-1">
                      {step.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex items-start text-orange-700 dark:text-orange-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checklist */}
        {activeTab === 'checklist' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Migration Checklist
            </h2>
            <div className="space-y-3">
              {migrationData.checklist.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {item.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className={`${
                    item.completed 
                      ? 'text-orange-900 dark:text-orange-100' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    {item.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {activeTab === 'resources' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Helpful Resources
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {migrationData.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target={resource.type === 'external' ? '_blank' : '_self'}
                  rel={resource.type === 'external' ? 'noopener noreferrer' : undefined}
                  className="flex items-center p-4 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-orange-500 mr-3" />
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {resource.title}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
