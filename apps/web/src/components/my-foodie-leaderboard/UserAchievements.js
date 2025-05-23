/**
 * User Achievements Component
 * 
 * Displays user achievements, badges, milestones, and progress tracking.
 * Shows earned achievements and progress toward upcoming milestones.
 * 
 * Features:
 * - Achievement badges and categories
 * - Progress tracking for milestones
 * - Achievement sharing functionality
 * - Rarity and difficulty indicators
 * - Achievement history timeline
 */

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useAuth } from '../../hooks/useAuth.js';
import { analyticsService } from '../../services/analyticsService.js';

const UserAchievements = ({
  userId = null,
  showProgress = true,
  showSharing = true,
  showCategories = true,
  showRarity = true,
  className = ''
}) => {
  // State
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Context
  const { trackUserEngagement } = useAnalyticsContext();
  const { user } = useAuth();

  // Use current user if no userId provided
  const targetUserId = userId || user?.id;

  // Achievement categories
  const categories = [
    { id: 'all', label: 'All Achievements', icon: '🏆' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' },
    { id: 'discoveries', label: 'Discoveries', icon: '🔍' },
    { id: 'social', label: 'Social', icon: '👥' },
    { id: 'expertise', label: 'Expertise', icon: '👨‍🍳' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
    { id: 'special', label: 'Special', icon: '🌟' }
  ];

  // Rarity levels
  const rarityLevels = [
    { id: 'common', label: 'Common', color: 'bg-gray-500', percentage: 50 },
    { id: 'uncommon', label: 'Uncommon', color: 'bg-green-500', percentage: 25 },
    { id: 'rare', label: 'Rare', color: 'bg-blue-500', percentage: 10 },
    { id: 'epic', label: 'Epic', color: 'bg-purple-500', percentage: 3 },
    { id: 'legendary', label: 'Legendary', color: 'bg-orange-500', percentage: 1 }
  ];

  // Fetch user achievements
  const fetchAchievements = async () => {
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyticsService.getUserAchievements({
        userId: targetUserId,
        includeProgress: showProgress,
        includeRarity: showRarity
      });

      setAchievements(data.achievements || []);
      setProgress(data.progress || []);
      
      // Track achievements view
      trackUserEngagement('achievements', 'user', 'view', {
        userId: targetUserId,
        achievementCount: data.achievements?.length || 0,
        isOwnProfile: targetUserId === user?.id
      });
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  // Handle achievement share
  const handleShareAchievement = async (achievement) => {
    try {
      // In a real app, this would open a share dialog or copy link
      const shareText = `I just earned the "${achievement.title}" achievement on Bellyfed! 🏆`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: shareText,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        alert('Achievement shared to clipboard!');
      }

      trackUserEngagement('achievements', achievement.id, 'share', {
        achievementTitle: achievement.title,
        shareMethod: navigator.share ? 'native' : 'clipboard'
      });
    } catch (err) {
      console.error('Error sharing achievement:', err);
    }
  };

  // Filter achievements by category
  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  // Get rarity info
  const getRarityInfo = (rarity) => {
    return rarityLevels.find(level => level.id === rarity) || rarityLevels[0];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load data on mount
  useEffect(() => {
    fetchAchievements();
  }, [targetUserId]);

  if (loading) {
    return (
      <Card className={`p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-semibold mb-2">Error Loading Achievements</p>
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchAchievements} 
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏆 Achievements
        </h2>
        <p className="text-gray-600">
          {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} unlocked
        </p>
      </div>

      {/* Categories */}
      {showCategories && (
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedCategory === category.id
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const rarityInfo = getRarityInfo(achievement.rarity);
            
            return (
              <Card key={achievement.id} className="p-6 text-center">
                {/* Achievement Icon */}
                <div className="text-6xl mb-4">
                  {achievement.icon || '🏆'}
                </div>

                {/* Achievement Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    <Badge variant="secondary">
                      {categories.find(c => c.id === achievement.category)?.label || achievement.category}
                    </Badge>
                    
                    {showRarity && (
                      <Badge className={`${rarityInfo.color} text-white`}>
                        {rarityInfo.label}
                      </Badge>
                    )}
                    
                    {achievement.points && (
                      <Badge variant="outline">
                        {achievement.points} pts
                      </Badge>
                    )}
                  </div>

                  {/* Earned Date */}
                  <p className="text-xs text-gray-500">
                    Earned on {formatDate(achievement.earnedAt)}
                  </p>
                </div>

                {/* Share Button */}
                {showSharing && (
                  <Button
                    onClick={() => handleShareAchievement(achievement)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Share Achievement
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium mb-2">No Achievements</p>
            <p className="text-sm">
              {selectedCategory === 'all' 
                ? 'No achievements earned yet. Start exploring and reviewing to unlock achievements!'
                : `No achievements in the "${categories.find(c => c.id === selectedCategory)?.label}" category.`
              }
            </p>
          </div>
        </Card>
      )}

      {/* Progress Section */}
      {showProgress && progress.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Progress Toward Next Achievements
          </h3>
          
          <div className="space-y-4">
            {progress.slice(0, 3).map((progressItem) => (
              <div key={progressItem.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{progressItem.icon || '🏆'}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{progressItem.title}</h4>
                    <p className="text-sm text-gray-600">{progressItem.description}</p>
                  </div>
                  <Badge variant="outline">
                    {progressItem.current}/{progressItem.target}
                  </Badge>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((progressItem.current / progressItem.target) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((progressItem.current / progressItem.target) * 100)}% complete
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievement Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Achievement Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{achievements.length}</p>
            <p className="text-sm text-gray-600">Total Earned</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {achievements.reduce((sum, a) => sum + (a.points || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Points</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {achievements.filter(a => a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary').length}
            </p>
            <p className="text-sm text-gray-600">Rare+</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(achievements.map(a => a.category)).size}
            </p>
            <p className="text-sm text-gray-600">Categories</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserAchievements;
