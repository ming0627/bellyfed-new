/**
 * Competition Card Component
 * 
 * Displays a competition in a card format with key information,
 * participation status, and action buttons.
 * 
 * Features:
 * - Competition details display
 * - Participation status
 * - Progress indicators
 * - Action buttons
 * - Responsive design
 */

import React from 'react';
import Link from 'next/link.js';
import { Card, Badge, Button } from '@bellyfed/ui';
import { useAnalyticsContext } from '../analytics/AnalyticsProvider.js';
import { useCountry } from '../../hooks/useCountry.js';

const CompetitionCard = ({
  competition,
  showParticipants = true,
  showProgress = true,
  showActions = true,
  className = ''
}) => {
  const { trackUserEngagement } = useAnalyticsContext();
  const { country } = useCountry();

  // Handle competition click
  const handleCompetitionClick = () => {
    trackUserEngagement('competition', competition.id, 'view', {
      title: competition.title,
      status: competition.status,
      participantCount: competition.participantCount
    });
  };

  // Handle join competition
  const handleJoinCompetition = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    trackUserEngagement('competition', competition.id, 'join_attempt', {
      title: competition.title
    });
    
    // This would typically open a modal or redirect to join page
    console.log('Join competition:', competition.id);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!competition.endDate) return null;
    
    const now = new Date();
    const end = new Date(competition.endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      return 'Ending soon';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'secondary';
      case 'ended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!competition.startDate || !competition.endDate) return 0;
    
    const now = new Date();
    const start = new Date(competition.startDate);
    const end = new Date(competition.endDate);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    
    return Math.round((elapsed / total) * 100);
  };

  const timeRemaining = getTimeRemaining();
  const progressPercentage = getProgressPercentage();

  return (
    <Link href={`/${country}/competitions/${competition.id}`}>
      <Card 
        className={`
          p-6 hover:shadow-lg transition-all duration-200 cursor-pointer
          border-l-4 border-l-orange-500
          ${className}
        `}
        onClick={handleCompetitionClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {competition.title}
              </h3>
              <Badge variant={getStatusColor(competition.status)}>
                {competition.status}
              </Badge>
            </div>
            
            {competition.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {competition.description}
              </p>
            )}
          </div>

          {competition.prize && (
            <div className="text-right ml-4">
              <p className="text-xs text-gray-500">Prize</p>
              <p className="text-lg font-bold text-orange-600">
                {competition.prize}
              </p>
            </div>
          )}
        </div>

        {/* Competition Details */}
        <div className="space-y-3">
          {/* Dates */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Start: </span>
              <span className="font-medium">{formatDate(competition.startDate)}</span>
            </div>
            <div>
              <span className="text-gray-500">End: </span>
              <span className="font-medium">{formatDate(competition.endDate)}</span>
            </div>
          </div>

          {/* Time Remaining */}
          {timeRemaining && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Time Remaining:</span>
              <span className={`
                text-sm font-medium
                ${timeRemaining === 'Ended' ? 'text-red-600' : 'text-orange-600'}
              `}>
                {timeRemaining}
              </span>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && competition.status === 'active' && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Participants */}
          {showParticipants && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Participants:</span>
              <span className="text-sm font-medium">
                {competition.participantCount?.toLocaleString() || 0}
              </span>
            </div>
          )}

          {/* Competition Type */}
          {competition.type && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Type:</span>
              <Badge variant="outline" className="text-xs">
                {competition.type}
              </Badge>
            </div>
          )}

          {/* Categories */}
          {competition.categories && competition.categories.length > 0 && (
            <div>
              <span className="text-sm text-gray-500 block mb-1">Categories:</span>
              <div className="flex flex-wrap gap-1">
                {competition.categories.slice(0, 3).map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
                {competition.categories.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{competition.categories.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {competition.status === 'active' && !competition.isParticipating && (
              <Button
                onClick={handleJoinCompetition}
                size="sm"
                className="flex-1"
              >
                Join Competition
              </Button>
            )}
            
            {competition.isParticipating && (
              <Badge variant="success" className="flex-1 justify-center py-2">
                ✓ Participating
              </Badge>
            )}
            
            {competition.status === 'upcoming' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled
              >
                Coming Soon
              </Button>
            )}
            
            {competition.status === 'ended' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                View Results
              </Button>
            )}
          </div>
        )}

        {/* User's Rank (if participating) */}
        {competition.isParticipating && competition.userRank && (
          <div className="mt-3 p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">Your Rank:</span>
              <span className="text-lg font-bold text-orange-600">
                #{competition.userRank}
              </span>
            </div>
            {competition.userScore && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-orange-700">Score:</span>
                <span className="text-sm font-medium text-orange-700">
                  {competition.userScore}
                </span>
              </div>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
};

export default CompetitionCard;
