import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Save,
  ArrowLeft,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.js'

export default function SettingsPage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      location: '',
      website: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      reviewReminders: true,
      followNotifications: true,
      rankingUpdates: false,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowFollowers: true,
      allowMessages: true
    },
    preferences: {
      theme: 'system',
      language: 'en',
      currency: 'USD',
      distanceUnit: 'miles',
      defaultLocation: ''
    }
  })

  // Load user settings
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          location: user.location || '',
          website: user.website || ''
        }
      }))
    }
  }, [user])

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = async (category) => {
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      if (category === 'profile') {
        await updateProfile(settings.profile)
      }
      
      // Simulate API call for other settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      console.log(`${category} settings saved successfully`)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            Settings
          </h1>
          <p className="text-orange-700 dark:text-orange-300 mt-2">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-4 sticky top-8">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === id
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-800 dark:text-orange-100'
                        : 'text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8">
              
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      Profile Information
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-orange-200 dark:bg-orange-700 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-orange-700 dark:text-orange-300">
                          {settings.profile.firstName.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <button className="flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors dark:bg-orange-800 dark:hover:bg-orange-700 dark:text-orange-300">
                          <Camera className="w-4 h-4 mr-2" />
                          Change Photo
                        </button>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={settings.profile.firstName}
                          onChange={(e) => handleSettingChange('profile', 'firstName', e.target.value)}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={settings.profile.lastName}
                          onChange={(e) => handleSettingChange('profile', 'lastName', e.target.value)}
                          className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                    </div>

                    {/* Contact Fields */}
                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        value={settings.profile.bio}
                        onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                        <input
                          type="text"
                          value={settings.profile.location}
                          onChange={(e) => handleSettingChange('profile', 'location', e.target.value)}
                          placeholder="City, Country"
                          className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave('profile')}
                        disabled={isSaving}
                        className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Bell className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      Notification Preferences
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-orange-900 dark:text-orange-100">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            {key === 'emailNotifications' && 'Receive notifications via email'}
                            {key === 'pushNotifications' && 'Receive push notifications on your device'}
                            {key === 'reviewReminders' && 'Get reminded to review restaurants you visited'}
                            {key === 'followNotifications' && 'Get notified when someone follows you'}
                            {key === 'rankingUpdates' && 'Get updates about ranking changes'}
                            {key === 'marketingEmails' && 'Receive promotional emails and offers'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-orange-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-orange-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-orange-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-orange-600 peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave('notifications')}
                        disabled={isSaving}
                        className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      Privacy Settings
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={settings.privacy.profileVisibility}
                        onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="public">Public</option>
                        <option value="followers">Followers Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    {Object.entries(settings.privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-orange-900 dark:text-orange-100">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            {key === 'showEmail' && 'Display your email address on your profile'}
                            {key === 'showPhone' && 'Display your phone number on your profile'}
                            {key === 'showLocation' && 'Display your location on your profile'}
                            {key === 'allowFollowers' && 'Allow other users to follow you'}
                            {key === 'allowMessages' && 'Allow other users to send you messages'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-orange-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-orange-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-orange-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-orange-600 peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave('privacy')}
                        disabled={isSaving}
                        className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <div>
                  <div className="flex items-center mb-6">
                    <Globe className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      App Preferences
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Currency
                      </label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Distance Unit
                      </label>
                      <select
                        value={settings.preferences.distanceUnit}
                        onChange={(e) => handleSettingChange('preferences', 'distanceUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                      >
                        <option value="miles">Miles</option>
                        <option value="kilometers">Kilometers</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave('preferences')}
                        disabled={isSaving}
                        className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                Danger Zone
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
