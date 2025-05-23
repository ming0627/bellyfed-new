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
  Zap,
  User
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'

export default function MyExampleMigrationPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [migrationData, setMigrationData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock personal migration example data
  useEffect(() => {
    if (isAuthenticated) {
      const mockMigrationData = {
        title: 'My Personal Migration Journey',
        description: 'Track your progress migrating from the legacy Bellyfed system to the new architecture',
        status: 'in-progress',
        difficulty: 'intermediate',
        estimatedTime: '4-6 hours',
        lastUpdated: '2024-01-15',
        personalProgress: {
          completed: 7,
          total: 12,
          percentage: 58
        },
        mySteps: [
          {
            id: 1,
            title: 'Export My Data',
            description: 'Download all your personal data from the legacy system',
            status: 'completed',
            completedDate: '2024-01-10',
            timeSpent: '30 minutes',
            notes: 'Successfully exported all reviews and favorites'
          },
          {
            id: 2,
            title: 'Set Up New Account',
            description: 'Create your account in the new Bellyfed system',
            status: 'completed',
            completedDate: '2024-01-10',
            timeSpent: '15 minutes',
            notes: 'Used same email address for continuity'
          },
          {
            id: 3,
            title: 'Import Reviews',
            description: 'Transfer your restaurant reviews to the new system',
            status: 'completed',
            completedDate: '2024-01-11',
            timeSpent: '45 minutes',
            notes: 'All 23 reviews imported successfully'
          },
          {
            id: 4,
            title: 'Import Favorites',
            description: 'Move your favorite restaurants and dishes',
            status: 'completed',
            completedDate: '2024-01-11',
            timeSpent: '20 minutes',
            notes: '15 restaurants and 8 dishes imported'
          },
          {
            id: 5,
            title: 'Update Profile',
            description: 'Complete your new profile with preferences',
            status: 'completed',
            completedDate: '2024-01-12',
            timeSpent: '25 minutes',
            notes: 'Added dietary preferences and location'
          },
          {
            id: 6,
            title: 'Connect Social Accounts',
            description: 'Link your social media accounts for sharing',
            status: 'completed',
            completedDate: '2024-01-12',
            timeSpent: '10 minutes',
            notes: 'Connected Instagram and Twitter'
          },
          {
            id: 7,
            title: 'Test New Features',
            description: 'Explore AI recommendations and new discovery tools',
            status: 'completed',
            completedDate: '2024-01-13',
            timeSpent: '60 minutes',
            notes: 'Love the AI recommendations!'
          },
          {
            id: 8,
            title: 'Migrate Photo Albums',
            description: 'Transfer your food photo collections',
            status: 'in-progress',
            startedDate: '2024-01-14',
            timeSpent: '30 minutes',
            notes: 'Working on organizing photos by restaurant'
          },
          {
            id: 9,
            title: 'Update Privacy Settings',
            description: 'Configure your privacy and sharing preferences',
            status: 'pending',
            estimatedTime: '15 minutes'
          },
          {
            id: 10,
            title: 'Join Communities',
            description: 'Find and join food communities that interest you',
            status: 'pending',
            estimatedTime: '30 minutes'
          },
          {
            id: 11,
            title: 'Set Up Notifications',
            description: 'Configure how you want to receive updates',
            status: 'pending',
            estimatedTime: '20 minutes'
          },
          {
            id: 12,
            title: 'Complete Migration',
            description: 'Final verification and cleanup of old account',
            status: 'pending',
            estimatedTime: '45 minutes'
          }
        ],
        achievements: [
          { name: 'Data Explorer', description: 'Successfully exported personal data', earned: true },
          { name: 'Fresh Start', description: 'Created new account', earned: true },
          { name: 'Memory Keeper', description: 'Imported all reviews', earned: true },
          { name: 'Curator', description: 'Imported favorites collection', earned: true },
          { name: 'Profile Master', description: 'Completed detailed profile', earned: true },
          { name: 'Social Connector', description: 'Connected social accounts', earned: true },
          { name: 'Feature Explorer', description: 'Tested new features', earned: true },
          { name: 'Photo Archivist', description: 'Migrated photo albums', earned: false },
          { name: 'Privacy Guardian', description: 'Configured privacy settings', earned: false },
          { name: 'Community Builder', description: 'Joined food communities', earned: false },
          { name: 'Migration Master', description: 'Completed full migration', earned: false }
        ],
        tips: [
          'Take your time with each step - there\'s no rush',
          'Keep notes of any issues you encounter',
          'Test features as you go to ensure everything works',
          'Don\'t delete your old account until migration is complete',
          'Reach out for help if you get stuck on any step'
        ]
      }

      // Simulate API call
      setTimeout(() => {
        setMigrationData(mockMigrationData)
        setIsLoading(false)
      }, 1000)
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in-progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'pending':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Sign In to View Your Migration
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            Track your personal migration progress and get personalized guidance.
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
              Create Account
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
          <p className="text-orange-600 dark:text-orange-400">Loading your migration progress...</p>
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
            <Link href="/my" className="hover:text-orange-800 dark:hover:text-orange-200">
              My Account
            </Link>
            <span>/</span>
            <span className="text-orange-900 dark:text-orange-100">Migration Progress</span>
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
                    Welcome back, {user?.name || 'Food Explorer'}!
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Migration Progress
                  </span>
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    {migrationData.personalProgress.completed} of {migrationData.personalProgress.total} steps completed
                  </span>
                </div>
                <div className="bg-orange-200 dark:bg-orange-800 rounded-full h-3">
                  <div 
                    className="bg-orange-500 rounded-full h-3 transition-all duration-300"
                    style={{ width: `${migrationData.personalProgress.percentage}%` }}
                  ></div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {migrationData.personalProgress.percentage}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export Progress
              </button>
              <Link
                href="/help/migration"
                className="flex items-center px-4 py-2 border-2 border-orange-300 hover:border-orange-400 text-orange-700 font-medium rounded-lg transition-colors dark:border-orange-600 dark:hover:border-orange-500 dark:text-orange-300"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get Help
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex border-b border-orange-200 dark:border-orange-700">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'steps', label: 'Migration Steps' },
                { id: 'achievements', label: 'Achievements' },
                { id: 'tips', label: 'Tips & Help' }
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-4">
                  Your Migration Journey
                </h2>
                <p className="text-orange-700 dark:text-orange-300 mb-6">
                  {migrationData.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {migrationData.personalProgress.completed}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Steps Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {migrationData.mySteps.filter(s => s.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">In Progress</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-800 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {migrationData.personalProgress.total - migrationData.personalProgress.completed}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Remaining</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(migrationData.status)}`}>
                      {migrationData.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Difficulty:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {migrationData.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Est. Time:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {migrationData.estimatedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700 dark:text-orange-300">Last Updated:</span>
                    <span className="font-medium text-orange-900 dark:text-orange-100">
                      {new Date(migrationData.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Migration Steps */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            {migrationData.mySteps.map((step, index) => (
              <div
                key={step.id}
                className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-orange-700 dark:text-orange-300 mb-3">
                        {step.description}
                      </p>
                      
                      {step.notes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                          <p className="text-blue-700 dark:text-blue-300 text-sm">
                            <strong>Notes:</strong> {step.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-orange-600 dark:text-orange-400">
                        {step.completedDate && (
                          <span>Completed: {new Date(step.completedDate).toLocaleDateString()}</span>
                        )}
                        {step.startedDate && !step.completedDate && (
                          <span>Started: {new Date(step.startedDate).toLocaleDateString()}</span>
                        )}
                        {step.timeSpent && (
                          <span>Time spent: {step.timeSpent}</span>
                        )}
                        {step.estimatedTime && step.status === 'pending' && (
                          <span>Estimated: {step.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(step.status)}`}>
                      {step.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {migrationData.achievements.map((achievement, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-orange-900 rounded-lg shadow-sm border p-6 ${
                  achievement.earned 
                    ? 'border-green-200 dark:border-green-800' 
                    : 'border-orange-200 dark:border-orange-800 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    achievement.earned 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}>
                    {achievement.earned ? '🏆' : '🔒'}
                  </div>
                  <h3 className={`font-semibold mb-2 ${
                    achievement.earned 
                      ? 'text-orange-900 dark:text-orange-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm ${
                    achievement.earned 
                      ? 'text-orange-700 dark:text-orange-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {activeTab === 'tips' && (
          <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-6">
            <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-6">
              Migration Tips & Help
            </h2>
            <div className="space-y-4">
              {migrationData.tips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-700 dark:text-orange-300">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-orange-200 dark:border-orange-700">
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-4">
                Need More Help?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/help"
                  className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <FileText className="w-6 h-6 text-orange-500 mr-3" />
                  <div>
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      Help Center
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">
                      Browse our help articles
                    </div>
                  </div>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700"
                >
                  <User className="w-6 h-6 text-orange-500 mr-3" />
                  <div>
                    <div className="font-medium text-orange-900 dark:text-orange-100">
                      Contact Support
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">
                      Get personalized help
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
