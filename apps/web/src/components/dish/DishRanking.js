/**
 * DishRanking Component
 *
 * A component for displaying and managing dish rankings.
 * It shows global rankings, user rankings, and allows users to add or edit their own ranking.
 *
 * Features:
 * - Display global ranking statistics
 * - Show user's own ranking
 * - Allow users to add or edit their ranking
 * - Display ranking distribution
 * - Show recent rankings from other users
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Award,
  Users,
  Edit,
  Trash2,
  Plus,
  Heart,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Avatar } from '../ui/Avatar.tsx';
import RankingDialog from '../rankings/RankingDialog.js';
import { useUserRanking } from '@bellyfed/hooks';
import { useCountry } from '@bellyfed/hooks';
import { useAuth } from '@bellyfed/hooks';

/**
 * DishRanking component
 *
 * @param {Object} props - Component props
 * @param {string} props.dishId - ID of the dish
 * @param {string} props.dishSlug - Slug of the dish
 * @param {string} props.dishName - Name of the dish
 * @param {string} props.restaurantId - ID of the restaurant
 * @param {string} props.restaurantName - Name of the restaurant
 * @param {Object} props.globalRanking - Global ranking data
 * @param {number} props.globalRanking.averageRank - Average rank (1-5)
 * @param {number} props.globalRanking.totalVotes - Total number of votes
 * @param {Object} props.globalRanking.rankDistribution - Distribution of ranks
 * @param {Array} props.recentRankings - Recent rankings from other users
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const DishRanking = memo(function DishRanking({
  dishId,
  dishSlug,
  dishName,
  restaurantId,
  restaurantName,
  globalRanking = {
    averageRank: 0,
    totalVotes: 0,
    rankDistribution: {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    },
  },
  recentRankings = [],
  className = '',
}) {
  // Get authentication state
  const { isAuthenticated, user } = useAuth();

  // Get country context
  const { getCountryLink } = useCountry();

  // State for ranking dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get user ranking data
  const {
    userRanking,
    isLoading,
    createOrUpdateRanking,
    deleteRanking,
  } = useUserRanking(dishSlug, dishId);

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format taste status for display
  const formatTasteStatus = useCallback((status) => {
    switch (status) {
      case 'loved':
        return { label: 'Loved it', icon: Heart, color: 'text-red-500' };
      case 'liked':
        return { label: 'Liked it', icon: ThumbsUp, color: 'text-green-500' };
      case 'okay':
        return { label: 'It was okay', icon: Meh, color: 'text-yellow-500' };
      case 'disliked':
        return { label: 'Didn\'t like it', icon: ThumbsDown, color: 'text-gray-500' };
      default:
        return { label: 'Not specified', icon: null, color: '' };
    }
  }, []);

  // Get taste status display
  const tasteStatusDisplay = useMemo(() => {
    if (!userRanking?.tasteStatus) return null;
    return formatTasteStatus(userRanking.tasteStatus);
  }, [userRanking, formatTasteStatus]);

  // Calculate rank distribution percentages
  const rankDistributionPercentages = useMemo(() => {
    if (!globalRanking.totalVotes) return {};

    return Object.entries(globalRanking.rankDistribution).reduce((acc, [rank, count]) => {
      acc[rank] = Math.round((count / globalRanking.totalVotes) * 100);
      return acc;
    }, {});
  }, [globalRanking]);

  // Open dialog for creating/editing a ranking
  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  // Close dialog
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);

      await createOrUpdateRanking(data);

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting ranking:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [createOrUpdateRanking]);

  // Handle ranking deletion
  const handleDeleteRanking = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete your ranking?')) {
      try {
        setIsSubmitting(true);

        await deleteRanking();
      } catch (error) {
        console.error('Error deleting ranking:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [deleteRanking]);

  // Get initial data for the dialog
  const getInitialData = useCallback(() => {
    return {
      dishId,
      dishName,
      restaurantId,
      restaurantName,
      rank: userRanking?.rank || null,
      tasteStatus: userRanking?.tasteStatus || null,
      notes: userRanking?.notes || '',
      photoUrls: userRanking?.photoUrls || [],
    };
  }, [dishId, dishName, restaurantId, restaurantName, userRanking]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Award className="w-5 h-5 mr-2"
              aria-hidden="true"
             />
            <h3 className="font-bold text-lg">Rankings</h3>
          </div>

          <Link
            href={getCountryLink(`/rankings/global/${dishSlug}`)}
            className="text-white/90 hover:text-white flex items-center text-sm font-medium transition-colors"
            aria-label={`View all rankings for ${dishName}`}
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1"
              aria-hidden="true"
             />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Global Ranking */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Global Ranking
          </h4>

          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-full mr-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-orange-500 mr-1"  />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {globalRanking.averageRank ? globalRanking.averageRank.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Based on {globalRanking.totalVotes} {globalRanking.totalVotes === 1 ? 'ranking' : 'rankings'}
              </div>

              {/* Rank Distribution */}
              <div className="flex items-center mt-2">
                {[5, 4, 3, 2, 1].map((rank) => (
                  <div key={rank} className="flex flex-col items-center mr-2 last:mr-0">
                    <div className="text-xs text-gray-500 dark:text-gray-400">{rank}</div>
                    <div className="w-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-16"
                        style={{
                          height: `${rankDistributionPercentages[rank] || 0}%`,
                          minHeight: globalRanking.rankDistribution[rank] ? '4px' : '0',
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {rankDistributionPercentages[rank] || 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User's Ranking */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Your Ranking
          </h4>

          {isLoading ? (
            <div className="flex justify-center items-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500"
                aria-label="Loading ranking"
               />
            </div>
          ) : isAuthenticated && userRanking ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {userRanking.rank && (
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full font-bold mr-3">
                      {userRanking.rank}
                    </div>
                  )}

                  {tasteStatusDisplay && (
                    <div className="flex items-center">
                      <tasteStatusDisplay.icon className={`w-4 h-4 mr-1 ${tasteStatusDisplay.color}`}
                       />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {tasteStatusDisplay.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleOpenDialog}
                    className="p-2 text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Edit className="w-4 h-4"  />
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteRanking}
                    className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4"  />
                  </button>
                </div>
              </div>

              {userRanking.notes && (
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {userRanking.notes}
                </div>
              )}

              {userRanking.photoUrls && userRanking.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {userRanking.photoUrls.map((url, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden">
                      <Image
                        src={url}
                        alt={`Photo ${index + 1}`}
                        width={100}
                        height={100}
                        objectFit="cover"
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : isAuthenticated ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
                You haven't ranked this dish yet.
              </p>

              <button
                type="button"
                onClick={handleOpenDialog}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
              >
                <Plus className="w-4 h-4 mr-2"  />
                Add Ranking
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center mb-3">
                Sign in to add your ranking for this dish.
              </p>

              <Link
                href={getCountryLink('/signin')}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Recent Rankings */}
        {recentRankings.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
              <Users className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"  />
              Recent Rankings
            </h4>

            <ul className="space-y-3">
              {recentRankings.map((ranking) => (
                <li key={ranking.id} className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Avatar
                    src={ranking.user.avatarUrl}
                    fallback={ranking.user.name}
                    size="sm"
                    className="mr-3"
                  />

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center">
                      <Link
                        href={getCountryLink(`/profile/${ranking.user.id}`)}
                        className="font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                      >
                        {ranking.user.name}
                      </Link>

                      {ranking.rank && (
                        <div className="ml-2 flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold">
                          {ranking.rank}
                        </div>
                      )}
                    </div>

                    {ranking.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {ranking.notes}
                      </p>
                    )}

                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(ranking.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ranking Dialog */}
      <RankingDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        initialData={getInitialData()}
        isSubmitting={isSubmitting}
        isEditing={!!userRanking}
      />
    </div>
  );
});

export default DishRanking;
