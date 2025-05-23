/**
 * Profile Component
 * 
 * Main user profile component displaying user information, stats, and activities.
 * Supports both viewing own profile and other users' profiles.
 * 
 * Features:
 * - User information and avatar
 * - Activity statistics
 * - Recent reviews and rankings
 * - Follow/unfollow functionality
 * - Profile editing (for own profile)
 * - Achievement badges
 * - Social connections
 */

import React, { useState, useEffect } from 'react'
import { Card, Button, Badge, LoadingSpinner } from './ui/index.js'
import { useAnalyticsContext } from './analytics/AnalyticsProvider.js'
import { useAuth } from '../hooks/useAuth.js'
import { userProfileService } from '../services/userProfileService.js'

const Profile = ({
  userId = null, // If null, shows current user's profile
  showEditButton = true,
  showFollowButton = true,
  showStats = true,
  showRecentActivity = true,
  showAchievements = true,
  className = ''
}) => {
  // State
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Context
  const { trackUserEngagement } = useAnalyticsContext()
  const { user, isAuthenticated } = useAuth()

  // Determine if this is the current user's profile
  const isOwnProfile = !userId || userId === user?.id

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const targetUserId = userId || user?.id
        if (!targetUserId) {
          throw new Error('No user ID provided')
        }

        // Mock profile data (in real app, would fetch from API)
        const mockProfileData = {
          id: targetUserId,
          name: isOwnProfile ? (user?.name || 'Your Name') : 'Sarah Chen',
          email: isOwnProfile ? (user?.email || 'your.email@example.com') : 'sarah.chen@example.com',
          avatar: isOwnProfile ? (user?.avatar || '/images/placeholder-avatar.jpg') : '/images/avatars/sarah.jpg',
          bio: isOwnProfile ? 'Food enthusiast exploring Malaysia\'s culinary scene' : 'Passionate foodie and restaurant reviewer from Kuala Lumpur',
          location: 'Kuala Lumpur, Malaysia',
          joinDate: '2023-06-15',
          isVerified: true,
          stats: {
            reviewsCount: isOwnProfile ? 89 : 156,
            restaurantsVisited: isOwnProfile ? 45 : 78,
            followersCount: isOwnProfile ? 234 : 567,
            followingCount: isOwnProfile ? 123 : 234,
            totalPoints: isOwnProfile ? 2840 : 4250,
            rank: isOwnProfile ? 23 : 1
          },
          achievements: [
            { id: 'reviewer', name: 'Review Master', icon: '📝', level: 'Gold' },
            { id: 'explorer', name: 'Food Explorer', icon: '🗺️', level: 'Silver' },
            { id: 'social', name: 'Social Butterfly', icon: '👥', level: 'Bronze' }
          ],
          recentActivity: [
            {
              id: 'activity_1',
              type: 'review',
              restaurant: 'Nasi Lemak Wanjo',
              dish: 'Nasi Lemak',
              rating: 5,
              timestamp: '2024-01-15T10:30:00Z'
            },
            {
              id: 'activity_2',
              type: 'ranking',
              title: 'Top 5 Char Kway Teow in Penang',
              timestamp: '2024-01-14T15:20:00Z'
            },
            {
              id: 'activity_3',
              type: 'visit',
              restaurant: 'Din Tai Fung',
              timestamp: '2024-01-13T19:45:00Z'
            }
          ],
          preferences: {
            cuisines: ['Malaysian', 'Chinese', 'Japanese'],
            dietaryRestrictions: ['Halal'],
            priceRange: 'mid'
          }
        }

        setProfileData(mockProfileData)

        // Set following status for other users
        if (!isOwnProfile) {
          setIsFollowing(Math.random() > 0.5) // Mock following status
        }

        // Track profile view
        trackUserEngagement('profile', targetUserId, 'view', {
          isOwnProfile,
          viewerUserId: user?.id
        })
      } catch (err) {
        console.error('Error loading profile:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadProfile()
    } else {
      setLoading(false)
    }
  }, [userId, user, isAuthenticated, isOwnProfile, trackUserEngagement])

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to follow users')
      return
    }

    setFollowLoading(true)
    try {
      // Update local state immediately
      setIsFollowing(!isFollowing)
      
      // Update follower count
      setProfileData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount + (isFollowing ? -1 : 1)
        }
      }))

      // Track follow action
      trackUserEngagement('user', profileData.id, isFollowing ? 'unfollow' : 'follow', {
        source: 'profile_page'
      })

      // In real app, would call API
      console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} user ${profileData.id}`)
    } catch (err) {
      console.error('Error toggling follow:', err)
      // Revert on error
      setIsFollowing(isFollowing)
      setProfileData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: prev.stats.followersCount + (isFollowing ? 1 : -1)
        }
      }))
    } finally {
      setFollowLoading(false)
    }
  }

  // Format join date
  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  // Format activity timestamp
  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (!isAuthenticated) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Profile Not Available
        </h3>
        <p className="text-gray-600 mb-4">
          Please sign in to view profiles.
        </p>
        <Button onClick={() => window.location.href = '/signin'}>
          Sign In
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner className="mr-3" />
        <span className="text-gray-600">Loading profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-800">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-3"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">❓</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Profile Not Found
        </h3>
        <p className="text-gray-600">
          The requested profile could not be found.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profileData.avatar}
              alt={profileData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.target.src = '/images/placeholder-avatar.jpg'
              }}
            />
            {profileData.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 mt-1">{profileData.bio}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>📍 {profileData.location}</span>
                  <span>📅 Joined {formatJoinDate(profileData.joinDate)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwnProfile && showEditButton && (
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/profile/edit'}
                  >
                    ✏️ Edit Profile
                  </Button>
                )}
                
                {!isOwnProfile && showFollowButton && (
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                  >
                    {followLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : isFollowing ? (
                      '✓ Following'
                    ) : (
                      '+ Follow'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {showStats && (
        <Card className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profileData.stats.reviewsCount}
              </div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profileData.stats.restaurantsVisited}
              </div>
              <div className="text-sm text-gray-600">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profileData.stats.followersCount}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profileData.stats.followingCount}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profileData.stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                #{profileData.stats.rank}
              </div>
              <div className="text-sm text-gray-600">Rank</div>
            </div>
          </div>
        </Card>
      )}

      {/* Achievements */}
      {showAchievements && profileData.achievements && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Achievements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profileData.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {achievement.name}
                  </h4>
                  <Badge
                    variant={
                      achievement.level === 'Gold' ? 'warning' :
                      achievement.level === 'Silver' ? 'secondary' : 'default'
                    }
                    size="sm"
                  >
                    {achievement.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {showRecentActivity && profileData.recentActivity && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {profileData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-2xl">
                  {activity.type === 'review' ? '📝' :
                   activity.type === 'ranking' ? '🏆' :
                   activity.type === 'visit' ? '📍' : '📱'}
                </div>
                <div className="flex-1 min-w-0">
                  {activity.type === 'review' && (
                    <div>
                      <p className="text-gray-900">
                        Reviewed <span className="font-medium">{activity.dish}</span> at{' '}
                        <span className="font-medium">{activity.restaurant}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${star <= activity.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatActivityTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {activity.type === 'ranking' && (
                    <div>
                      <p className="text-gray-900">
                        Created ranking: <span className="font-medium">{activity.title}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  )}
                  
                  {activity.type === 'visit' && (
                    <div>
                      <p className="text-gray-900">
                        Visited <span className="font-medium">{activity.restaurant}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <Button
              variant="outline"
              onClick={() => window.location.href = `/${isOwnProfile ? 'my-' : ''}activity`}
            >
              View All Activity
            </Button>
          </div>
        </Card>
      )}

      {/* Preferences (only for own profile) */}
      {isOwnProfile && profileData.preferences && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Food Preferences
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Favorite Cuisines</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profileData.preferences.cuisines.map((cuisine) => (
                  <Badge key={cuisine} variant="secondary">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {profileData.preferences.dietaryRestrictions.map((restriction) => (
                  <Badge key={restriction} variant="warning">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Price Range</label>
              <div className="mt-1">
                <Badge variant="default">
                  {profileData.preferences.priceRange === 'budget' ? 'Budget-friendly' :
                   profileData.preferences.priceRange === 'mid' ? 'Mid-range' : 'Premium'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Profile
