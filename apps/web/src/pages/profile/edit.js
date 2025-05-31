import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Trash2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.js'
import AvatarUpload from '../../components/profile/AvatarUpload.js'

export default function EditProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: ''
    },
    preferences: {
      emailNotifications: true,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      showLocation: true
    }
  })

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        socialLinks: {
          instagram: user.socialLinks?.instagram || '',
          twitter: user.socialLinks?.twitter || '',
          facebook: user.socialLinks?.facebook || ''
        },
        preferences: {
          emailNotifications: user.preferences?.emailNotifications ?? true,
          profileVisibility: user.preferences?.profileVisibility || 'public',
          showEmail: user.preferences?.showEmail ?? false,
          showPhone: user.preferences?.showPhone ?? false,
          showLocation: user.preferences?.showLocation ?? true
        }
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSocialLinkChange = (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const handlePreferenceChange = (preference, value) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [preference]: value
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (profileData.username && !/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (profileData.website && !profileData.website.startsWith('http')) {
      newErrors.website = 'Website URL must start with http:// or https://'
    }

    if (profileData.bio && profileData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      await updateProfile(profileData)
      router.push(`/profile/${user.id}`)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = (avatarResponse) => {
    if (avatarResponse) {
      // Update profile data with new avatar URL
      setProfileData(prev => ({
        ...prev,
        avatarUrl: avatarResponse.avatarUrl,
        thumbnailUrl: avatarResponse.thumbnailUrl
      }))
    } else {
      // Avatar was deleted
      setProfileData(prev => ({
        ...prev,
        avatarUrl: null,
        thumbnailUrl: null
      }))
    }
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Account deletion functionality to be implemented')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Please Sign In
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-4">
            You need to be signed in to edit your profile.
          </p>
          <Link
            href="/signin"
            className="text-orange-500 hover:text-orange-700 font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href={`/profile/${user.id}`}
                className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Profile
              </Link>
              <h1 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                Edit Profile
              </h1>
            </div>
            <button
              onClick={handleSave}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8">
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Profile Photo */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Profile Photo
            </h3>
            <AvatarUpload
              currentAvatarUrl={profileData.avatarUrl}
              onAvatarChange={handleAvatarChange}
              uploadOptions={{
                maxSizeBytes: 2 * 1024 * 1024, // 2MB
                generateThumbnail: true
              }}
            />
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.firstName ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.lastName ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="@username"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.username ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                      errors.email ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                Bio
              </label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                  errors.bio ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-red-600 text-sm">{errors.bio}</p>
                )}
                <p className="text-sm text-orange-600 dark:text-orange-400 ml-auto">
                  {profileData.bio.length}/500
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:text-orange-100 ${
                    errors.website ? 'border-red-300' : 'border-orange-200 dark:border-orange-700'
                  }`}
                />
              </div>
              {errors.website && (
                <p className="text-red-600 text-sm mt-1">{errors.website}</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Social Links
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <input
                  type="text"
                  value={profileData.socialLinks.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="Instagram username"
                  className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                />
              </div>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <input
                  type="text"
                  value={profileData.socialLinks.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="Twitter username"
                  className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                />
              </div>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <input
                  type="text"
                  value={profileData.socialLinks.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="Facebook username"
                  className="w-full pl-10 pr-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
              Privacy Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={profileData.preferences.profileVisibility}
                  onChange={(e) => handlePreferenceChange('profileVisibility', e.target.value)}
                  className="w-full px-3 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-100"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.showEmail}
                    onChange={(e) => handlePreferenceChange('showEmail', e.target.checked)}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-900 dark:text-orange-100">
                    Show email address on profile
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.showPhone}
                    onChange={(e) => handlePreferenceChange('showPhone', e.target.checked)}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-900 dark:text-orange-100">
                    Show phone number on profile
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.preferences.showLocation}
                    onChange={(e) => handlePreferenceChange('showLocation', e.target.checked)}
                    className="rounded border-orange-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-900 dark:text-orange-100">
                    Show location on profile
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleDeleteAccount}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </button>
            
            <button
              onClick={handleSave}
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
    </div>
  )
}
